// Ways people can help an NGO. `slug` is stored in the database and used in URLs.

export type HelpTypeSlug =
  | "donate-money"
  | "donate-items"
  | "volunteer"
  | "internships"
  | "pro-bono"
  | "events-drives";

export type HelpType = { slug: HelpTypeSlug; label: string };

export const helpTypes: HelpType[] = [
  { slug: "donate-money", label: "Donate Money" },
  { slug: "donate-items", label: "Donate Items" },
  { slug: "volunteer", label: "Volunteer" },
  { slug: "internships", label: "Internships" },
  { slug: "pro-bono", label: "Skilled / Pro-bono Help" },
  { slug: "events-drives", label: "Events & Drives" },
];

const bySlug = new Map(helpTypes.map((h) => [h.slug, h]));

export function helpTypeLabel(slug: string): string {
  return bySlug.get(slug as HelpTypeSlug)?.label ?? slug;
}

export function isHelpType(slug: string): slug is HelpTypeSlug {
  return bySlug.has(slug as HelpTypeSlug);
}
