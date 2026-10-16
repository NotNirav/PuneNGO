import { NgoTable } from "@/components/admin/NgoTable";
import { adminHref, requireAdmin } from "@/lib/admin/auth";
import { listAllNgos } from "@/lib/admin/data";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  await requireAdmin();

  const ngos = await listAllNgos();

  return (
    <main className="mx-auto max-w-[1600px] px-4 py-8 space-y-6">
      <NgoTable items={ngos} base={adminHref()} />
    </main>
  );
}
