import { causeLabel, getCause } from "@/config/causes";
import { areaName, getArea } from "@/config/areas";
import { helpTypeLabel, isHelpType } from "@/config/helpTypes";
import type { PublicNgo } from "@/lib/types";

export type SortKey = "az" | "recent" | "nearest";

export type DirectoryFilters = {
  q: string;
  causes: string[];
  area: string;
  help: string[];
  sort: SortKey;
};

type RawParams = Record<string, string | string[] | undefined>;

function list(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return (Array.isArray(v) ? v : [v]).flatMap((s) => s.split(",")).filter(Boolean);
}

/** Read filters from the URL (?q=&cause=education&cause=environment&area=nigdi&help=volunteer&sort=az). */
export function parseFilters(params: RawParams): DirectoryFilters {
  const q = (Array.isArray(params.q) ? params.q[0] : params.q)?.trim().slice(0, 100) ?? "";
  const area = Array.isArray(params.area) ? params.area[0] : params.area;
  const sort = Array.isArray(params.sort) ? params.sort[0] : params.sort;
  return {
    q,
    causes: list(params.cause).filter((c) => getCause(c)),
    area: area && getArea(area) ? area : "",
    help: list(params.help).filter(isHelpType),
    sort: sort === "recent" || sort === "nearest" ? sort : "az",
  };
}

export function filtersToSearch(f: Partial<DirectoryFilters>): string {
  const sp = new URLSearchParams();
  if (f.q) sp.set("q", f.q);
  f.causes?.forEach((c) => sp.append("cause", c));
  if (f.area) sp.set("area", f.area);
  f.help?.forEach((h) => sp.append("help", h));
  if (f.sort && f.sort !== "az") sp.set("sort", f.sort);
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export function activeFilterCount(f: DirectoryFilters) {
  return f.causes.length + f.help.length + (f.area ? 1 : 0) + (f.q ? 1 : 0);
}

function normalise(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
}

/**
 * Text search across name, tagline, description, activities, cause labels and area.
 * Every word must match somewhere ("education kothrud" works).
 */
function matchesQuery(n: PublicNgo, q: string) {
  if (!q) return true;
  const haystack = normalise(
    [
      n.name,
      n.tagline,
      n.description,
      n.help_notes,
      ...n.activities,
      ...n.causes.map(causeLabel),
      ...n.help_types.map(helpTypeLabel),
      areaName(n.area),
    ]
      .filter(Boolean)
      .join(" "),
  );
  return normalise(q)
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

/** Filter + sort (A–Z / recent). "Nearest" is sorted in the browser, where the location is. */
export function applyFilters(all: PublicNgo[], f: DirectoryFilters): PublicNgo[] {
  const result = all.filter(
    (n) =>
      matchesQuery(n, f.q) &&
      (f.causes.length === 0 || f.causes.some((c) => n.causes.includes(c))) &&
      (!f.area || n.area === f.area) &&
      (f.help.length === 0 || f.help.some((h) => n.help_types.includes(h))),
  );
  if (f.sort === "recent") {
    return result.sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""));
  }
  return result.sort((a, b) => a.name.localeCompare(b.name, "en-IN"));
}
