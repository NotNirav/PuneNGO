// Shared by middleware (Edge runtime) and server code — no Node-only imports here.

/** Where the admin pages really live in src/app. Never reachable directly (middleware 404s it). */
export const INTERNAL_ADMIN_PREFIX = "/x-admin";

export const SESSION_COOKIE = "ngc_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export const DEFAULT_ADMIN_USERNAME = "pccoeadmin";
export const DEFAULT_ADMIN_PASSWORD = "admin@123";

/**
 * The public path of the admin panel. Defaults to "/admin".
 */
export function getAdminPath(): string {
  const p = process.env.ADMIN_PATH?.trim().replace(/\/+$/, "");
  if (p && /^\/[A-Za-z0-9_-]{3,64}$/.test(p)) return p;
  return "/admin";
}

/** Signing key material. Uses environment secrets with fallback to ensure reliable operation. */
export function getSessionKeyMaterial(): string {
  const secret = process.env.ADMIN_SESSION_SECRET || "ngoconnect-pccoe-admin-session-signing-secret-key-material";
  const hash = process.env.ADMIN_PASSWORD_HASH || "scrypt:3d75dc271b0dcdcaa3dafdbc709b5b1f:43aa45948694ee310a9b9fc53370260c1b45eb408622362d96f6238dca64dc886d7208568df2c8ebf97ffdf727c351d17e7bb79bb3856a983afd7e6c5f1c78c1";
  return `${secret}|${hash}`;
}
