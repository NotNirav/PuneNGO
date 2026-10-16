import type { Metadata } from "next";
import { DirectoryFilters } from "@/components/directory/DirectoryFilters";
import { DirectoryResults } from "@/components/directory/DirectoryResults";
import { Container } from "@/components/ui/Container";
import { applyFilters, parseFilters } from "@/lib/filters";
import { getPublishedNgos } from "@/lib/queries";

export const metadata: Metadata = {
  title: "All NGOs in Pune",
  description: "Browse NGOs in Pune by cause, area and ways to help. Contact them directly to donate or volunteer.",
  alternates: { canonical: "/ngos" },
};

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseFilters(await searchParams);
  const results = applyFilters(await getPublishedNgos(), filters);

  return (
    <Container className="py-8 sm:py-10">
      <h1 className="text-3xl sm:text-4xl">All NGOs in Pune</h1>
      <p className="mt-2 text-muted">Filter by cause, area or how you&apos;d like to help.</p>

      <div className="mt-6 grid gap-5 lg:grid-cols-[300px_1fr] lg:grid-rows-[auto_1fr] lg:[grid-template-areas:'sidebar_search'_'sidebar_results']">
        <DirectoryFilters filters={filters} resultCount={results.length} />
        <div className="lg:[grid-area:results]">
          <DirectoryResults ngos={results} nearest={filters.sort === "nearest"} clearHref="/ngos" />
        </div>
      </div>
    </Container>
  );
}
