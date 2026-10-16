import type { Metadata } from "next";
import { SlidersHorizontal } from "lucide-react";
import { notFound } from "next/navigation";
import { causes, getCause } from "@/config/causes";
import { DirectoryResults } from "@/components/directory/DirectoryResults";
import { PageIntro } from "@/components/layout/PageIntro";
import { ButtonLink } from "@/components/ui/Button";
import { ChipLink } from "@/components/ui/Chip";
import { Container } from "@/components/ui/Container";
import { getPublishedNgos } from "@/lib/queries";

export const revalidate = 3600;
export const dynamicParams = false;

type Props = { params: Promise<{ cause: string }> };

export function generateStaticParams() {
  return causes.map((c) => ({ cause: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cause = getCause((await params).cause);
  if (!cause) return {};
  return {
    title: `${cause.label} NGOs in Pune`,
    description: cause.intro,
    alternates: { canonical: `/causes/${cause.slug}` },
  };
}

export default async function CausePage({ params }: Props) {
  const cause = getCause((await params).cause);
  if (!cause) notFound();

  const ngos = (await getPublishedNgos()).filter((n) => n.causes.includes(cause.slug));

  return (
    <>
      <PageIntro
        eyebrow={<span className="text-4xl" aria-hidden>{cause.emoji}</span>}
        title={`${cause.label} NGOs in Pune`}
        aside={
          <ButtonLink href={`/ngos?cause=${cause.slug}`} variant="outline">
            <SlidersHorizontal aria-hidden /> More filters
          </ButtonLink>
        }
      >
        {cause.intro}
      </PageIntro>
      <Container className="py-8">
        <DirectoryResults ngos={ngos} nearest={false} clearHref="/ngos" wide />

        <nav aria-label="Other causes" className="mt-12">
          <h2 className="text-xl">Other causes</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {causes
              .filter((c) => c.slug !== cause.slug)
              .map((c) => (
                <li key={c.slug}>
                  <ChipLink href={`/causes/${c.slug}`} tone="outline">
                    <span aria-hidden>{c.emoji}</span> {c.label}
                  </ChipLink>
                </li>
              ))}
          </ul>
        </nav>
      </Container>
    </>
  );
}
