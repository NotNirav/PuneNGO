import { NextResponse, type NextRequest } from "next/server";
import { getAdminPath, getSessionKeyMaterial, INTERNAL_ADMIN_PREFIX, SESSION_COOKIE } from "@/lib/admin/config";
import { verifySessionToken } from "@/lib/admin/session";

/**
 * Hides the admin panel.
 * - Admin pages live at /x-admin/* in the code but are only reachable via the
 *   secret ADMIN_PATH. Direct /x-admin requests get the normal 404.
 * - Without a valid session every admin URL (except ADMIN_PATH/login) is the
 *   normal 404 — no redirect, so nobody can tell an admin panel exists.
 */

const startsWith = (path: string, prefix: string) => path === prefix || path.startsWith(`${prefix}/`);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const adminPath = getAdminPath() || "/admin";
  if (startsWith(pathname, INTERNAL_ADMIN_PREFIX)) {
    return NextResponse.redirect(new URL(adminPath, req.url));
  }

  if (!adminPath || !startsWith(pathname, adminPath)) return NextResponse.next();

  const sub = pathname.slice(adminPath.length) || "/";
  const authed = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value, getSessionKeyMaterial());

  if (sub === "/login") {
    if (authed) return NextResponse.redirect(new URL(adminPath, req.url));
  } else if (!authed) {
    return NextResponse.redirect(new URL(`${adminPath}/login`, req.url));
  }

  const url = req.nextUrl.clone();
  url.pathname = sub === "/" ? INTERNAL_ADMIN_PREFIX : `${INTERNAL_ADMIN_PREFIX}${sub}`;
  const res = NextResponse.rewrite(url);
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|samples/|robots.txt|sitemap.xml).*)"],
};
