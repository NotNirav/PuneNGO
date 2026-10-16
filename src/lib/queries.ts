import "server-only";
import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { getMockPublishedNgos } from "@/lib/demoStore";
import { PUBLIC_NGO_COLUMNS, type PublicNgo } from "@/lib/types";

/** Cache tag for all public NGO data. Admin saves call revalidateTag(NGOS_TAG). */
export const NGOS_TAG = "ngos";

/**
 * All published NGOs, fetched once and cached. Pages filter this list in memory —
 * simple and fast for a city-sized directory (hundreds of rows).
 * Automatically falls back to the built-in demo dataset when Supabase keys are not set.
 */
export const getPublishedNgos = unstable_cache(
  async (): Promise<PublicNgo[]> => {
    try {
      const client = createPublicClient();
      if (client) {
        const { data, error } = await client
          .from("ngos")
          .select(PUBLIC_NGO_COLUMNS.join(","))
          .eq("status", "published")
          .order("name");
        if (!error && data && data.length > 0) {
          return data as unknown as PublicNgo[];
        }
      }
    } catch (err) {
      console.warn("Supabase fetch failed, falling back to demo dataset:", err);
    }
    return getMockPublishedNgos();
  },
  ["published-ngos"],
  { tags: [NGOS_TAG], revalidate: 3600 },
);

export async function getNgoBySlug(slug: string) {
  const all = await getPublishedNgos();
  return all.find((n) => n.slug === slug) ?? null;
}

export async function getFeaturedNgos(limit = 6) {
  const all = await getPublishedNgos();
  const featured = all.filter((n) => n.is_featured);
  return (featured.length ? featured : all).slice(0, limit);
}

/** Number of published NGOs per cause / area slug. */
export async function getCounts() {
  const all = await getPublishedNgos();
  const byCause = new Map<string, number>();
  const byArea = new Map<string, number>();
  for (const n of all) {
    for (const c of n.causes) byCause.set(c, (byCause.get(c) ?? 0) + 1);
    byArea.set(n.area, (byArea.get(n.area) ?? 0) + 1);
  }
  return { total: all.length, byCause, byArea };
}
