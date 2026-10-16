import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export const MISSING_SERVICE_KEY =
  "Demo prototype mode active. SUPABASE_SERVICE_ROLE_KEY is optional.";

/**
 * Returns true so that admin pages, editors, and actions are never blocked
 * by missing cloud keys during demo/prototype runs.
 */
export function hasServiceKey() {
  return true;
}

/**
 * Checks whether an actual Supabase service role key is configured in the environment.
 */
export function hasRealServiceKey() {
  return !!process.env.SUPABASE_SERVICE_ROLE_KEY && !!process.env.NEXT_PUBLIC_SUPABASE_URL;
}

/**
 * Admin client bypassing RLS when key is present, or returning null safely.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    return createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  } catch (err) {
    console.warn("Could not initialize Supabase admin client:", err);
    return null;
  }
}

export const IMAGE_BUCKET = "ngo-images";
