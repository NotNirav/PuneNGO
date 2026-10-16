import { Eye, Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NgoProfile } from "@/components/ngo/NgoProfile";
import { ServiceKeyNotice } from "@/components/admin/ServiceKeyNotice";
import { buttonClasses } from "@/components/ui/Button";
import { adminHref, requireAdmin } from "@/lib/admin/auth";
import { getNgoForAdmin } from "@/lib/admin/data";
import { formToProfile, rowToForm } from "@/lib/ngoForm";
import { hasServiceKey } from "@/lib/supabase/admin";

export const metadata = { title: "Preview" };

/** Full-page preview of any NGO, drafts included, using the real public profile component. */
export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  if (!hasServiceKey()) {
    return (
      <main className="px-4 py-8">
        <ServiceKeyNotice />
      </main>
    );
  }
  const found = await getNgoForAdmin((await params).id);
  if (!found) notFound();
  const { row, priv } = found;
  const live = row.status === "published";

  return (
    <main>
      <div className={live ? "bg-[#dcf5e4]" : "bg-lime"}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <Eye className="size-5" aria-hidden />
          <p className="mr-auto font-semibold">
            {live ? "Preview — this NGO is live on the site." : "Preview — not public yet."}
          </p>
          <Link href={`${adminHref()}/ngos/${row.id}/edit`} className={buttonClasses({ size: "sm", variant: "outline" })}>
            <Pencil aria-hidden /> Edit
          </Link>
          {live && (
            <a href={`/ngos/${row.slug}`} target="_blank" rel="noopener noreferrer" className={buttonClasses({ size: "sm" })}>
              View live page
            </a>
          )}
        </div>
      </div>
      <NgoProfile ngo={formToProfile(rowToForm(row, priv))} />
    </main>
  );
}
