import { notFound } from "next/navigation";
import { NgoEditor } from "@/components/admin/NgoEditor";
import { adminHref, requireAdmin } from "@/lib/admin/auth";
import { getNgoForAdmin } from "@/lib/admin/data";
import { rowToForm } from "@/lib/ngoForm";

export const metadata = { title: "Edit NGO" };

export default async function EditNgoPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const found = await getNgoForAdmin(id);
  if (!found) notFound();
  const { row, priv } = found;

  return (
    <main>
      <NgoEditor
        // Remount with fresh values after a save → refresh.
        key={row.updated_at}
        id={row.id}
        initial={rowToForm(row, priv)}
        initialStatus={row.status === "published" ? "published" : "draft"}
        serverUpdatedAt={row.updated_at}
        base={adminHref()}
        uploadFolder={row.id}
      />
    </main>
  );
}
