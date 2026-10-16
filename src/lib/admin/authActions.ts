"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { DEFAULT_ADMIN_PASSWORD, DEFAULT_ADMIN_USERNAME, getAdminPath, getSessionKeyMaterial, SESSION_COOKIE, SESSION_TTL_SECONDS } from "./config";
import { verifyPassword } from "./password";
import { createSessionToken } from "./session";

// Simple per-IP throttle (in memory — resets on server restart).
// 5 wrong tries → locked for 10 minutes.
const attempts = new Map<string, { count: number; lockedUntil: number }>();
const MAX_TRIES = 5;
const LOCK_MS = 10 * 60 * 1000;

export type LoginState = { error?: string };

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const adminPath = getAdminPath() || "/admin";
  const material = getSessionKeyMaterial();

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const entry = attempts.get(ip) ?? { count: 0, lockedUntil: 0 };
  if (entry.lockedUntil > Date.now()) {
    return { error: "Too many attempts. Please wait a few minutes and try again." };
  }

  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const expectedUsername = (process.env.ADMIN_USERNAME ?? DEFAULT_ADMIN_USERNAME).trim().toLowerCase();
  const expectedPassword = process.env.ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;

  const usernameOk = username.toLowerCase() === expectedUsername;
  const passwordDirectOk = password === expectedPassword;
  const passwordHashOk = process.env.ADMIN_PASSWORD_HASH
    ? await verifyPassword(password, process.env.ADMIN_PASSWORD_HASH)
    : false;

  const ok = usernameOk && (passwordDirectOk || passwordHashOk);

  if (!ok) {
    entry.count += 1;
    if (entry.count >= MAX_TRIES) {
      entry.count = 0;
      entry.lockedUntil = Date.now() + LOCK_MS;
    }
    attempts.set(ip, entry);
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
    return { error: "Invalid login or password." };
  }

  attempts.delete(ip);
  (await cookies()).set(SESSION_COOKIE, await createSessionToken(material, SESSION_TTL_SECONDS), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: adminPath, // the cookie is only ever sent to the admin panel
    maxAge: SESSION_TTL_SECONDS,
  });
  redirect(adminPath);
}

export async function logoutAction() {
  const adminPath = getAdminPath() ?? "/";
  (await cookies()).set(SESSION_COOKIE, "", { path: adminPath, maxAge: 0 });
  redirect("/");
}
