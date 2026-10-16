import type { Metadata } from "next";
import { Ban, HandHeart, Lightbulb, Search } from "lucide-react";
import { site } from "@/config/site";
import { PageIntro } from "@/components/layout/PageIntro";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "About",
  description: "What NGOConnect is, why we built it, and who we are.",
  alternates: { canonical: "/about" },
};

const doesNot = [
  "We don't take donations or payments — you pay the NGO directly.",
  "We don't verify or rate NGOs. We publish the details they share with us.",
  "No accounts, no sign-ups, no tracking of your location.",
];

export default function AboutPage() {
  return (
    <>
      <PageIntro eyebrow={<span className="font-hand text-2xl text-cobalt">Hello!</span>} title="About NGOConnect">
        A simple, free directory that helps people in {site.city} find NGOs by cause and area — and contact them
        directly.
      </PageIntro>

      <Container className="grid gap-5 py-10 md:grid-cols-2">
        <section className="rounded-card bg-white p-6 shadow-soft">
          <Lightbulb className="size-8 text-cobalt" aria-hidden />
          <h2 className="mt-3 text-2xl">Why we built it</h2>
          <p className="mt-2 text-muted">
            Many people want to help but don&apos;t know which NGOs exist near them, and many small NGOs struggle to be
            found online. NGOConnect puts them in one easy place, so a quick search leads straight to a phone call or a
            WhatsApp message.
          </p>
        </section>

        <section className="rounded-card bg-white p-6 shadow-soft">
          <Search className="size-8 text-cobalt" aria-hidden />
          <h2 className="mt-3 text-2xl">How it works</h2>
          <p className="mt-2 text-muted">
            NGOs send us their details, we add them to the directory, and you can search by cause, area or way to help.
            Every profile has one-tap buttons to call, WhatsApp, email or get directions.
          </p>
        </section>

        <section className="rounded-card bg-ice p-6 md:col-span-2">
          <h2 className="flex items-center gap-2 text-2xl">
            <Ban className="size-6 text-cobalt" aria-hidden /> What we don&apos;t do
          </h2>
          <ul className="mt-3 space-y-2">
            {doesNot.map((d) => (
              <li key={d} className="flex gap-3">
                <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-cobalt" />
                {d}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-card bg-peach p-6 md:col-span-2">
          <h2 className="text-2xl">A Design Thinking project</h2>
          <p className="mt-2 text-ink/80">
            NGOConnect is a college Design Thinking project at {site.college}. We started by surveying people about how
            they find and contact NGOs, then designed this site around what they told us.
          </p>
          <h3 className="mt-5 text-lg">The team</h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {site.team.map((name) => (
              <li key={name} className="rounded-full bg-white px-4 py-2 font-semibold">
                {name}
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-wrap gap-3 md:col-span-2">
          <ButtonLink href="/ngos">
            <HandHeart aria-hidden /> Find an NGO
          </ButtonLink>
          <ButtonLink href="/list-your-ngo" variant="outline">
            List your NGO
          </ButtonLink>
        </div>
      </Container>
    </>
  );
}
