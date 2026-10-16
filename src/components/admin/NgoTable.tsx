"use client";

import { Copy, Eye, Pencil, Search, Star, Trash2, Upload, Undo2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { areaName, areas } from "@/config/areas";
import { causeLabel, causes } from "@/config/causes";
import type { AdminNgoListItem } from "@/lib/admin/data";
import { deleteNgo, deleteSampleNgos, duplicateNgo, setPublished } from "@/lib/admin/ngoActions";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input, Select } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { NgoLogo } from "@/components/ngo/NgoImage";

type Confirm = { kind: "delete"; ngo: AdminNgoListItem } | { kind: "samples" } | null;

const dateFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });

export function NgoTable({ items, base }: { items: AdminNgoListItem[]; base: string }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [cause, setCause] = useState("");
  const [area, setArea] = useState("");

  const counts = useMemo(
    () => ({
      total: items.length,
      published: items.filter((n) => n.status === "published").length,
      drafts: items.filter((n) => n.status === "draft").length,
      samples: items.filter((n) => n.is_sample).length,
    }),
    [items],
  );

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter(
      (n) =>
        (!needle || n.name.toLowerCase().includes(needle) || n.slug.includes(needle)) &&
        (!status || n.status === status) &&
        (!cause || n.causes.includes(cause)) &&
        (!area || n.area === area),
    );
  }, [items, q, status, cause, area]);

  function run(id: string | null, fn: () => Promise<{ ok: boolean; message?: string }>, success: string) {
    setBusyId(id);
    startTransition(async () => {
      const res = await fn();
      setBusyId(null);
      if (res.ok) {
        toast({ message: success });
        router.refresh();
      } else {
        toast({ message: res.message ?? "Something went wrong", tone: "error" });
      }
    });
  }

  const togglePublish = (n: AdminNgoListItem) => {
    const publish = n.status !== "published";
    run(n.id, () => setPublished(n.id, publish), publish ? `“${n.name}” is now live` : `“${n.name}” is hidden from the public site`);
  };

  const duplicate = (n: AdminNgoListItem) => {
    setBusyId(n.id);
    startTransition(async () => {
      const res = await duplicateNgo(n.id);
      setBusyId(null);
      if (res.ok) {
        toast({ message: "Copy created as a draft" });
        router.push(`${base}/ngos/${res.id}/edit`);
      } else toast({ message: res.message, tone: "error" });
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl">NGOs</h1>
          <p className="mt-1 text-muted">Add, edit and publish listings. Published changes appear on the site within seconds.</p>
        </div>
        <Link href={`${base}/ngos/new`} className={buttonClasses()}>
          + Add NGO
        </Link>
      </div>

      <dl className="grid grid-cols-3 gap-3 sm:max-w-xl">
        {[
          { label: "Total", value: counts.total, tone: "bg-white" },
          { label: "Published", value: counts.published, tone: "bg-[#dcf5e4]" },
          { label: "Drafts", value: counts.drafts, tone: "bg-[#fff1cc]" },
        ].map((c) => (
          <div key={c.label} className={cn("rounded-2xl p-4 shadow-soft", c.tone)}>
            <dt className="text-sm text-muted">{c.label}</dt>
            <dd className="font-display text-3xl font-extrabold">{c.value}</dd>
          </div>
        ))}
      </dl>

      {/* Filters */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_160px_200px_200px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <label htmlFor="adm-q" className="sr-only">
            Search
          </label>
          <Input id="adm-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name" className="pl-10" />
        </div>
        <Select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </Select>
        <Select aria-label="Cause" value={cause} onChange={(e) => setCause(e.target.value)}>
          <option value="">All causes</option>
          {causes.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </Select>
        <Select aria-label="Area" value={area} onChange={(e) => setArea(e.target.value)}>
          <option value="">All areas</option>
          {areas.map((a) => (
            <option key={a.slug} value={a.slug}>
              {a.name}
            </option>
          ))}
        </Select>
      </div>

      {/* List */}
      {shown.length === 0 ? (
        <div className="rounded-card bg-white p-10 text-center shadow-soft">
          <p className="text-lg font-semibold">{items.length === 0 ? "No NGOs yet" : "Nothing matches these filters"}</p>
          {items.length === 0 && (
            <Link href={`${base}/ngos/new`} className={buttonClasses({}, "mt-4")}>
              Add your first NGO
            </Link>
          )}
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          <li className="hidden grid-cols-[minmax(0,2.2fr)_1fr_1.6fr_110px_120px_auto] gap-4 px-4 text-xs font-semibold uppercase tracking-wide text-muted lg:grid">
            <span>Name</span>
            <span>Area</span>
            <span>Causes</span>
            <span>Status</span>
            <span>Updated</span>
            <span className="w-[228px] text-right">Actions</span>
          </li>
          {shown.map((n) => {
            const busy = pending && busyId === n.id;
            return (
              <li
                key={n.id}
                className={cn(
                  "grid gap-3 rounded-2xl bg-white p-4 shadow-soft lg:grid-cols-[minmax(0,2.2fr)_1fr_1.6fr_110px_120px_auto] lg:items-center lg:gap-4",
                  busy && "opacity-60",
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <NgoLogo name={n.name} src={n.logo_url} size={40} className="rounded-xl" />
                  <div className="min-w-0">
                    <Link href={`${base}/ngos/${n.id}/edit`} className="block truncate font-semibold hover:text-cobalt">
                      {n.name}
                    </Link>
                    <div className="flex items-center gap-1.5 text-xs text-muted">
                      {n.is_featured && (
                        <span className="inline-flex items-center gap-0.5 text-[#7a5500]">
                          <Star className="size-3 fill-current" aria-hidden /> Featured
                        </span>
                      )}
                      {n.is_sample && <span>· Sample</span>}
                      <span className="truncate">/{n.slug}</span>
                    </div>
                  </div>
                </div>
                <span className="text-sm">{n.area ? areaName(n.area) : <span className="text-muted">—</span>}</span>
                <span className="truncate text-sm text-muted" title={n.causes.map(causeLabel).join(", ")}>
                  {n.causes.length ? n.causes.map(causeLabel).join(", ") : "—"}
                </span>
                <span>
                  {n.status === "published" ? <Badge tone="success">Published</Badge> : <Badge tone="warning">Draft</Badge>}
                </span>
                <span className="text-sm text-muted">{dateFmt.format(new Date(n.updated_at))}</span>
                <div className="flex flex-wrap gap-1 lg:justify-end">
                  <Link href={`${base}/ngos/${n.id}/edit`} className={buttonClasses({ variant: "secondary", size: "sm" })}>
                    <Pencil aria-hidden /> Edit
                  </Link>
                  <IconButton label="Preview" onClick={() => router.push(`${base}/preview/${n.id}`)}>
                    <Eye />
                  </IconButton>
                  <IconButton
                    label={n.status === "published" ? "Unpublish" : "Publish"}
                    onClick={() => togglePublish(n)}
                    disabled={busy}
                  >
                    {n.status === "published" ? <Undo2 /> : <Upload />}
                  </IconButton>
                  <IconButton label="Duplicate" onClick={() => duplicate(n)} disabled={busy}>
                    <Copy />
                  </IconButton>
                  <IconButton label="Delete" onClick={() => setConfirm({ kind: "delete", ngo: n })} disabled={busy} danger>
                    <Trash2 />
                  </IconButton>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {counts.samples > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-line bg-white/60 p-4">
          <p className="text-sm text-muted">
            {counts.samples} sample listing{counts.samples === 1 ? "" : "s"}. Remove them before the real launch.
          </p>
          <Button variant="outline" size="sm" onClick={() => setConfirm({ kind: "samples" })}>
            <Trash2 aria-hidden /> Delete all sample listings
          </Button>
        </div>
      )}

      <Dialog
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        title={confirm?.kind === "samples" ? "Delete all sample listings?" : "Delete this NGO?"}
      >
        <p className="text-muted">
          {confirm?.kind === "samples"
            ? `This permanently removes ${counts.samples} sample listing(s). Real NGOs are not affected.`
            : confirm?.kind === "delete"
              ? `“${confirm.ngo.name}” and its private notes and photos will be permanently deleted. This can't be undone.`
              : null}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirm(null)}>
            Cancel
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700"
            onClick={() => {
              const c = confirm;
              setConfirm(null);
              if (c?.kind === "delete") run(c.ngo.id, () => deleteNgo(c.ngo.id), `Deleted “${c.ngo.name}”`);
              if (c?.kind === "samples") run(null, () => deleteSampleNgos(), "Sample listings deleted");
            }}
          >
            <Trash2 aria-hidden /> Delete
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
  disabled,
  danger,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={cn(
        "grid size-9 place-items-center rounded-full border border-line bg-white transition disabled:opacity-50 [&_svg]:size-4",
        danger ? "hover:border-red-500 hover:text-red-600" : "hover:border-cobalt hover:text-cobalt",
      )}
    >
      {children}
    </button>
  );
}
