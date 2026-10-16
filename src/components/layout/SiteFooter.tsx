import Link from "next/link";
import { publicNav, site } from "@/config/site";
import { Container } from "@/components/ui/Container";
import { Logo } from "./Logo";

// Deliberately contains no link to the admin panel.
export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line bg-white">
      <Container className="grid gap-8 py-10 md:grid-cols-[1.2fr_1fr]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-md text-[15px] text-muted">{site.description}</p>
        </div>

        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-[15px]">
            {publicNav.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-ink hover:text-cobalt hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/admin" className="text-muted hover:text-cobalt hover:underline">
                Admin Portal
              </Link>
            </li>
          </ul>
        </nav>
      </Container>

      <div className="border-t border-line">
        <Container className="space-y-2 py-6 text-sm text-muted">
          <p>{site.disclaimer}</p>
          <p>
            © {new Date().getFullYear()} {site.name} · A Design Thinking project, {site.college}
          </p>
        </Container>
      </div>
    </footer>
  );
}
