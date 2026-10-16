"use client";

import { LocateFixed, Loader2, SearchX } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { distanceKm, ngoLocation } from "@/lib/geo";
import type { PublicNgo } from "@/lib/types";
import { useGeolocation } from "@/lib/useGeolocation";
import { buttonClasses } from "@/components/ui/Button";
import { NgoCard } from "@/components/ngo/NgoCard";
import { AreaJump } from "./AreaJump";

/**
 * Renders the (already filtered) list. When sort = nearest, it asks for the
 * visitor's location on click and sorts by distance — all in the browser.
 */
export function DirectoryResults({
  ngos,
  nearest,
  clearHref,
  wide = false,
}: {
  ngos: PublicNgo[];
  nearest: boolean;
  clearHref?: string;
  /** Full-width page (no filter sidebar) → allow 3 columns. */
  wide?: boolean;
}) {
  const { state, request } = useGeolocation({ autoIfGranted: nearest });

  const items = useMemo(() => {
    if (!nearest || state.status !== "ready") return ngos.map((ngo) => ({ ngo, km: undefined, approx: false }));
    return ngos
      .map((ngo) => {
        const loc = ngoLocation(ngo);
        return { ngo, km: distanceKm(state.coords, loc), approx: loc.approx };
      })
      .sort((a, b) => a.km - b.km);
  }, [ngos, nearest, state]);

  return (
    <div className="flex flex-col gap-4">
      {nearest && state.status !== "ready" && (
        <div className="flex flex-col gap-3 rounded-card bg-ice p-5 sm:flex-row sm:items-center sm:justify-between">
          {state.status === "denied" || state.status === "error" || state.status === "unsupported" ? (
            <div className="w-full space-y-3">
              <p className="text-[15px]">
                {state.status === "unsupported"
                  ? "Your browser doesn't support location."
                  : "We couldn't use your location — that's okay!"}{" "}
                Showing A–Z instead.
              </p>
              <div className="max-w-xs">
                <AreaJump id="dir-area-jump" />
              </div>
            </div>
          ) : (
            <>
              <p className="text-[15px]">Allow location to sort NGOs by distance. We never store it.</p>
              <button
                type="button"
                onClick={request}
                disabled={state.status === "locating"}
                className={buttonClasses({ size: "sm" })}
              >
                {state.status === "locating" ? <Loader2 className="animate-spin" aria-hidden /> : <LocateFixed aria-hidden />}
                {state.status === "locating" ? "Locating…" : "Use my location"}
              </button>
            </>
          )}
        </div>
      )}

      <p className="text-sm text-muted" aria-live="polite">
        {ngos.length === 1 ? "1 NGO" : `${ngos.length} NGOs`}
        {nearest && state.status === "ready" && " · nearest first (~ means approximate area distance)"}
      </p>

      {ngos.length === 0 ? (
        <div className="flex flex-col items-center rounded-card bg-white px-6 py-14 text-center shadow-soft">
          <SearchX className="size-10 text-cobalt" aria-hidden />
          <h2 className="mt-3 text-2xl">No NGOs match these filters</h2>
          <p className="mt-2 max-w-sm text-muted">Try removing a filter or searching for something broader.</p>
          {clearHref && (
            <Link href={clearHref} className={buttonClasses({}, "mt-6")}>
              Clear filters
            </Link>
          )}
        </div>
      ) : (
        <ul className={wide ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "grid gap-4 sm:grid-cols-2"}>
          {items.map(({ ngo, km, approx }) => (
            <li key={ngo.id}>
              <NgoCard ngo={ngo} distanceKm={km} approxDistance={approx} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
