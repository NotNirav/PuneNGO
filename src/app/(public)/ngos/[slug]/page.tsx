import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { areaName } from "@/config/areas";
import { causeLabel } from "@/config/causes";
import { site } from "@/config/site";
import { NgoProfile } from "@/components/ngo/NgoProfile";
import { ensureUrl, toE164India } from "@/lib/contact";
import { getNgoBySlug, getPublishedNgos } from "@/lib/queries";
import type { PublicNgo } from "@/lib/types";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const ngos = await getPublishedNgos();
  return ngos.map((n) => ({ slug: n.slug }));
}

function summary(ngo: PublicNgo) {
  return (
    ngo.tagline ||
    `${ngo.name} is an NGO in ${areaName(ngo.area)}, Pune working on ${ngo.causes.map(causeLabel).join(", ")}.`
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ngo = await getNgoBySlug((await params).slug);
  if (!ngo) return {};
  const title = `${ngo.name} — NGO in ${areaName(ngo.area)}, Pune`;
  const description = summary(ngo);
  const image = ngo.cover_url && !ngo.cover_url.endsWith(".svg") ? ngo.cover_url : undefined;
  return {
    title,
    description,
    alternates: { canonical: `/ngos/${ngo.slug}` },
    openGraph: { title, description, type: "profile", url: `/ngos/${ngo.slug}`, images: image ? [image] : undefined },
    twitter: { card: image ? "summary_large_image" : "summary", title, description },
  };
}

function jsonLd(ngo: PublicNgo) {
  const url = new URL(`/ngos/${ngo.slug}`, site.url).toString();
  const abs = (u: string | null) => (u ? new URL(u, site.url).toString() : undefined);
  const sameAs = [ngo.website, ngo.instagram, ngo.facebook, ngo.linkedin, ngo.youtube].filter(Boolean).map((u) => ensureUrl(u!));
  return {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: ngo.name,
    description: ngo.description,
    url,
    logo: abs(ngo.logo_url),
    image: abs(ngo.cover_url),
    telephone: ngo.phone ? toE164India(ngo.phone) : undefined,
    email: ngo.email ?? undefined,
    foundingDate: ngo.founded_year ? String(ngo.founded_year) : undefined,
    sameAs: sameAs.length ? sameAs : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: ngo.address ?? undefined,
      addressLocality: "Pune",
      addressRegion: site.state,
      addressCountry: site.country,
    },
    geo: ngo.lat != null && ngo.lng != null ? { "@type": "GeoCoordinates", latitude: ngo.lat, longitude: ngo.lng } : undefined,
  };
}

export default async function NgoPage({ params }: Props) {
  const ngo = await getNgoBySlug((await params).slug);
  if (!ngo) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        // JSON.stringify output with "<" escaped so text can't close the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(ngo)).replace(/</g, "\\u003c") }}
      />
      <NgoProfile ngo={ngo} />
    </>
  );
}
