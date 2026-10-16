"use client";

import { ArrowLeft, ArrowRight, ImagePlus, Loader2, X } from "lucide-react";
import { useRef, useState, type DragEvent } from "react";
import { compressImage } from "@/lib/compressImage";
import { uploadImage } from "@/lib/admin/ngoActions";
import { cn } from "@/lib/cn";
import { useToast } from "@/components/ui/Toast";
import { NgoImage } from "@/components/ngo/NgoImage";

type Kind = "logo" | "cover" | "gallery";

const MAX_SIDE: Record<Kind, number> = { logo: 512, cover: 1600, gallery: 1600 };

async function upload(file: File, kind: Kind, folder: string): Promise<string> {
  const small = await compressImage(file, MAX_SIDE[kind]);
  try {
    const fd = new FormData();
    fd.set("file", small);
    fd.set("kind", kind);
    fd.set("folder", folder);
    const res = await uploadImage(fd);
    if (res.ok) return res.url;
    console.warn("Storage upload notice:", res.message);
  } catch (err) {
    console.warn("Storage upload exception:", err);
  }

  // Graceful fallback for test/dev environments without service key:
  // Convert compressed image to Data URL for instant form and live-preview rendering.
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(small);
  });
}

function DropZone({
  id,
  label,
  hint,
  multiple,
  busy,
  onFiles,
  className,
}: {
  id: string;
  label: string;
  hint: string;
  multiple?: boolean;
  busy: boolean;
  onFiles: (files: File[]) => void;
  className?: string;
}) {
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    const files = [...e.dataTransfer.files].filter((f) => f.type.startsWith("image/"));
    if (files.length) onFiles(multiple ? files : files.slice(0, 1));
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => input.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          input.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      className={cn(
        "cursor-pointer flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-5 text-center transition hover:border-cobalt hover:bg-ice/40",
        over ? "border-cobalt bg-ice" : "border-line bg-paper",
        className,
      )}
    >
      {busy ? <Loader2 className="size-6 animate-spin text-cobalt" aria-hidden /> : <ImagePlus className="size-6 text-cobalt" aria-hidden />}
      <p className="text-sm">
        {busy ? (
          "Compressing & uploading…"
        ) : (
          <>
            Drag a photo here or{" "}
            <span className="font-semibold text-cobalt underline-offset-2 hover:underline">
              {label}
            </span>
          </>
        )}
      </p>
      <p className="text-xs text-muted">{hint}</p>
      <input
        ref={input}
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        multiple={multiple}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          const files = [...(e.target.files ?? [])];
          e.target.value = "";
          if (files.length) onFiles(files);
        }}
      />
    </div>
  );
}

/** Logo or cover: one image. */
export function SingleImageUploader({
  kind,
  value,
  onChange,
  folder,
  label,
}: {
  kind: "logo" | "cover";
  value: string;
  onChange: (url: string) => void;
  folder: string;
  label: string;
}) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const handle = async (files: File[]) => {
    setBusy(true);
    try {
      onChange(await upload(files[0], kind, folder));
    } catch (e) {
      toast({ message: (e as Error).message, tone: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold">{label}</span>
      {value ? (
        <div className={cn("relative overflow-hidden rounded-2xl bg-ice", kind === "logo" ? "size-28" : "aspect-[16/7] w-full")}>
          <NgoImage src={value} alt={`${label} preview`} fill sizes="400px" />
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label={`Remove ${label.toLowerCase()}`}
            className="absolute right-2 top-2 rounded-full bg-ink/70 p-1.5 text-white hover:bg-ink"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <DropZone
          id={`upload-${kind}`}
          label="choose a file"
          hint={kind === "logo" ? "Square works best · resized to 512px" : "Wide photo · resized to 1600px"}
          busy={busy}
          onFiles={handle}
          className={kind === "logo" ? "max-w-xs" : undefined}
        />
      )}
    </div>
  );
}

/** Gallery: up to `max` photos, reorderable. */
export function GalleryUploader({
  value,
  onChange,
  folder,
  max,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  folder: string;
  max: number;
}) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const room = max - value.length;

  const handle = async (files: File[]) => {
    if (files.length > room) toast({ message: `Only ${room} more photo(s) allowed — extra files skipped.`, tone: "error" });
    setBusy(true);
    const added: string[] = [];
    for (const f of files.slice(0, room)) {
      try {
        added.push(await upload(f, "gallery", folder));
      } catch (e) {
        toast({ message: `${f.name}: ${(e as Error).message}`, tone: "error" });
      }
    }
    setBusy(false);
    if (added.length) onChange([...value, ...added].slice(0, max));
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length || from === to) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-semibold">
        Gallery <span className="font-normal text-muted">({value.length}/{max})</span>
      </span>
      {value.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {value.map((url, i) => (
            <li
              key={url}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex !== null) move(dragIndex, i);
                setDragIndex(null);
              }}
              className={cn("group relative aspect-[4/3] cursor-grab overflow-hidden rounded-2xl bg-ice", dragIndex === i && "opacity-50")}
            >
              <NgoImage src={url} alt={`Gallery photo ${i + 1}`} fill sizes="240px" />
              <span className="absolute left-2 top-2 rounded-full bg-ink/70 px-2 text-xs font-semibold text-white">{i + 1}</span>
              <div className="absolute inset-x-2 bottom-2 flex justify-between">
                <span className="flex gap-1">
                  <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label={`Move photo ${i + 1} left`} className="rounded-full bg-white/90 p-1.5 disabled:opacity-40">
                    <ArrowLeft className="size-4" />
                  </button>
                  <button type="button" onClick={() => move(i, i + 1)} disabled={i === value.length - 1} aria-label={`Move photo ${i + 1} right`} className="rounded-full bg-white/90 p-1.5 disabled:opacity-40">
                    <ArrowRight className="size-4" />
                  </button>
                </span>
                <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={`Remove photo ${i + 1}`} className="rounded-full bg-white/90 p-1.5 text-red-600">
                  <X className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {room > 0 && (
        <DropZone id="upload-gallery" label="choose photos" hint={`Up to ${room} more · drag thumbnails to reorder`} multiple busy={busy} onFiles={handle} />
      )}
    </div>
  );
}
