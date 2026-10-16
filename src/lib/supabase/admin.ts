import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export const MISSING_SERVICE_KEY =
  "SUPABASE_SERVICE_ROLE_KEY is missing in .env.local. Copy it from Supabase → Project Settings → API Keys, then restart the dev server.";

export function hasServiceKey() {
  return !!process.env.SUPABASE_SERVICE_ROLE_KEY;
}

/**
 * Full-access client (bypasses Row Level Security). SERVER ONLY — the
 * "server-only" import makes the build fail if a client component imports this.
 * Only call it after requireAdmin().
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error(MISSING_SERVICE_KEY);
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const IMAGE_BUCKET = "ngo-images";
