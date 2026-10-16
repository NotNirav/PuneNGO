// Helpers to turn stored contact details into working links.
// Numbers are Indian by default: a bare 10-digit number gets +91.

function digits(s: string) {
  return s.replace(/\D/g, "");
}

/** "+91 98xxx xxxxx", "098xxxxxxxx" or "98xxxxxxxx" → "+9198xxxxxxxx". */
export function toE164India(input: string): string {
  let d = digits(input);
  if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  if (d.length === 10) d = `91${d}`;
  return `+${d}`;
}

export function telHref(phone: string) {
  return `tel:${toE164India(phone)}`;
}

export function whatsappHref(number: string, text?: string) {
  const n = toE164India(number).slice(1);
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export function mailHref(email: string, subject?: string) {
  return `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;
}

/** Add https:// if someone typed "example.org". */
export function ensureUrl(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

/** "https://www.example.org/path/" → "example.org/path" for display. */
export function prettyUrl(url: string) {
  return url.replace(/^https?:\/\//i, "").replace(/^www\./, "").replace(/\/$/, "");
}

/** Show "+91 98765 43210" style. */
export function formatPhone(input: string) {
  const e = toE164India(input);
  const m = e.match(/^\+91(\d{5})(\d{5})$/);
  return m ? `+91 ${m[1]} ${m[2]}` : input;
}
