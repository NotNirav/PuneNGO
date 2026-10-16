import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "ice" | "peach" | "lime" | "outline";

const tones: Record<Tone, string> = {
  ice: "bg-ice text-cobalt-deep",
  peach: "bg-peach text-[#7a3b22]",
  lime: "bg-lime text-ink",
  outline: "border border-line bg-white text-ink",
};

const base = "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium [&_svg]:size-3.5";

export function Chip({
  children,
  tone = "ice",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return <span className={cn(base, tones[tone], className)}>{children}</span>;
}

export function ChipLink({
  href,
  children,
  tone = "ice",
  className,
}: {
  href: string;
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <Link href={href} className={cn(base, tones[tone], "transition hover:ring-2 hover:ring-cobalt/30", className)}>
      {children}
    </Link>
  );
}

/** Selectable chip for filters and multi-select inputs. */
export function ToggleChip({
  selected,
  onClick,
  children,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        base,
        "transition",
        selected ? "bg-cobalt text-white" : "border border-line bg-white text-ink hover:border-cobalt",
        className,
      )}
    >
      {children}
    </button>
  );
}
