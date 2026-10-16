import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "success" | "warning" | "cobalt" | "lime";

const tones: Record<Tone, string> = {
  neutral: "bg-[#efede6] text-muted",
  success: "bg-[#dcf5e4] text-[#16613a]",
  warning: "bg-[#fff1cc] text-[#7a5500]",
  cobalt: "bg-cobalt text-white",
  lime: "bg-lime text-ink",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide [&_svg]:size-3",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
