import { randomUUID } from "node:crypto";
import { NgoEditor } from "@/components/admin/NgoEditor";
import { adminHref, requireAdmin } from "@/lib/admin/auth";
import { emptyNgoForm } from "@/lib/ngoForm";

export const metadata = { title: "Add NGO" };

export default async function NewNgoPage() {
  await requireAdmin();
  return (
    <main>
      {/* New NGOs upload photos into a fresh folder until they get an id. */}
      <NgoEditor id={null} initial={emptyNgoForm} initialStatus="draft" base={adminHref()} uploadFolder={`new-${randomUUID()}`} />
    </main>
  );
}
