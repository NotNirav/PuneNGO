import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";

export function PageIntro({
  eyebrow,
  title,
  children,
  aside,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="border-b border-line/70 bg-gradient-to-b from-ice/60 to-paper">
      <Container className="flex flex-col gap-6 py-10 sm:py-14 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          {eyebrow && <div className="mb-3">{eyebrow}</div>}
          <h1 className="text-4xl sm:text-5xl">{title}</h1>
          {children && <div className="mt-4 text-lg text-muted">{children}</div>}
        </div>
        {aside}
      </Container>
    </section>
  );
}
