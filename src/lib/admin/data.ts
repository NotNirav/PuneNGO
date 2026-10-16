import { createAdminClient, hasRealServiceKey } from "@/lib/supabase/admin";
import { createPublicClient } from "@/lib/supabase/public";
import { getMockAllNgos, getMockNgoById } from "@/lib/demoStore";
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
  try {
    const client = hasRealServiceKey() ? createAdminClient() : createPublicClient();
    if (client) {
      const { data, error } = await client
        .from("ngos")
        .select("id, slug, name, area, causes, status, is_featured, is_sample, logo_url, updated_at")
        .order("updated_at", { ascending: false });
      if (!error && data && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn("Could not list NGOs from cloud, using demo store fallback:", err);
  }
  return getMockAllNgos();
}

export async function getNgoForAdmin(id: string) {
  await requireAdmin();
  if (!id) return null;
  try {
    const client = hasRealServiceKey() ? createAdminClient() : createPublicClient();
    if (client && /^[0-9a-f-]{36}$/i.test(id)) {
      const [{ data: row }, { data: priv }] = await Promise.all([
        client.from("ngos").select("*").eq("id", id).maybeSingle(),
        client.from("ngo_private").select("*").eq("ngo_id", id).maybeSingle(),
      ]);
      if (row) return { row, priv: priv ?? null };
    }
  } catch (err) {
    console.warn("Could not fetch NGO from cloud for admin, using demo store fallback:", err);
  }
  return getMockNgoById(id);
}
