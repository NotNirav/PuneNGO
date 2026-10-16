import Link from "next/link";
import { HeartHandshake } from "lucide-react";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-display text-xl font-extrabold tracking-tight text-ink">
      <span className="grid size-9 place-items-center rounded-xl bg-cobalt text-lime">
        <HeartHandshake className="size-5" aria-hidden />
      </span>
      NGO<span className="-ml-2 text-cobalt">Connect</span>
    </Link>
  );
}
