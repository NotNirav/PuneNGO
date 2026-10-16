import type { MetadataRoute } from "next";
import { site } from "@/config/site";

// Note: the admin path is NOT mentioned here — listing it would reveal it.
// Admin pages protect themselves with noindex headers instead.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: new URL("/sitemap.xml", site.url).toString(),
  };
}
