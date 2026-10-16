"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { NGOS_TAG } from "@/lib/queries";
import { createAdminClient, hasServiceKey, IMAGE_BUCKET, MISSING_SERVICE_KEY } from "@/lib/supabase/admin";
import { formToNgoRow, formToPrivateRow, ngoFormSchema, ngoPublishSchema, slugify, type NgoFormValues } from "@/lib/ngoForm";
import { requireAdmin } from "./auth";

// Every action starts with requireAdmin(): server actions can be called
// directly with a POST, so the middleware alone is not enough.

export type ActionResult<T = object> =
  | ({ ok: true } & T)
  | { ok: false; message: string; fieldErrors?: Partial<Record<keyof NgoFormValues, string>> };

/** Published data changed → refresh all public pages (home, /ngos, profiles, causes, areas, sitemap). */
function refreshPublicSite() {
  revalidateTag(NGOS_TAG);
  revalidatePath("/", "layout");
}

function dbError(e: { message: string; code?: string } | Error): ActionResult<never> {
  const msg = "message" in e ? e.message : String(e);
  if (msg.includes("ngos_slug_key")) return { ok: false, message: "That URL name is already used.", fieldErrors: { slug: "Already used by another NGO" } };
  return { ok: false, message: msg };
}

function guard(): ActionResult<never> | null {
  return hasServiceKey() ? null : { ok: false, message: MISSING_SERVICE_KEY };
}

// ---------------------------------------------------------------------------

export async function checkSlugAvailable(slug: string, id: string | null): Promise<boolean> {
  await requireAdmin();
  if (!hasServiceKey() || !slug) return true;
  let q = createAdminClient().from("ngos").select("id").eq("slug", slug);
  if (id) q = q.neq("id", id);
  const { data } = await q.limit(1);
  return !data?.length;
}

export async function saveNgo(
  id: string | null,
  values: NgoFormValues,
  intent: "draft" | "publish" | "unpublish",
): Promise<ActionResult<{ id: string; slug: string; status: "draft" | "published" }>> {
  await requireAdmin();
  const g = guard();
  if (g) return g;

  // Re-validate on the server — never trust the browser.
  const parsed = (intent === "publish" ? ngoPublishSchema : ngoFormSchema).safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof NgoFormValues, string>> = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0] as keyof NgoFormValues;
      fieldErrors[k] ??= issue.message;
    }
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors };
  }

  const db = createAdminClient();
  const status = intent === "publish" ? "published" : intent === "unpublish" ? "draft" : undefined;

  // "Save draft" on an already-published NGO keeps it published (it's an edit).
  let current: "draft" | "published" = "draft";
  if (id) {
    const { data } = await db.from("ngos").select("status").eq("id", id).maybeSingle();
    if (!data) return { ok: false, message: "This NGO no longer exists." };
    current = data.status as "draft" | "published";
  }
  const nextStatus = status ?? current;

  if (nextStatus === "published" && intent !== "publish") {
    // Editing a live NGO: it must still meet the publish rules.
    const check = ngoPublishSchema.safeParse(values);
    if (!check.success) {
      const fieldErrors: Partial<Record<keyof NgoFormValues, string>> = {};
      for (const issue of check.error.issues) fieldErrors[issue.path[0] as keyof NgoFormValues] ??= issue.message;
      return { ok: false, message: "This NGO is live, so required fields can't be empty. Fix them or unpublish first.", fieldErrors };
    }
  }

  const row = { ...formToNgoRow(parsed.data), status: nextStatus };
  const res = id
    ? await db.from("ngos").update(row).eq("id", id).select("id, slug, status").single()
    : await db.from("ngos").insert(row).select("id, slug, status").single();
  if (res.error) return dbError(res.error);

  const saved = res.data;
  const priv = await db.from("ngo_private").upsert({ ngo_id: saved.id, ...formToPrivateRow(parsed.data) });
  if (priv.error) return dbError(priv.error);

  if (nextStatus === "published" || current === "published") refreshPublicSite();
  return { ok: true, id: saved.id, slug: saved.slug, status: saved.status as "draft" | "published" };
}

export async function setPublished(id: string, publish: boolean): Promise<ActionResult<{ status: string }>> {
  await requireAdmin();
  const g = guard();
  if (g) return g;
  const db = createAdminClient();
  const { data, error } = await db
    .from("ngos")
    .update({ status: publish ? "published" : "draft" })
    .eq("id", id)
    .select("status")
    .single();
  if (error) {
    if (error.message.includes("ngos_published_complete")) {
      return { ok: false, message: "Can't publish yet — open the NGO and fill in description, cause and area first." };
    }
    return dbError(error);
  }
  refreshPublicSite();
  return { ok: true, status: data.status };
}

export async function duplicateNgo(id: string): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const g = guard();
  if (g) return g;
  const db = createAdminClient();
  const { data: src, error } = await db.from("ngos").select("*").eq("id", id).single();
  if (error) return dbError(error);

  // Find a free slug: name-copy, name-copy-2, …
  const base = slugify(`${src.slug}-copy`);
  const { data: taken } = await db.from("ngos").select("slug").like("slug", `${base}%`);
  const used = new Set(taken?.map((t) => t.slug));
  let slug = base;
  for (let n = 2; used.has(slug); n++) slug = `${base}-${n}`;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, created_at, updated_at, published_at, ...rest } = src;
  const ins = await db
    .from("ngos")
    .insert({ ...rest, name: `${src.name} (copy)`, slug, status: "draft", is_featured: false })
    .select("id")
    .single();
  if (ins.error) return dbError(ins.error);
  return { ok: true, id: ins.data.id };
}

/** Storage paths of images that belong to our bucket. */
function ownImagePaths(urls: (string | null)[]) {
  const marker = `/storage/v1/object/public/${IMAGE_BUCKET}/`;
  return urls.filter((u): u is string => !!u && u.includes(marker)).map((u) => decodeURIComponent(u.split(marker)[1]));
}

export async function deleteNgo(id: string): Promise<ActionResult> {
  await requireAdmin();
  const g = guard();
  if (g) return g;
  const db = createAdminClient();
  const { data, error } = await db.from("ngos").delete().eq("id", id).select("status, logo_url, cover_url, gallery_urls");
  if (error) return dbError(error);
  const removed = data?.[0];
  if (removed) {
    const paths = ownImagePaths([removed.logo_url, removed.cover_url, ...(removed.gallery_urls ?? [])]);
    if (paths.length) await db.storage.from(IMAGE_BUCKET).remove(paths);
    if (removed.status === "published") refreshPublicSite();
  }
  return { ok: true };
}

export async function deleteSampleNgos(): Promise<ActionResult<{ count: number }>> {
  await requireAdmin();
  const g = guard();
  if (g) return g;
  const { data, error } = await createAdminClient().from("ngos").delete().eq("is_sample", true).select("id");
  if (error) return dbError(error);
  refreshPublicSite();
  return { ok: true, count: data?.length ?? 0 };
}

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png" };

/** Upload one (already browser-compressed) image to Storage; returns its public URL. */
export async function uploadImage(formData: FormData): Promise<ActionResult<{ url: string }>> {
  await requireAdmin();
  const g = guard();
  if (g) return g;

  const file = formData.get("file");
  const kind = String(formData.get("kind") ?? "photo").replace(/[^a-z]/g, "") || "photo";
  const folder = String(formData.get("folder") ?? "").replace(/[^a-z0-9-]/gi, "") || "unsorted";
  if (!(file instanceof File)) return { ok: false, message: "No file received." };
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) return { ok: false, message: "Only JPG, PNG or WebP images." };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, message: "Image is too large (max 5 MB)." };

  const path = `${folder}/${kind}-${randomUUID()}.${ext}`;
  const db = createAdminClient();
  const { error } = await db.storage.from(IMAGE_BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) return { ok: false, message: error.message };
  return { ok: true, url: db.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl };
}
