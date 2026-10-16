"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { NGOS_TAG } from "@/lib/queries";
import { createAdminClient, hasRealServiceKey, IMAGE_BUCKET } from "@/lib/supabase/admin";
import {
  formToNgoRow,
  formToPrivateRow,
  ngoFormSchema,
  ngoPublishSchema,
  type NgoFormValues,
} from "@/lib/ngoForm";
import {
  deleteMockNgo,
  deleteMockSampleNgos,
  duplicateMockNgo,
  getMockNgoById,
  isMockSlugAvailable,
  saveMockNgo,
  setMockPublished,
} from "@/lib/demoStore";
import type { NgoPrivateRow, NgoRow } from "@/lib/database.types";
import { requireAdmin } from "./auth";

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
  if (msg.includes("ngos_slug_key")) {
    return {
      ok: false,
      message: "That URL name is already used.",
      fieldErrors: { slug: "Already used by another NGO" },
    };
  }
  return { ok: false, message: msg };
}

// ---------------------------------------------------------------------------

export async function checkSlugAvailable(slug: string, id: string | null): Promise<boolean> {
  await requireAdmin();
  if (!slug) return true;

  if (hasRealServiceKey()) {
    try {
      const db = createAdminClient();
      if (db) {
        let q = db.from("ngos").select("id").eq("slug", slug);
        if (id) q = q.neq("id", id);
        const { data } = await q.limit(1);
        if (data && data.length > 0) return false;
      }
    } catch {
      // ignore and check mock store
    }
  }

  return isMockSlugAvailable(slug, id);
}

export async function saveNgo(
  id: string | null,
  values: NgoFormValues,
  intent: "draft" | "publish" | "unpublish",
): Promise<ActionResult<{ id: string; slug: string; status: "draft" | "published" }>> {
  await requireAdmin();

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

  const status = intent === "publish" ? "published" : intent === "unpublish" ? "draft" : undefined;

  // "Save draft" on an already-published NGO keeps it published (it's an edit).
  let current: "draft" | "published" = "draft";
  const existing = id ? getMockNgoById(id) : null;
  if (existing) {
    current = existing.row.status as "draft" | "published";
  } else if (id && hasRealServiceKey()) {
    try {
      const db = createAdminClient();
      if (db) {
        const { data } = await db.from("ngos").select("status").eq("id", id).maybeSingle();
        if (data) current = data.status as "draft" | "published";
      }
    } catch {
      // keep fallback
    }
  }

  const nextStatus = status ?? current;

  if (nextStatus === "published" && intent !== "publish") {
    // Editing a live NGO: it must still meet the publish rules.
    const check = ngoPublishSchema.safeParse(values);
    if (!check.success) {
      const fieldErrors: Partial<Record<keyof NgoFormValues, string>> = {};
      for (const issue of check.error.issues) {
        fieldErrors[issue.path[0] as keyof NgoFormValues] ??= issue.message;
      }
      return {
        ok: false,
        message: "This NGO is live, so required fields can't be empty. Fix them or unpublish first.",
        fieldErrors,
      };
    }
  }

  const finalId = id || randomUUID();
  const now = new Date().toISOString();
  const ngoRow: NgoRow = {
    ...formToNgoRow(parsed.data),
    id: finalId,
    status: nextStatus,
    created_at: existing?.row.created_at ?? now,
    updated_at: now,
    published_at: nextStatus === "published" ? (existing?.row.published_at ?? now) : null,
  };
  const privRow: NgoPrivateRow = {
    ...formToPrivateRow(parsed.data),
    ngo_id: finalId,
  };

  // 1. Always update local mock store
  saveMockNgo(ngoRow, privRow);

  // 2. Sync to Supabase if real service role key is configured
  if (hasRealServiceKey()) {
    try {
      const db = createAdminClient();
      if (db) {
        if (id) {
          await db.from("ngos").update(ngoRow).eq("id", id);
        } else {
          await db.from("ngos").insert(ngoRow);
        }
        await db.from("ngo_private").upsert(privRow);
      }
    } catch (err) {
      console.warn("Supabase save warning (demo fallback preserved):", err);
    }
  }

  refreshPublicSite();
  return { ok: true, id: finalId, slug: ngoRow.slug, status: nextStatus };
}

export async function setPublished(
  id: string,
  publish: boolean,
): Promise<ActionResult<{ status: string }>> {
  await requireAdmin();

  const nextStatus = setMockPublished(id, publish);

  if (hasRealServiceKey()) {
    try {
      const db = createAdminClient();
      if (db) {
        const { data, error } = await db
          .from("ngos")
          .update({ status: publish ? "published" : "draft" })
          .eq("id", id)
          .select("status")
          .single();
        if (error && !nextStatus) return dbError(error);
        if (data?.status) {
          refreshPublicSite();
          return { ok: true, status: data.status };
        }
      }
    } catch (err) {
      console.warn("Supabase setPublished warning:", err);
    }
  }

  refreshPublicSite();
  return { ok: true, status: nextStatus ?? (publish ? "published" : "draft") };
}

export async function duplicateNgo(id: string): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();

  const duplicated = duplicateMockNgo(id);
  if (!duplicated) return { ok: false, message: "Could not find NGO to duplicate." };

  if (hasRealServiceKey()) {
    try {
      const db = createAdminClient();
      if (db) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _id, created_at, updated_at, published_at, ...rest } = duplicated;
        await db.from("ngos").insert({ ...rest, id: duplicated.id });
      }
    } catch (err) {
      console.warn("Supabase duplicate warning:", err);
    }
  }

  refreshPublicSite();
  return { ok: true, id: duplicated.id };
}

export async function deleteNgo(id: string): Promise<ActionResult> {
  await requireAdmin();

  deleteMockNgo(id);

  if (hasRealServiceKey()) {
    try {
      const db = createAdminClient();
      if (db) {
        await db.from("ngos").delete().eq("id", id);
      }
    } catch (err) {
      console.warn("Supabase delete warning:", err);
    }
  }

  refreshPublicSite();
  return { ok: true };
}

export async function deleteSampleNgos(): Promise<ActionResult<{ count: number }>> {
  await requireAdmin();

  const count = deleteMockSampleNgos();

  if (hasRealServiceKey()) {
    try {
      const db = createAdminClient();
      if (db) {
        await db.from("ngos").delete().eq("is_sample", true);
      }
    } catch (err) {
      console.warn("Supabase deleteSampleNgos warning:", err);
    }
  }

  refreshPublicSite();
  return { ok: true, count };
}

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
};

/** Upload one image; uses Supabase Storage if configured, or converts to a Data URL fallback. */
export async function uploadImage(formData: FormData): Promise<ActionResult<{ url: string }>> {
  await requireAdmin();

  const file = formData.get("file");
  const kind = String(formData.get("kind") ?? "photo").replace(/[^a-z]/g, "") || "photo";
  const folder = String(formData.get("folder") ?? "").replace(/[^a-z0-9-]/gi, "") || "unsorted";
  if (!(file instanceof File)) return { ok: false, message: "No file received." };
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) return { ok: false, message: "Only JPG, PNG or WebP images." };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, message: "Image is too large (max 5 MB)." };

  if (hasRealServiceKey()) {
    try {
      const db = createAdminClient();
      if (db) {
        const path = `${folder}/${kind}-${randomUUID()}.${ext}`;
        const { error } = await db.storage.from(IMAGE_BUCKET).upload(path, file, {
          contentType: file.type,
          cacheControl: "31536000",
          upsert: false,
        });
        if (!error) {
          return { ok: true, url: db.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl };
        }
      }
    } catch (err) {
      console.warn("Supabase storage upload failed, using Data URL fallback:", err);
    }
  }

  // Demo prototype fallback: base64 Data URL (renders seamlessly via <NgoImage />)
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const dataUrl = `data:${file.type};base64,${buffer.toString("base64")}`;

  return { ok: true, url: dataUrl };
}
