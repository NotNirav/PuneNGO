import { Globe, Mail, Navigation, Phone } from "lucide-react";
import type { ReactNode } from "react";
import { ensureUrl, mailHref, telHref, whatsappHref } from "@/lib/contact";
import { cn } from "@/lib/cn";
import { buttonClasses } from "@/components/ui/Button";
import { WhatsappIcon } from "./BrandIcons";

type ContactFields = {
  name: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  maps_url: string | null;
};

type Action = { key: string; label: string; href: string; icon: ReactNode; external: boolean };

/** Only actions whose data exists — never a broken button. */
export function contactActions(ngo: ContactFields): Action[] {
  const actions: Action[] = [];
  if (ngo.phone) actions.push({ key: "call", label: "Call", href: telHref(ngo.phone), icon: <Phone />, external: false });
  if (ngo.whatsapp)
    actions.push({
      key: "whatsapp",
      label: "WhatsApp",
      href: whatsappHref(ngo.whatsapp, `Hi ${ngo.name}, I found you on NGOConnect.`),
      icon: <WhatsappIcon />,
      external: true,
    });
  if (ngo.email)
    actions.push({ key: "email", label: "Email", href: mailHref(ngo.email, "Found you on NGOConnect"), icon: <Mail />, external: false });
  if (ngo.website) actions.push({ key: "website", label: "Website", href: ensureUrl(ngo.website), icon: <Globe />, external: true });
  if (ngo.maps_url)
    actions.push({ key: "directions", label: "Directions", href: ensureUrl(ngo.maps_url), icon: <Navigation />, external: true });
  return actions;
}

function linkProps(a: Action) {
  return a.external ? { target: "_blank", rel: "noopener noreferrer" } : {};
}

/** Desktop sidebar card. */
export function ContactCard({ ngo, children }: { ngo: ContactFields; children?: ReactNode }) {
  const actions = contactActions(ngo);
  return (
    <div className="rounded-card bg-white p-5 shadow-soft">
      <h2 className="text-lg">Contact {ngo.name ? "them" : ""} directly</h2>
      {actions.length > 0 ? (
        <div className="mt-4 flex flex-col gap-2">
          {actions.map((a, i) => (
            <a
              key={a.key}
              href={a.href}
              {...linkProps(a)}
              className={buttonClasses({ variant: i === 0 ? "primary" : "secondary" }, "w-full justify-start")}
            >
              <span aria-hidden className="contents">
                {a.icon}
              </span>
              {a.label}
            </a>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted">No contact details yet.</p>
      )}
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

/**
 * Mobile bottom bar. `fixed` pins it to the screen; the admin preview passes
 * fixed={false} so it stays inside the preview frame.
 */
export function MobileContactBar({ ngo, fixed = true, className }: { ngo: ContactFields; fixed?: boolean; className?: string }) {
  const actions = contactActions(ngo);
  if (actions.length === 0) return null;
  return (
    <nav
      aria-label="Contact"
      data-contact-bar={fixed ? "fixed" : "inline"}
      className={cn(
        "z-30 border-t border-line bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur",
        fixed ? "fixed inset-x-0 bottom-0" : "sticky bottom-0",
        className,
      )}
    >
      <ul className="mx-auto flex max-w-lg justify-around">
        {actions.map((a) => (
          <li key={a.key} className="flex-1">
            <a
              href={a.href}
              {...linkProps(a)}
              className="flex flex-col items-center gap-1 rounded-2xl px-1 py-1.5 text-xs font-semibold text-ink hover:bg-ice [&_svg]:size-5 [&_svg]:text-cobalt"
            >
              <span aria-hidden className="contents">
                {a.icon}
              </span>
              {a.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
