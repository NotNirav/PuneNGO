"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { areas } from "@/config/areas";
import { causes } from "@/config/causes";
import { helpTypes } from "@/config/helpTypes";
import { activeFilterCount, filtersToSearch, type DirectoryFilters as Filters, type SortKey } from "@/lib/filters";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { ToggleChip } from "@/components/ui/Chip";
import { Input, Select } from "@/components/ui/Field";

/**
 * Search bar + filter panel. Every change updates the URL (?cause=…&area=…),
 * so any filtered view can be shared as a link. Desktop: sidebar. Mobile: bottom sheet.
 */
export function DirectoryFilters({ filters, resultCount }: { filters: Filters; resultCount: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(filters.q);
  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetRef = useRef<HTMLDialogElement>(null);

  // Keep the search box in sync when the URL changes (e.g. "clear filters").
  useEffect(() => setQ(filters.q), [filters.q]);

  const go = (next: Partial<Filters>) => {
    const url = `/ngos${filtersToSearch({ ...filters, ...next })}`;
    startTransition(() => router.replace(url, { scroll: false }));
  };

  // Debounced search-as-you-type.
  useEffect(() => {
    if (q.trim() === filters.q) return;
    const t = setTimeout(() => go({ q: q.trim() }), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  useEffect(() => {
    const el = sheetRef.current;
    if (!el) return;
    if (sheetOpen && !el.open) el.showModal();
    if (!sheetOpen && el.open) el.close();
  }, [sheetOpen]);

  const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const count = activeFilterCount(filters) - (filters.q ? 1 : 0);

  const panel = (prefix: string) => (
    <div className="flex flex-col gap-6">
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Cause</legend>
        <div className="flex flex-wrap gap-2">
          {causes.map((c) => (
            <ToggleChip
              key={c.slug}
              selected={filters.causes.includes(c.slug)}
              onClick={() => go({ causes: toggle(filters.causes, c.slug) })}
            >
              <span aria-hidden>{c.emoji}</span> {c.label}
            </ToggleChip>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${prefix}-area`} className="text-sm font-semibold">
          Area
        </label>
        <Select id={`${prefix}-area`} value={filters.area} onChange={(e) => go({ area: e.target.value })}>
          <option value="">All of Pune</option>
          {areas.map((a) => (
            <option key={a.slug} value={a.slug}>
              {a.name}
            </option>
          ))}
        </Select>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Ways to help</legend>
        <div className="flex flex-wrap gap-2">
          {helpTypes.map((h) => (
            <ToggleChip key={h.slug} selected={filters.help.includes(h.slug)} onClick={() => go({ help: toggle(filters.help, h.slug) })}>
              {h.label}
            </ToggleChip>
          ))}
        </div>
      </fieldset>

      {count > 0 && (
        <Button variant="ghost" size="sm" className="self-start" onClick={() => go({ causes: [], area: "", help: [] })}>
          <X aria-hidden /> Clear filters
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Search + sort + mobile filter button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:[grid-area:search]">
        <form
          role="search"
          className="relative flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            go({ q: q.trim() });
          }}
        >
          <label htmlFor="dir-q" className="sr-only">
            Search NGOs
          </label>
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden />
          <Input
            id="dir-q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, cause or area"
            className="h-12 pl-11"
          />
        </form>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="h-12 flex-1 lg:hidden"
            onClick={() => setSheetOpen(true)}
            aria-haspopup="dialog"
          >
            <SlidersHorizontal aria-hidden /> Filters
            {count > 0 && <span className="grid size-5 place-items-center rounded-full bg-cobalt text-xs text-white">{count}</span>}
          </Button>
          <label htmlFor="dir-sort" className="sr-only">
            Sort by
          </label>
          <Select
            id="dir-sort"
            value={filters.sort}
            onChange={(e) => go({ sort: e.target.value as SortKey })}
            className="h-12 flex-1 sm:w-48"
          >
            <option value="az">Sort: A–Z</option>
            <option value="recent">Sort: Recently added</option>
            <option value="nearest">Sort: Nearest to me</option>
          </Select>
        </div>
      </div>

      {/* Desktop sidebar — placed in the page's left column via grid areas */}
      <aside
        aria-label="Filters"
        className={cn(
          "hidden self-start rounded-card bg-white p-5 shadow-soft lg:sticky lg:top-24 lg:block lg:[grid-area:sidebar]",
          pending && "opacity-70",
        )}
      >
        <h2 className="mb-4 text-lg">Filters</h2>
        {panel("side")}
      </aside>

      {/* Mobile bottom sheet */}
      <dialog
        ref={sheetRef}
        onClose={() => setSheetOpen(false)}
        onClick={(e) => e.target === sheetRef.current && setSheetOpen(false)}
        aria-label="Filters"
        className="mb-0 mt-auto max-h-[85dvh] w-full max-w-none rounded-t-[28px] bg-paper p-0 backdrop:bg-ink/40 lg:hidden"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-paper px-5 py-4">
          <h2 className="text-xl">Filters</h2>
          <button type="button" onClick={() => setSheetOpen(false)} aria-label="Close filters" className="rounded-full p-1 hover:bg-ice">
            <X className="size-6" />
          </button>
        </div>
        <div className="px-5 py-5">{panel("sheet")}</div>
        <div className="sticky bottom-0 border-t border-line bg-paper p-4">
          <Button className="w-full" onClick={() => setSheetOpen(false)}>
            Show {resultCount === 1 ? "1 NGO" : `${resultCount} NGOs`}
          </Button>
        </div>
      </dialog>
    </>
  );
}
