import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/**
 * Read-only client using the public (anon/publishable) key.
 * Row Level Security limits it to published NGOs — it can never see drafts
 * or private data, even if a query asks for them.
 */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return null;
  }
  try {
    return createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  } catch (err) {
    console.warn("Could not initialize Supabase public client:", err);
    return null;
  }
}
