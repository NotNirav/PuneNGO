import type { MetadataRoute } from "next";
import { areas } from "@/config/areas";
import { causes } from "@/config/causes";
import { site } from "@/config/site";
import { getPublishedNgos } from "@/lib/queries";

export const revalidate = 3600;

// Public pages only. The admin path is deliberately never listed.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = (path: string) => new URL(path, site.url).toString();
  const ngos = await getPublishedNgos();

  return [
    { url: url("/"), changeFrequency: "daily", priority: 1 },
    { url: url("/ngos"), changeFrequency: "daily", priority: 0.9 },
    { url: url("/causes"), changeFrequency: "weekly", priority: 0.7 },
    { url: url("/about"), changeFrequency: "monthly", priority: 0.4 },
    { url: url("/list-your-ngo"), changeFrequency: "monthly", priority: 0.5 },
    ...causes.map((c) => ({ url: url(`/causes/${c.slug}`), changeFrequency: "weekly" as const, priority: 0.6 })),
    ...areas.map((a) => ({ url: url(`/areas/${a.slug}`), changeFrequency: "weekly" as const, priority: 0.5 })),
    ...ngos.map((n) => ({ url: url(`/ngos/${n.slug}`), lastModified: n.updated_at, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
