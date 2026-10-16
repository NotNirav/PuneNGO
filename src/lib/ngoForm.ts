// Admin NGO form: zod schemas + conversions between form values, DB rows and
// the public profile shape. Pure functions — used by the browser (form, live
// preview) AND the server (save action re-validates everything).

import { z } from "zod";
import { getArea } from "@/config/areas";
import { getCause } from "@/config/causes";
import { isHelpType } from "@/config/helpTypes";
import type { NgoPrivateRow, NgoRow } from "@/lib/database.types";
import { ensureUrl, toE164India } from "@/lib/contact";
import type { NgoProfileData } from "@/components/ngo/NgoProfile";

export const TAGLINE_MAX = 120;
export const GALLERY_MAX = 6;

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}

const isUrl = (v: string) => {
  try {
    const u = new URL(ensureUrl(v));
    return /^https?:$/.test(u.protocol) && u.hostname.includes(".");
  } catch {
    return false;
  }
};

const text = (max: number) => z.string().trim().max(max, `Keep it under ${max} characters`);
const url = z
  .string()
  .trim()
  .max(500)
  .refine((v) => !v || isUrl(v), "Enter a valid link, e.g. https://example.org");
const phone = z
  .string()
  .trim()
  .refine((v) => !v || /^\+91\d{10}$/.test(toE164India(v)), "Enter a 10-digit Indian number, e.g. 98765 43210 or 020 2553 1234");
const mobile = z
  .string()
  .trim()
  .refine((v) => !v || /^\+91[6-9]\d{9}$/.test(toE164India(v)), "Enter a 10-digit Indian mobile number, e.g. 98765 43210");
const coord = (limit: number) =>
  z
    .string()
    .trim()
    .refine((v) => !v || (Number.isFinite(Number(v)) && Math.abs(Number(v)) <= limit), "Enter a number like 18.5204");

export const ngoFormSchema = z.object({
  // Basics
  name: z.string().trim().min(1, "Name is required").max(150),
  slug: z
    .string()
    .trim()
    .min(1, "URL name is required")
    .max(80)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single dashes only"),
  tagline: text(TAGLINE_MAX),
  description: text(5000),
  activities: z.array(text(200)).max(20),
  // Causes & help
  causes: z.array(z.string().refine((c) => !!getCause(c))),
  help_types: z.array(z.string().refine((h): boolean => isHelpType(h))),
  help_notes: text(1000),
  donation_link: url,
  // Location
  area: z.string().refine((a) => !a || !!getArea(a), "Pick an area from the list"),
  address: text(300),
  maps_url: url,
  lat: coord(90),
  lng: coord(180),
  // Contact
  phone,
  whatsapp: mobile,
  email: z
    .string()
    .trim()
    .refine((v) => !v || z.email().safeParse(v).success, "Enter a valid email address"),
  website: url,
  instagram: url,
  facebook: url,
  linkedin: url,
  youtube: url,
  // Photos
  logo_url: z.string(),
  cover_url: z.string(),
  gallery_urls: z.array(z.string()).max(GALLERY_MAX, `Up to ${GALLERY_MAX} photos`),
  // Details
  founded_year: z
    .string()
    .trim()
    .refine((v) => !v || (/^\d{4}$/.test(v) && Number(v) >= 1800 && Number(v) <= new Date().getFullYear()), "Enter a year like 2015"),
  registration_type: text(80),
  registration_number: text(80),
  visiting_hours: text(200),
  languages: z.array(text(40)).max(15),
  // Private (admin only, never public)
  contact_person: text(120),
  contact_person_phone: phone,
  data_received_on: z.string().refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), "Pick a date"),
  internal_notes: text(3000),
  // Visibility
  is_featured: z.boolean(),
  is_sample: z.boolean(),
});

export type NgoFormValues = z.infer<typeof ngoFormSchema>;

/** Extra rules that apply only when publishing. */
export const REQUIRED_FOR_PUBLISH: { field: keyof NgoFormValues; label: string; ok: (v: NgoFormValues) => boolean; message: string }[] = [
  { field: "name", label: "Name", ok: (v) => v.name.trim().length > 0, message: "Name is required" },
  { field: "description", label: "Description", ok: (v) => v.description.trim().length > 0, message: "Add a short description before publishing" },
  { field: "causes", label: "At least one cause", ok: (v) => v.causes.length > 0, message: "Pick at least one cause" },
  { field: "area", label: "Area", ok: (v) => !!v.area, message: "Pick the NGO's area" },
];

export const RECOMMENDED: { label: string; ok: (v: NgoFormValues) => boolean }[] = [
  { label: "A way to contact them", ok: (v) => !!(v.phone || v.whatsapp || v.email) },
  { label: "Tagline", ok: (v) => !!v.tagline.trim() },
  { label: "Logo or cover photo", ok: (v) => !!(v.logo_url || v.cover_url) },
];

export const ngoPublishSchema = ngoFormSchema.superRefine((v, ctx) => {
  for (const r of REQUIRED_FOR_PUBLISH) {
    if (!r.ok(v)) ctx.addIssue({ code: "custom", path: [r.field], message: r.message });
  }
});

export const emptyNgoForm: NgoFormValues = {
  name: "",
  slug: "",
  tagline: "",
  description: "",
  activities: [],
  causes: [],
  help_types: [],
  help_notes: "",
  donation_link: "",
  area: "",
  address: "",
  maps_url: "",
  lat: "",
  lng: "",
  phone: "",
  whatsapp: "",
  email: "",
  website: "",
  instagram: "",
  facebook: "",
  linkedin: "",
  youtube: "",
  logo_url: "",
  cover_url: "",
  gallery_urls: [],
  founded_year: "",
  registration_type: "",
  registration_number: "",
  visiting_hours: "",
  languages: [],
  contact_person: "",
  contact_person_phone: "",
  data_received_on: "",
  internal_notes: "",
  is_featured: false,
  is_sample: false,
};

// ---------------------------------------------------------------------------
// Conversions
// ---------------------------------------------------------------------------

const orNull = (s: string) => (s.trim() ? s.trim() : null);
const urlOrNull = (s: string) => (s.trim() ? ensureUrl(s.trim()) : null);
const phoneOrNull = (s: string) => (s.trim() ? toE164India(s) : null);
const numOrNull = (s: string) => (s.trim() ? Number(s) : null);
const cleanList = (l: string[]) => l.map((x) => x.trim()).filter(Boolean);

/** Form → `ngos` table columns (status handled by the caller). */
export function formToNgoRow(v: NgoFormValues) {
  return {
    name: v.name.trim(),
    slug: v.slug.trim(),
    tagline: orNull(v.tagline),
    description: v.description.trim(),
    activities: cleanList(v.activities),
    causes: v.causes,
    help_types: v.help_types,
    help_notes: orNull(v.help_notes),
    donation_link: urlOrNull(v.donation_link),
    area: v.area || null,
    address: orNull(v.address),
    maps_url: urlOrNull(v.maps_url),
    lat: numOrNull(v.lat),
    lng: numOrNull(v.lng),
    phone: phoneOrNull(v.phone),
    whatsapp: phoneOrNull(v.whatsapp),
    email: orNull(v.email)?.toLowerCase() ?? null,
    website: urlOrNull(v.website),
    instagram: urlOrNull(v.instagram),
    facebook: urlOrNull(v.facebook),
    linkedin: urlOrNull(v.linkedin),
    youtube: urlOrNull(v.youtube),
    logo_url: v.logo_url || null,
    cover_url: v.cover_url || null,
    gallery_urls: v.gallery_urls.slice(0, GALLERY_MAX),
    founded_year: numOrNull(v.founded_year),
    registration_type: orNull(v.registration_type),
    registration_number: orNull(v.registration_number),
    visiting_hours: orNull(v.visiting_hours),
    languages: cleanList(v.languages),
    is_featured: v.is_featured,
    is_sample: v.is_sample,
  };
}

export function formToPrivateRow(v: NgoFormValues) {
  return {
    contact_person: orNull(v.contact_person),
    contact_person_phone: phoneOrNull(v.contact_person_phone),
    internal_notes: orNull(v.internal_notes),
    data_received_on: v.data_received_on || null,
  };
}

const s = (x: string | null | undefined) => x ?? "";

/** DB row (+ private row) → form values. */
export function rowToForm(row: NgoRow, priv: NgoPrivateRow | null): NgoFormValues {
  return {
    name: row.name,
    slug: row.slug,
    tagline: s(row.tagline),
    description: s(row.description),
    activities: row.activities ?? [],
    causes: row.causes ?? [],
    help_types: row.help_types ?? [],
    help_notes: s(row.help_notes),
    donation_link: s(row.donation_link),
    area: s(row.area),
    address: s(row.address),
    maps_url: s(row.maps_url),
    lat: row.lat == null ? "" : String(row.lat),
    lng: row.lng == null ? "" : String(row.lng),
    phone: s(row.phone),
    whatsapp: s(row.whatsapp),
    email: s(row.email),
    website: s(row.website),
    instagram: s(row.instagram),
    facebook: s(row.facebook),
    linkedin: s(row.linkedin),
    youtube: s(row.youtube),
    logo_url: s(row.logo_url),
    cover_url: s(row.cover_url),
    gallery_urls: row.gallery_urls ?? [],
    founded_year: row.founded_year == null ? "" : String(row.founded_year),
    registration_type: s(row.registration_type),
    registration_number: s(row.registration_number),
    visiting_hours: s(row.visiting_hours),
    languages: row.languages ?? [],
    contact_person: s(priv?.contact_person),
    contact_person_phone: s(priv?.contact_person_phone),
    data_received_on: s(priv?.data_received_on),
    internal_notes: s(priv?.internal_notes),
    is_featured: row.is_featured,
    is_sample: row.is_sample,
  };
}

/**
 * Form → what the public profile renders. Invalid/half-typed values are
 * dropped so the live preview shows exactly what would be published.
 */
export function formToProfile(v: NgoFormValues): NgoProfileData {
  const row = formToNgoRow(v);
  const valid = <K extends keyof NgoFormValues>(k: K) => ngoFormSchema.shape[k].safeParse(v[k]).success;
  const keep = <T,>(k: keyof NgoFormValues, value: T) => (valid(k) ? value : null);
  return {
    ...row,
    slug: row.slug || "preview",
    area: row.area ?? "",
    description: row.description,
    donation_link: keep("donation_link", row.donation_link),
    maps_url: keep("maps_url", row.maps_url),
    lat: keep("lat", row.lat),
    lng: keep("lng", row.lng),
    phone: keep("phone", row.phone),
    whatsapp: keep("whatsapp", row.whatsapp),
    email: keep("email", row.email),
    website: keep("website", row.website),
    instagram: keep("instagram", row.instagram),
    facebook: keep("facebook", row.facebook),
    linkedin: keep("linkedin", row.linkedin),
    youtube: keep("youtube", row.youtube),
    founded_year: keep("founded_year", row.founded_year),
  };
}
