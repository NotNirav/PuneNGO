// Signed session tokens using Web Crypto (works in both Edge middleware and Node).
// Token format: "v1.<expiresAtUnix>.<base64url HMAC-SHA256 signature>"

const enc = new TextEncoder();

function toB64Url(bytes: ArrayBuffer) {
  let s = "";
  for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64Url(s: string): Uint8Array<ArrayBuffer> | null {
  try {
    const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}

function hmacKey(material: string) {
  return crypto.subtle.importKey("raw", enc.encode(material), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function createSessionToken(material: string, ttlSeconds: number) {
  const payload = `v1.${Math.floor(Date.now() / 1000) + ttlSeconds}`;
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(material), enc.encode(payload));
  return `${payload}.${toB64Url(sig)}`;
}

export async function verifySessionToken(token: string | undefined, material: string | null): Promise<boolean> {
  if (!token || !material) return false;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return false;
  const exp = Number(parts[1]);
  if (!Number.isFinite(exp) || exp < Date.now() / 1000) return false;
  const sig = fromB64Url(parts[2]);
  if (!sig) return false;
  // crypto.subtle.verify compares in constant time.
  return crypto.subtle.verify("HMAC", await hmacKey(material), sig, enc.encode(`${parts[0]}.${parts[1]}`));
}
