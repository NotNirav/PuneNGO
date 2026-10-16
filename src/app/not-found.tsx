import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

// Plain public 404. Hidden admin routes also land here, so it must look completely ordinary.
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Container className="flex flex-col items-center py-24 text-center">
          <p className="font-hand text-3xl text-cobalt">Oops!</p>
          <h1 className="mt-2 text-4xl sm:text-5xl">Page not found</h1>
          <p className="mt-4 max-w-md text-muted">
            The page you&apos;re looking for doesn&apos;t exist or has moved.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/">Go home</ButtonLink>
            <ButtonLink href="/ngos" variant="outline">
              Browse NGOs
            </ButtonLink>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
