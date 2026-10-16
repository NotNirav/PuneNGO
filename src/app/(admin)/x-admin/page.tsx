import { NgoTable } from "@/components/admin/NgoTable";
import { adminHref, requireAdmin } from "@/lib/admin/auth";
import { listAllNgos } from "@/lib/admin/data";
import { hasServiceKey } from "@/lib/supabase/admin";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  await requireAdmin();

  const serviceKeyPresent = hasServiceKey();
  const ngos = await listAllNgos();

  return (
    <main className="mx-auto max-w-[1600px] px-4 py-8 space-y-6">
      {!serviceKeyPresent && (
        <div className="rounded-card border border-amber-300 bg-amber-50 p-5 shadow-xs">
          <p className="font-semibold text-amber-900 text-base">⚠️ Note: SUPABASE_SERVICE_ROLE_KEY is not yet set in .env.local</p>
          <p className="text-sm text-amber-800 mt-1">
            Displaying published listings in read-only mode. To add, edit, or delete listings, paste your Supabase <code>SUPABASE_SERVICE_ROLE_KEY</code> into <code>.env.local</code>.
          </p>
        </div>
      )}
      <NgoTable items={ngos} base={adminHref()} />
    </main>
  );
}
