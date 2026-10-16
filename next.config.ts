import type { NextConfig } from "next";

let supabaseHost: string | undefined;
try {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const raw = process.env.NEXT_PUBLIC_SUPABASE_URL.trim();
    const formatted = raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw}`;
    supabaseHost = new URL(formatted).hostname;
  }
} catch {
  supabaseHost = undefined;
}

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // NGO photos are served from the public Supabase Storage bucket.
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/ngo-images/**" }]
      : [],
  },
  poweredByHeader: false,
  experimental: {
    // Admin photo uploads go through a server action (images are compressed in the browser first).
    serverActions: { bodySizeLimit: "6mb" },
  },
  // The dev-only "N" badge sits on top of the mobile contact bar; hide it.
  devIndicators: false,
};

export default nextConfig;
