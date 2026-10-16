"use client";

import { Share2 } from "lucide-react";
import { buttonClasses } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

/** Web Share API on phones; copies the link elsewhere. */
export function ShareButton({ title, url, className }: { title: string; url: string; className?: string }) {
  const toast = useToast();

  async function share() {
    const fullUrl = new URL(url, window.location.origin).toString();
    if (navigator.share) {
      try {
        await navigator.share({ title, url: fullUrl });
      } catch {
        /* user cancelled */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(fullUrl);
      toast({ message: "Link copied to clipboard" });
    } catch {
      toast({ message: "Couldn't copy the link", tone: "error" });
    }
  }

  return (
    <button type="button" onClick={share} className={buttonClasses({ variant: "outline", size: "md" }, className)}>
      <Share2 aria-hidden /> Share
    </button>
  );
}
