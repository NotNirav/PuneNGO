"use client";

import { LocateFixed, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useGeolocation } from "@/lib/useGeolocation";
import { cn } from "@/lib/cn";
import { buttonClasses } from "@/components/ui/Button";
import { AreaJump } from "./AreaJump";

/** Home-page button: asks for location on click, then opens the directory sorted by distance. */
export function NearMeButton({ className }: { className?: string }) {
  const router = useRouter();
  const { state, request } = useGeolocation();

  useEffect(() => {
    if (state.status === "ready") router.push("/ngos?sort=nearest");
  }, [state.status, router]);

  const failed = state.status === "denied" || state.status === "error" || state.status === "unsupported";

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <button
        type="button"
        onClick={request}
        disabled={state.status === "locating"}
        className={buttonClasses({ variant: "lime", size: "lg" }, "self-start")}
      >
        {state.status === "locating" ? <Loader2 className="animate-spin" aria-hidden /> : <LocateFixed aria-hidden />}
        {state.status === "locating" ? "Finding you…" : "Show NGOs near me"}
      </button>
      {failed && (
        <div role="status" className="max-w-sm rounded-2xl bg-white p-4 shadow-soft">
          <p className="mb-3 text-sm text-muted">
            {state.status === "unsupported"
              ? "Your browser doesn't support location."
              : "No problem — we couldn't use your location."}{" "}
            Pick your area instead:
          </p>
          <AreaJump id="home-area-jump" label="Your area" />
        </div>
      )}
    </div>
  );
}
