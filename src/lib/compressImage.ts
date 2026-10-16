"use client";

/**
 * Resize an image in the browser (longest side ≤ maxSize) and re-encode it as
 * WebP (JPEG fallback). Keeps uploads small (~100–400 KB) without any library.
 */
export async function compressImage(file: File, maxSize = 1600, quality = 0.82): Promise<File> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");

  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("This image format isn't supported. Try a JPG or PNG.");
  });
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser couldn't process this image.");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const toBlob = (type: string) => new Promise<Blob | null>((r) => canvas.toBlob(r, type, quality));
  let blob = await toBlob("image/webp");
  let type = "image/webp";
  if (!blob || blob.type !== "image/webp") {
    blob = await toBlob("image/jpeg");
    type = "image/jpeg";
  }
  if (!blob) throw new Error("Couldn't compress this image.");

  const base = file.name.replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${base}.${type === "image/webp" ? "webp" : "jpg"}`, { type });
}
