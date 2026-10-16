import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Tilted lime "sticker" accent. Use sparingly — one or two per page. */
export function Sticker({
  children,
  tilt = -6,
  className,
}: {
  children: ReactNode;
  tilt?: number;
  className?: string;
}) {
  return (
    <span
      style={{ transform: `rotate(${tilt}deg)` }}
      className={cn(
        "inline-block rounded-xl bg-lime px-3 py-1 font-hand text-xl font-bold leading-tight text-ink shadow-soft",
        className,
      )}
    >
      {children}
    </span>
  );
}
