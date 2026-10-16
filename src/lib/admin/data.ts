import { createAdminClient, hasServiceKey } from "@/lib/supabase/admin";
import { createPublicClient } from "@/lib/supabase/public";
import { requireAdmin } from "./auth";

export type AdminNgoListItem = {
  id: string;
  slug: string;
  name: string;
  area: string | null;
  causes: string[];
  status: string;
  is_featured: boolean;
  is_sample: boolean;
  logo_url: string | null;
  updated_at: string;
};

export async function listAllNgos(): Promise<AdminNgoListItem[]> {
  await requireAdmin();
  const client = hasServiceKey() ? createAdminClient() : createPublicClient();
  const { data, error } = await client
    .from("ngos")
    .select("id, slug, name, area, causes, status, is_featured, is_sample, logo_url, updated_at")
    .order("updated_at", { ascending: false });
  if (error) {
    console.warn("Could not list NGOs:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getNgoForAdmin(id: string) {
  await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const db = createAdminClient();
  const [{ data: row, error }, { data: priv }] = await Promise.all([
    db.from("ngos").select("*").eq("id", id).maybeSingle(),
    db.from("ngo_private").select("*").eq("ngo_id", id).maybeSingle(),
  ]);
  if (error) throw new Error(error.message);
  return row ? { row, priv } : null;
}
