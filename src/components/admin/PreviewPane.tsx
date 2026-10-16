"use client";

import { LayoutList, Monitor, Smartphone } from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { cn } from "@/lib/cn";
import { NgoCard } from "@/components/ngo/NgoCard";
import { NgoProfile, type NgoProfileData } from "@/components/ngo/NgoProfile";

type Mode = "mobile" | "desktop" | "card";

const DESKTOP_WIDTH = 1180;

/**
 * Live preview using the SAME components as the public site. NgoProfile uses
 * container queries, so rendering it at 390px or 1180px gives the true mobile
 * or desktop layout regardless of the admin's screen size.
 */
export function PreviewPane({ data, className }: { data: NgoProfileData; className?: string }) {
  const [mode, setMode] = useState<Mode>("mobile");
  const frame = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.5);

  // Desktop mode: scale a 1180px-wide page down to fit the pane.
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (w > 0) setZoom(Math.min(1, (w - 2) / DESKTOP_WIDTH)); // ignore while hidden (width 0)
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Allow action links (tel, WhatsApp, directions, website) to open safely in a new tab,
  // but prevent internal navigation that would leave the editor.
  const blockLinks = (e: MouseEvent) => {
    const a = (e.target as HTMLElement).closest("a");
    if (!a) return;
    const href = a.getAttribute("href") || "";
    if (a.target === "_blank" || /^(https?:|tel:|mailto:)/.test(href)) {
      if (!a.target && href.startsWith("http")) {
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      }
      return;
    }
    e.preventDefault();
  };

  const tabs: { id: Mode; label: string; icon: typeof Monitor }[] = [
    { id: "mobile", label: "Mobile", icon: Smartphone },
    { id: "desktop", label: "Desktop", icon: Monitor },
    { id: "card", label: "Card", icon: LayoutList },
  ];

  return (
    <div className={cn("flex min-h-0 min-w-0 flex-col gap-3", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">Live preview</p>
        <div role="tablist" aria-label="Preview size" className="flex rounded-full bg-white p-1 shadow-soft">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={mode === t.id}
              onClick={() => setMode(t.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition",
                mode === t.id ? "bg-cobalt text-white" : "text-muted hover:text-ink",
              )}
            >
              <t.icon className="size-4" aria-hidden /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div ref={frame} onClickCapture={blockLinks} className="min-h-0 min-w-0 flex-1">
        {mode === "mobile" && (
          <div className="mx-auto h-[min(760px,calc(100dvh-220px))] w-[390px] max-w-full overflow-y-auto overflow-x-hidden rounded-[36px] border-[10px] border-ink bg-paper shadow-lift">
            <NgoProfile ngo={data} preview />
          </div>
        )}

        {mode === "desktop" && (
          <div className="h-[min(760px,calc(100dvh-220px))] w-full overflow-y-auto overflow-x-hidden rounded-2xl border border-line bg-paper shadow-lift">
            <div style={{ width: DESKTOP_WIDTH, zoom }} className="shrink-0">
              <NgoProfile ngo={data} preview />
            </div>
          </div>
        )}

        {mode === "card" && (
          <div className="rounded-2xl bg-paper p-6">
            <p className="mb-3 text-sm text-muted">How it looks in the directory list:</p>
            <div className="max-w-sm">
              <NgoCard ngo={data} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
