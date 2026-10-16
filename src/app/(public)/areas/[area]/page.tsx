import type { Metadata } from "next";
import { MapPin, SlidersHorizontal } from "lucide-react";
import { notFound } from "next/navigation";
import { areas, getArea } from "@/config/areas";
import { DirectoryResults } from "@/components/directory/DirectoryResults";
import { PageIntro } from "@/components/layout/PageIntro";
import { ButtonLink } from "@/components/ui/Button";
import { ChipLink } from "@/components/ui/Chip";
import { Container } from "@/components/ui/Container";
import { getPublishedNgos } from "@/lib/queries";

export const revalidate = 3600;
export const dynamicParams = false;

type Props = { params: Promise<{ area: string }> };

export function generateStaticParams() {
  return areas.map((a) => ({ area: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const area = getArea((await params).area);
  if (!area) return {};
  const title = area.slug === "other" ? "NGOs in other parts of Pune" : `NGOs in ${area.name}, Pune`;
  return {
    title,
    description: `Find NGOs in ${area.name}, Pune and contact them directly to donate or volunteer.`,
    alternates: { canonical: `/areas/${area.slug}` },
  };
}

export default async function AreaPage({ params }: Props) {
  const area = getArea((await params).area);
  if (!area) notFound();

  const ngos = (await getPublishedNgos()).filter((n) => n.area === area.slug);
  const title = area.slug === "other" ? "NGOs in other parts of Pune" : `NGOs in ${area.name}`;

  return (
    <>
      <PageIntro
        eyebrow={
          <span className="inline-flex items-center gap-1 rounded-full bg-peach px-3 py-1 text-sm font-semibold text-[#7a3b22]">
            <MapPin className="size-4" aria-hidden /> Pune
          </span>
        }
        title={title}
        aside={
          <ButtonLink href={`/ngos?area=${area.slug}`} variant="outline">
            <SlidersHorizontal aria-hidden /> More filters
          </ButtonLink>
        }
      >
        NGOs based in {area.name}. Contact them directly to donate, volunteer or visit.
      </PageIntro>
      <Container className="py-8">
        <DirectoryResults ngos={ngos} nearest={false} clearHref="/ngos" wide />

        <nav aria-label="Other areas" className="mt-12">
          <h2 className="text-xl">Other areas</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {areas
              .filter((a) => a.slug !== area.slug)
              .map((a) => (
                <li key={a.slug}>
                  <ChipLink href={`/areas/${a.slug}`} tone="outline">
                    {a.name}
                  </ChipLink>
                </li>
              ))}
          </ul>
        </nav>
      </Container>
    </>
  );
}
