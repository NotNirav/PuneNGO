import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminPath, getSessionKeyMaterial, SESSION_COOKIE } from "./config";
import { verifySessionToken } from "./session";

export async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySessionToken(token, getSessionKeyMaterial());
}

/**
 * Call at the top of EVERY admin page and server action. Non-admins are
 * redirected to the login page.
 */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) {
    redirect(adminHref("/login"));
  }
}

/** Build a link inside the admin panel, e.g. adminHref("/ngos/new"). */
export function adminHref(path = "/"): string {
  const base = getAdminPath() ?? "/";
  return path === "/" ? base : `${base}${path}`;
}
