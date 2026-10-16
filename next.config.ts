import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

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
