import { ExternalLink, LayoutDashboard, LogOut, Plus } from "lucide-react";
import Link from "next/link";
import { logoutAction } from "@/lib/admin/authActions";
import { buttonClasses } from "@/components/ui/Button";

export function AdminHeader({ base }: { base: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink text-white">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-2 px-4">
        <Link href={base} className="mr-auto flex items-center gap-2 font-display text-lg font-extrabold">
          <span className="rounded-lg bg-lime px-2 py-0.5 text-ink">NGOConnect</span>
          <span className="hidden text-white/70 sm:inline">Studio</span>
        </Link>
        <Link href={base} className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-sm hover:bg-white/10 sm:flex">
          <LayoutDashboard className="size-4" aria-hidden /> Dashboard
        </Link>
        <Link href={`${base}/ngos/new`} className={buttonClasses({ variant: "lime", size: "sm" })}>
          <Plus aria-hidden /> <span className="hidden sm:inline">Add NGO</span>
          <span className="sm:hidden">Add</span>
        </Link>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm hover:bg-white/10"
          aria-label="View public site (opens in new tab)"
        >
          <ExternalLink className="size-4" aria-hidden /> <span className="hidden md:inline">View site</span>
        </a>
        <form action={logoutAction}>
          <button type="submit" className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm hover:bg-white/10" aria-label="Log out">
            <LogOut className="size-4" aria-hidden /> <span className="hidden md:inline">Log out</span>
          </button>
        </form>
      </div>
    </header>
  );
}
