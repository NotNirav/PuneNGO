import Link from "next/link";
import { causes } from "@/config/causes";
import { cn } from "@/lib/cn";

const tints = ["bg-ice", "bg-peach", "bg-white"];

/** Grid of cause tiles → /causes/[slug]. */
export function CauseGrid({ counts, className }: { counts?: Map<string, number>; className?: string }) {
  return (
    <ul className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5", className)}>
      {causes.map((c, i) => {
        const n = counts?.get(c.slug) ?? 0;
        return (
          <li key={c.slug}>
            <Link
              href={`/causes/${c.slug}`}
              className={cn(
                "flex h-full flex-col gap-2 rounded-card p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift",
                tints[i % tints.length],
              )}
            >
              <span aria-hidden className="text-3xl">
                {c.emoji}
              </span>
              <span className="font-display text-[17px] font-bold leading-tight">{c.label}</span>
              {counts && (
                <span className="mt-auto text-sm text-muted">{n === 1 ? "1 NGO" : `${n} NGOs`}</span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
