import { ExternalLink, HandHeart, Info, MapPin } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { areaName } from "@/config/areas";
import { helpTypeLabel } from "@/config/helpTypes";
import { ensureUrl } from "@/lib/contact";
import { cn } from "@/lib/cn";
import type { PublicNgo } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { FacebookIcon, InstagramIcon, LinkedinIcon, YoutubeIcon } from "./BrandIcons";
import { CauseChip } from "./CauseChip";
import { ContactCard, MobileContactBar } from "./ContactBar";
import { Gallery } from "./Gallery";
import { NgoImage, NgoLogo } from "./NgoImage";
import { ShareButton } from "./ShareButton";

export type NgoProfileData = Omit<PublicNgo, "id" | "published_at" | "updated_at" | "is_featured">;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-card bg-white p-5 shadow-soft @xl:p-7">
      <h2 className="mb-3 text-xl">{title}</h2>
      {children}
    </section>
  );
}

const has = (s: string | null | undefined) => !!s && s.trim().length > 0;

/**
 * The full public NGO profile. Pure/presentational so the admin live preview can
 * render it with unsaved form data. Uses CONTAINER queries (@3xl etc.), not
 * screen breakpoints, so the preview's Mobile/Desktop toggle works inside a pane.
 */
export function NgoProfile({ ngo, preview = false }: { ngo: NgoProfileData; preview?: boolean }) {
  const name = ngo.name || "Untitled NGO";
  const activities = ngo.activities.filter(has);
  const socials = [
    { url: ngo.instagram, label: "Instagram", icon: InstagramIcon },
    { url: ngo.facebook, label: "Facebook", icon: FacebookIcon },
    { url: ngo.linkedin, label: "LinkedIn", icon: LinkedinIcon },
    { url: ngo.youtube, label: "YouTube", icon: YoutubeIcon },
  ].filter((s) => has(s.url));

  const registration = [ngo.registration_type, ngo.registration_number].filter(has).join(" · ");
  const details = [
    ngo.founded_year ? { label: "Founded", value: String(ngo.founded_year) } : null,
    has(registration) ? { label: "Registration (as provided)", value: registration } : null,
    has(ngo.visiting_hours) ? { label: "Visiting hours", value: ngo.visiting_hours! } : null,
    ngo.languages.length ? { label: "Languages", value: ngo.languages.join(", ") } : null,
    has(ngo.address) ? { label: "Address", value: ngo.address! } : null,
  ].filter((d): d is { label: string; value: string } => d !== null);

  const showHelp = ngo.help_types.length > 0 || has(ngo.help_notes) || has(ngo.donation_link);

  return (
    <div className="@container">
      <div className={cn("mx-auto w-full max-w-6xl px-4 pb-28 pt-4 @3xl:px-6 @3xl:pb-10")}>
        {/* Cover */}
        <div className="relative aspect-[16/9] overflow-hidden rounded-card-lg bg-gradient-to-br from-ice via-paper to-peach @3xl:aspect-[16/6]">
          {ngo.cover_url && <NgoImage src={ngo.cover_url} alt="" fill priority={!preview} sizes="(min-width: 1152px) 1104px, 100vw" />}
        </div>

        {/* Header */}
        <header className="relative -mt-10 px-2 @3xl:-mt-14 @3xl:px-6">
          <NgoLogo name={name} src={ngo.logo_url} size={88} className="ring-4 ring-paper shadow-soft" />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <h1 className="text-3xl @3xl:text-5xl">{name}</h1>
            {ngo.is_sample && <Badge>Sample listing</Badge>}
          </div>
          {has(ngo.tagline) && <p className="mt-2 max-w-2xl text-lg text-muted">{ngo.tagline}</p>}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {ngo.area && (
              <Link
                href={`/areas/${ngo.area}`}
                className="inline-flex items-center gap-1 rounded-full bg-peach px-3 py-1 text-sm font-medium text-[#7a3b22] hover:ring-2 hover:ring-cobalt/30"
              >
                <MapPin className="size-3.5" aria-hidden /> {areaName(ngo.area)}, Pune
              </Link>
            )}
            {ngo.causes.map((c) => (
              <CauseChip key={c} slug={c} link />
            ))}
          </div>
        </header>

        <div className="mt-8 grid gap-5 @3xl:grid-cols-[1fr_300px] @3xl:items-start">
          <div className="flex min-w-0 flex-col gap-5">
            {has(ngo.description) && (
              <Section title="About">
                <p className="whitespace-pre-line leading-relaxed text-ink/90">{ngo.description}</p>
              </Section>
            )}

            {activities.length > 0 && (
              <Section title="What they do">
                <ul className="space-y-2">
                  {activities.map((a, i) => (
                    <li key={i} className="flex gap-3">
                      <span aria-hidden className="mt-2 size-2 shrink-0 rounded-full bg-cobalt" />
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {showHelp && (
              <Section title="How you can help">
                {ngo.help_types.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {ngo.help_types.map((h) => (
                      <Chip key={h} tone="lime">
                        <HandHeart aria-hidden /> {helpTypeLabel(h)}
                      </Chip>
                    ))}
                  </div>
                )}
                {has(ngo.help_notes) && <p className="mt-4 whitespace-pre-line rounded-2xl bg-ice p-4 text-[15px]">{ngo.help_notes}</p>}
                {has(ngo.donation_link) && (
                  <div className="mt-4">
                    <a href={ensureUrl(ngo.donation_link!)} target="_blank" rel="noopener noreferrer" className={buttonClasses({ variant: "primary" })}>
                      Donate on their website <ExternalLink aria-hidden />
                    </a>
                    <p className="mt-2 text-sm text-muted">This opens the NGO&apos;s own page. NGOConnect doesn&apos;t handle any payments.</p>
                  </div>
                )}
              </Section>
            )}

            {ngo.gallery_urls.length > 0 && (
              <Section title="Photos">
                <Gallery name={name} urls={ngo.gallery_urls} />
              </Section>
            )}

            {details.length > 0 && (
              <Section title="Details">
                <dl className="grid gap-4 @xl:grid-cols-2">
                  {details.map((d) => (
                    <div key={d.label} className={d.label === "Address" ? "@xl:col-span-2" : undefined}>
                      <dt className="text-sm font-semibold text-muted">{d.label}</dt>
                      <dd className="mt-0.5 whitespace-pre-line">{d.value}</dd>
                    </div>
                  ))}
                </dl>
              </Section>
            )}

            {socials.length > 0 && (
              <Section title="Follow them">
                <ul className="flex flex-wrap gap-2">
                  {socials.map(({ url, label, icon: Icon }) => (
                    <li key={label}>
                      <a href={ensureUrl(url!)} target="_blank" rel="noopener noreferrer" className={buttonClasses({ variant: "outline", size: "sm" })}>
                        <Icon /> {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            <p className="flex gap-2 rounded-2xl border border-dashed border-line p-4 text-sm text-muted">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
              Details provided by the NGO. Please contact them directly to donate or volunteer.
            </p>
          </div>

          {/* Desktop sidebar */}
          <aside className="hidden @3xl:sticky @3xl:top-24 @3xl:block">
            <ContactCard ngo={ngo}>
              <ShareButton title={name} url={`/ngos/${ngo.slug}`} className="w-full" />
            </ContactCard>
          </aside>

          {/* Mobile: share inline, contact pinned to the bottom */}
          <div className="@3xl:hidden">
            <ShareButton title={name} url={`/ngos/${ngo.slug}`} className="w-full" />
          </div>
        </div>
      </div>
      <MobileContactBar ngo={ngo} fixed={!preview} className="@3xl:hidden" />
    </div>
  );
}
