import type { Metadata } from "next";
import { CheckCircle2, Mail } from "lucide-react";
import { site } from "@/config/site";
import { WhatsappIcon } from "@/components/ngo/BrandIcons";
import { PageIntro } from "@/components/layout/PageIntro";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Sticker } from "@/components/ui/Sticker";
import { mailHref, whatsappHref } from "@/lib/contact";

export const metadata: Metadata = {
  title: "List your NGO for free",
  description: "Run an NGO in Pune? Send us your details and we'll list you on NGOConnect for free.",
  alternates: { canonical: "/list-your-ngo" },
};

const required = [
  "NGO name",
  "A short description of your work (a few lines)",
  "The causes you work on (e.g. Education, Animal Welfare)",
  "Your area in Pune",
  "At least one way to contact you: phone, WhatsApp or email",
];

const optional = [
  "A one-line tagline",
  "What you do (a few bullet points)",
  "How people can help: donate money/items, volunteer, internships, pro-bono help, events",
  "What you need right now (e.g. weekend volunteers)",
  "Full address and Google Maps link",
  "Website, Instagram, Facebook, LinkedIn, YouTube",
  "Your own donation page link (we only link to it — we never handle money)",
  "Year founded, registration type and number (Trust / Society / Section 8)",
  "Visiting hours and languages spoken",
  "Logo, a cover photo and up to 6 photos",
  "Name and phone of the person sharing the details (kept private, never shown)",
];

const emailTemplate = `Hi NGOConnect team,

Please list our NGO. Details below:

NGO name:
Area in Pune:
Causes:
Short description:
Phone / WhatsApp:
Email:
Website / Instagram:
Ways people can help:
Contact person (private):

(Photos attached)`;

export default function ListYourNgoPage() {
  return (
    <>
      <PageIntro
        eyebrow={<Sticker tilt={-4}>100% free</Sticker>}
        title="List your NGO on NGOConnect"
      >
        Help more people in {site.city} find you. Send us your details on WhatsApp or email and we&apos;ll add your
        profile — usually within a few days.
      </PageIntro>

      <Container className="grid gap-5 py-10 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="flex flex-col gap-5">
          <section className="rounded-card bg-white p-6 shadow-soft">
            <h2 className="text-2xl">What we need</h2>
            <ul className="mt-4 space-y-2">
              {required.map((r) => (
                <li key={r} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-cobalt" aria-hidden />
                  {r}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-card bg-white p-6 shadow-soft">
            <h2 className="text-2xl">Nice to have</h2>
            <p className="mt-1 text-muted">The more you share, the better your profile looks.</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {optional.map((o) => (
                <li key={o} className="flex gap-3 text-[15px]">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-cobalt" />
                  {o}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-card bg-ice p-6">
            <h2 className="text-2xl">Good to know</h2>
            <ul className="mt-3 space-y-2 text-[15px]">
              <li>Listing is free, and always will be.</li>
              <li>We publish the details you give us. We don&apos;t verify or rate NGOs.</li>
              <li>Donations and volunteering happen directly between you and the public.</li>
              <li>Want something changed or removed? Just message us.</li>
            </ul>
          </section>
        </div>

        <aside className="rounded-card bg-cobalt p-6 text-white lg:sticky lg:top-24">
          <h2 className="text-2xl">Send your details</h2>
          <p className="mt-2 text-white/85">Pick whichever is easier for you.</p>
          <div className="mt-5 flex flex-col gap-2">
            <ButtonLink
              href={whatsappHref(site.contact.whatsapp, "Hi! I'd like to list our NGO on NGOConnect.")}
              variant="lime"
              className="w-full"
            >
              <WhatsappIcon /> WhatsApp us
            </ButtonLink>
            <ButtonLink
              href={`${mailHref(site.contact.email, "List our NGO on NGOConnect")}&body=${encodeURIComponent(emailTemplate)}`}
              variant="secondary"
              className="w-full"
            >
              <Mail aria-hidden /> Email us
            </ButtonLink>
          </div>
          <p className="mt-4 text-sm text-white/75">
            {site.contact.email} · {site.contact.whatsapp}
          </p>
        </aside>
      </Container>
    </>
  );
}
