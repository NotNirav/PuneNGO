import { ArrowRight, HandHeart, MessageCircle, Search } from "lucide-react";
import Link from "next/link";
import { CauseGrid } from "@/components/directory/CauseGrid";
import { NearMeButton } from "@/components/directory/NearMeButton";
import { NgoCard } from "@/components/ngo/NgoCard";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Field";
import { Sticker } from "@/components/ui/Sticker";
import { getCounts, getFeaturedNgos } from "@/lib/queries";

export const revalidate = 3600;

const steps = [
  { icon: HandHeart, title: "Pick a cause", text: "Education, animals, environment, elderly care — whatever matters to you." },
  { icon: Search, title: "Find an NGO", text: "Search by name or filter by area to find NGOs near you in Pune." },
  { icon: MessageCircle, title: "Contact them directly", text: "Call, WhatsApp or email them in one tap. No middleman, no fees." },
];

export default async function HomePage() {
  const [featured, counts] = await Promise.all([getFeaturedNgos(6), getCounts()]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-ice sm:size-[28rem]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-20 size-64 rounded-full bg-peach/70" />
        <Container className="relative py-14 sm:py-20">
          <div className="relative max-w-2xl">
            <Sticker className="absolute -top-9 right-0 sm:-right-28 sm:top-0">Free for NGOs</Sticker>
            <h1 className="text-[2.6rem] sm:text-6xl">
              Find an NGO in <span className="text-cobalt">Pune</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted">
              Search by cause and area, then contact them directly to donate, volunteer or help out.
            </p>

            <form action="/ngos" role="search" className="mt-7 flex flex-col gap-2 sm:flex-row">
              <label htmlFor="home-q" className="sr-only">
                Search NGOs
              </label>
              <div className="relative sm:flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden />
                <Input id="home-q" name="q" type="search" placeholder="Try “education” or “Kothrud”" className="h-13 pl-11 shadow-soft" />
              </div>
              <button
                type="submit"
                className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-cobalt px-7 font-semibold text-white hover:bg-cobalt-deep"
              >
                Search
              </button>
            </form>

            <NearMeButton className="mt-4" />

            {counts.total > 0 && (
              <p className="mt-6 text-sm text-muted">
                <strong className="text-ink">{counts.total}</strong> NGOs listed across Pune
              </p>
            )}
          </div>
        </Container>
      </section>

      {/* Causes */}
      <section aria-labelledby="causes-heading" className="py-10">
        <Container>
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 id="causes-heading" className="text-3xl sm:text-4xl">
              Browse by cause
            </h2>
            <Link href="/causes" className="hidden text-[15px] font-semibold text-cobalt hover:underline sm:block">
              Causes &amp; areas →
            </Link>
          </div>
          <CauseGrid counts={counts.byCause} />
        </Container>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section aria-labelledby="featured-heading" className="py-10">
          <Container>
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 id="featured-heading" className="text-3xl sm:text-4xl">
                Featured NGOs
              </h2>
              <ButtonLink href="/ngos" variant="ghost" size="sm">
                See all <ArrowRight aria-hidden />
              </ButtonLink>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((ngo) => (
                <li key={ngo.id}>
                  <NgoCard ngo={ngo} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* How it works */}
      <section aria-labelledby="how-heading" className="py-10">
        <Container>
          <div className="rounded-card-lg bg-cobalt px-6 py-10 text-white sm:px-10">
            <h2 id="how-heading" className="text-3xl sm:text-4xl">
              How it works
            </h2>
            <ol className="mt-8 grid gap-6 md:grid-cols-3">
              {steps.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-lime font-display text-xl font-extrabold text-ink">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="flex items-center gap-2 text-xl">
                      <s.icon className="size-5 text-lime" aria-hidden /> {s.title}
                    </h3>
                    <p className="mt-1 text-white/85">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      {/* Get listed */}
      <section aria-labelledby="listed-heading" className="py-10">
        <Container>
          <div className="flex flex-col items-start gap-5 rounded-card-lg bg-peach p-6 sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div>
              <p className="font-hand text-2xl text-[#7a3b22]">Run an NGO in Pune?</p>
              <h2 id="listed-heading" className="mt-1 text-3xl">
                Get listed for free
              </h2>
              <p className="mt-2 max-w-lg text-ink/80">
                Send us your details and we&apos;ll add your NGO so more people can find and contact you.
              </p>
            </div>
            <ButtonLink href="/list-your-ngo" size="lg">
              List your NGO <ArrowRight aria-hidden />
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
