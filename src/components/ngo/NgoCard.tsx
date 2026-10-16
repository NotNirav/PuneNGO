import { MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { areaName } from "@/config/areas";
import { telHref, whatsappHref } from "@/lib/contact";
import { cn } from "@/lib/cn";
import { formatDistance } from "@/lib/geo";
import type { PublicNgo } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import { CauseChip } from "./CauseChip";
import { NgoLogo } from "./NgoImage";
import { WhatsappIcon } from "./BrandIcons";

export type NgoCardData = Pick<
  PublicNgo,
  "slug" | "name" | "tagline" | "area" | "causes" | "phone" | "whatsapp" | "logo_url" | "is_sample"
>;

/**
 * Directory card. Pure/presentational — used by the public list AND the admin card preview.
 * The whole card links to the profile; Call/WhatsApp sit above that link.
 */
export function NgoCard({
  ngo,
  distanceKm,
  approxDistance,
  className,
}: {
  ngo: NgoCardData;
  distanceKm?: number;
  approxDistance?: boolean;
  className?: string;
}) {
  const shownCauses = ngo.causes.slice(0, 3);
  const extra = ngo.causes.length - shownCauses.length;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col rounded-card bg-white p-5 shadow-soft transition hover:shadow-lift focus-within:shadow-lift",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <NgoLogo name={ngo.name} src={ngo.logo_url} />
        <div className="min-w-0 flex-1">
          <h3 className="text-lg leading-snug">
            <Link
              href={`/ngos/${ngo.slug}`}
              className="after:absolute after:inset-0 after:rounded-card after:content-[''] group-hover:text-cobalt focus-visible:outline-none"
            >
              {ngo.name || "Untitled NGO"}
            </Link>
          </h3>
          {ngo.tagline && <p className="mt-1 line-clamp-2 text-[15px] text-muted">{ngo.tagline}</p>}
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            {ngo.area && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-4" aria-hidden /> {areaName(ngo.area)}
              </span>
            )}
            {distanceKm != null && (
              <span className="font-semibold text-cobalt-deep">
                {approxDistance ? "~" : ""}
                {formatDistance(distanceKm)} away
              </span>
            )}
          </p>
        </div>
      </div>

      {(shownCauses.length > 0 || ngo.is_sample) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {shownCauses.map((c) => (
            <CauseChip key={c} slug={c} />
          ))}
          {extra > 0 && <span className="self-center text-sm text-muted">+{extra} more</span>}
          {ngo.is_sample && <Badge className="self-center">Sample listing</Badge>}
        </div>
      )}

      {(ngo.phone || ngo.whatsapp) && (
        <div className="relative z-10 mt-auto flex gap-2 pt-5">
          {ngo.phone && (
            <a href={telHref(ngo.phone)} className={buttonClasses({ size: "sm", variant: "secondary" })}>
              <Phone aria-hidden /> Call
            </a>
          )}
          {ngo.whatsapp && (
            <a
              href={whatsappHref(ngo.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses({ size: "sm", variant: "secondary" })}
            >
              <WhatsappIcon /> WhatsApp
            </a>
          )}
        </div>
      )}
    </article>
  );
}
