import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { adminHref, isAdmin } from "@/lib/admin/auth";

// Admin pages are reachable only via the secret ADMIN_PATH (see src/middleware.ts).
export const metadata: Metadata = {
  title: "Studio",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAdmin();
  return (
    <div className="min-h-dvh bg-[#f3f2ec]">
      {authed && <AdminHeader base={adminHref()} />}
      {children}
    </div>
  );
}
