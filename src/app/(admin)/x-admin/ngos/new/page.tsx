import { randomUUID } from "node:crypto";
import { KeyRound } from "lucide-react";
import { NgoEditor } from "@/components/admin/NgoEditor";
import { adminHref, requireAdmin } from "@/lib/admin/auth";
import { emptyNgoForm } from "@/lib/ngoForm";
import { hasServiceKey } from "@/lib/supabase/admin";

export const metadata = { title: "Add NGO" };

export default async function NewNgoPage() {
  await requireAdmin();
  return (
    <main>
      {!hasServiceKey() && (
        <p role="status" className="mx-auto mt-4 flex max-w-[1600px] items-center gap-2 px-4 text-sm text-[#7a5500]">
          <KeyRound className="size-4" aria-hidden />
          You can fill in the form and preview it, but saving and photo uploads need SUPABASE_SERVICE_ROLE_KEY in .env.local.
        </p>
      )}
      {/* New NGOs upload photos into a fresh folder until they get an id. */}
      <NgoEditor id={null} initial={emptyNgoForm} initialStatus="draft" base={adminHref()} uploadFolder={`new-${randomUUID()}`} />
    </main>
  );
}
