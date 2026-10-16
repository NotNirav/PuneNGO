import type { NgoRow } from "./database.types";

/**
 * Everything the public profile and card need. The admin live preview builds
 * this same shape from the form, so both render with identical components.
 * Never add private/admin fields here.
 */
export const PUBLIC_NGO_COLUMNS = [
  "id",
  "slug",
  "name",
  "tagline",
  "description",
  "activities",
  "causes",
  "help_types",
  "help_notes",
  "area",
  "address",
  "maps_url",
  "lat",
  "lng",
  "phone",
  "whatsapp",
  "email",
  "website",
  "instagram",
  "facebook",
  "linkedin",
  "youtube",
  "donation_link",
  "founded_year",
  "registration_type",
  "registration_number",
  "visiting_hours",
  "languages",
  "logo_url",
  "cover_url",
  "gallery_urls",
  "is_featured",
  "is_sample",
  "published_at",
  "updated_at",
] as const satisfies readonly (keyof NgoRow)[];

// Published rows always have an area (enforced by the ngos_published_complete constraint).
export type PublicNgo = Omit<Pick<NgoRow, (typeof PUBLIC_NGO_COLUMNS)[number]>, "area"> & { area: string };
