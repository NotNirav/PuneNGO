import type { Metadata } from "next";
import Link from "next/link";
import { areas } from "@/config/areas";
import { CauseGrid } from "@/components/directory/CauseGrid";
import { PageIntro } from "@/components/layout/PageIntro";
import { Container } from "@/components/ui/Container";
import { getCounts } from "@/lib/queries";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Causes & areas",
  description: "Find Pune NGOs by the cause they work for or the area they're in.",
  alternates: { canonical: "/causes" },
};

export default async function CausesPage() {
  const { byCause, byArea } = await getCounts();

  return (
    <>
      <PageIntro title="What do you care about?">Pick a cause to see NGOs in Pune working on it.</PageIntro>
      <Container className="py-10">
        <CauseGrid counts={byCause} />

        <section aria-labelledby="areas-heading" className="mt-14 scroll-mt-24" id="areas">
          <h2 id="areas-heading" className="text-2xl sm:text-3xl">
            Browse by area
          </h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            {areas.map((a) => {
              const n = byArea.get(a.slug) ?? 0;
              return (
                <li key={a.slug}>
                  <Link
                    href={`/areas/${a.slug}`}
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-[15px] font-medium hover:border-cobalt hover:text-cobalt"
                  >
                    {a.name}
                    {n > 0 && <span className="rounded-full bg-ice px-2 text-xs text-cobalt-deep">{n}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </Container>
    </>
  );
}
