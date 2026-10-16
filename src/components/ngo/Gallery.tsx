"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { NgoImage } from "./NgoImage";

/** Photo grid with a keyboard-friendly lightbox (native <dialog>). */
export function Gallery({ name, urls }: { name: string; urls: string[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const ref = useRef<HTMLDialogElement>(null);

  const open = (i: number) => {
    setIndex(i);
    ref.current?.showModal();
  };
  const close = () => ref.current?.close();
  const step = useCallback(
    (d: number) => setIndex((i) => (i === null ? i : (i + d + urls.length) % urls.length)),
    [urls.length],
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [step]);

  if (urls.length === 0) return null;

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 @2xl:grid-cols-3">
        {urls.map((url, i) => (
          <li key={url + i}>
            <button
              type="button"
              onClick={() => open(i)}
              className="relative block aspect-[4/3] w-full overflow-hidden rounded-2xl bg-ice"
              aria-label={`Open photo ${i + 1} of ${urls.length}`}
            >
              <NgoImage src={url} alt="" fill sizes="(min-width: 768px) 240px, 50vw" className="transition hover:scale-105" />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={ref}
        onClose={() => setIndex(null)}
        onClick={(e) => e.target === ref.current && close()}
        aria-label={`${name} photos`}
        className="m-auto h-dvh max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-ink/90"
      >
        {index !== null && (
          <div className="flex h-full w-full items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && close()}>
            <div className="relative aspect-[16/10] w-full max-w-4xl">
              <NgoImage src={urls[index]} alt={`${name} photo ${index + 1}`} fill sizes="100vw" className="rounded-2xl object-contain" />
            </div>
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
              {index + 1} / {urls.length}
            </p>
            <button type="button" onClick={close} aria-label="Close" className="absolute right-4 top-4 rounded-full bg-white/15 p-2 text-white hover:bg-white/25">
              <X className="size-6" />
            </button>
            {urls.length > 1 && (
              <>
                <button type="button" onClick={() => step(-1)} aria-label="Previous photo" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-2 text-white hover:bg-white/25">
                  <ChevronLeft className="size-7" />
                </button>
                <button type="button" onClick={() => step(1)} aria-label="Next photo" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-2 text-white hover:bg-white/25">
                  <ChevronRight className="size-7" />
                </button>
              </>
            )}
          </div>
        )}
      </dialog>
    </>
  );
}
