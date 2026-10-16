import { Container } from "@/components/ui/Container";

export default function DirectoryLoading() {
  return (
    <Container className="py-8 sm:py-10">
      <span className="sr-only" role="status">
        Loading NGOs…
      </span>
      <div className="h-10 w-64 animate-pulse rounded-2xl bg-line/70" />
      <div className="mt-8 grid gap-5 lg:grid-cols-[300px_1fr]">
        <div className="hidden h-96 animate-pulse rounded-card bg-white lg:block" />
        <div className="flex flex-col gap-4">
          <div className="h-12 animate-pulse rounded-2xl bg-white" />
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-52 animate-pulse rounded-card bg-white shadow-soft" />
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}
