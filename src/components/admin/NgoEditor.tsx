"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, Circle, ExternalLink, Eye, Loader2, LocateFixed, Lock, PencilLine, RotateCcw, Save, Undo2, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch, type FieldPath } from "react-hook-form";
import { areas, getArea } from "@/config/areas";
import { causes } from "@/config/causes";
import { helpTypes } from "@/config/helpTypes";
import { commonLanguages, registrationTypes } from "@/config/languages";
import { checkSlugAvailable, saveNgo } from "@/lib/admin/ngoActions";
import { cn } from "@/lib/cn";
import { formatPhone, toE164India } from "@/lib/contact";
import { coordsFromMapsUrl } from "@/lib/geo";
import {
  emptyNgoForm,
  formToProfile,
  GALLERY_MAX,
  ngoFormSchema,
  ngoPublishSchema,
  RECOMMENDED,
  REQUIRED_FOR_PUBLISH,
  slugify,
  TAGLINE_MAX,
  type NgoFormValues,
} from "@/lib/ngoForm";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { ChipMultiSelect, FormSection, ListEditor, TagInput } from "./FormParts";
import { GalleryUploader, SingleImageUploader } from "./ImageUploader";
import { PreviewPane } from "./PreviewPane";

type Intent = "draft" | "publish" | "unpublish";
type Status = "draft" | "published";

const SECTIONS = [
  { id: "basics", title: "Basics" },
  { id: "causes", title: "Causes & help" },
  { id: "location", title: "Location" },
  { id: "contact", title: "Contact" },
  { id: "photos", title: "Photos" },
  { id: "details", title: "Details" },
  { id: "private", title: "Private" },
  { id: "visibility", title: "Visibility" },
] as const;

const FIELD_SECTION: Partial<Record<keyof NgoFormValues, string>> = {
  name: "basics", slug: "basics", tagline: "basics", description: "basics", activities: "basics",
  causes: "causes", help_types: "causes", help_notes: "causes", donation_link: "causes",
  area: "location", address: "location", maps_url: "location", lat: "location", lng: "location",
  phone: "contact", whatsapp: "contact", email: "contact", website: "contact", instagram: "contact", facebook: "contact", linkedin: "contact", youtube: "contact",
  gallery_urls: "photos", founded_year: "details", registration_type: "details", registration_number: "details", visiting_hours: "details",
  contact_person: "private", contact_person_phone: "private", data_received_on: "private", internal_notes: "private",
};

export function NgoEditor({
  id,
  initial,
  initialStatus,
  serverUpdatedAt,
  base,
  uploadFolder,
}: {
  id: string | null;
  initial: NgoFormValues;
  initialStatus: Status;
  serverUpdatedAt?: string;
  base: string;
  uploadFolder: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const form = useForm<NgoFormValues>({
    resolver: zodResolver(ngoFormSchema),
    defaultValues: initial,
    mode: "onTouched",
  });
  const { register, control, getValues, setValue, setError, reset, trigger, formState } = form;
  const { errors, isDirty } = formState;
  const watched = useWatch({ control }) as NgoFormValues;
  const values = useMemo(() => ({ ...emptyNgoForm, ...watched }), [watched]);
  const profile = useMemo(() => formToProfile(values), [values]);

  const [status, setStatus] = useState<Status>(initialStatus);
  const [saving, setSaving] = useState<Intent | null>(null);
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [slugLocked, setSlugLocked] = useState(!!id);
  const [slugTaken, setSlugTaken] = useState(false);
  const [mapsMsg, setMapsMsg] = useState<string | null>(null);
  const [restore, setRestore] = useState<{ savedAt: number; values: NgoFormValues } | null>(null);
  const storageKey = `ngoconnect:form:${id ?? "new"}`;

  // --- Slug: auto-fill from the name for new NGOs, until edited by hand -----
  useEffect(() => {
    if (!slugLocked) setValue("slug", slugify(values.name), { shouldDirty: true });
  }, [values.name, slugLocked, setValue]);

  useEffect(() => {
    const slug = values.slug;
    if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return setSlugTaken(false);
    const t = setTimeout(async () => setSlugTaken(!(await checkSlugAvailable(slug, id))), 500);
    return () => clearTimeout(t);
  }, [values.slug, id]);

  // --- Autosave to this browser every few seconds ---------------------------
  useEffect(() => {
    if (!isDirty) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify({ savedAt: Date.now(), values: getValues() }));
      } catch {
        /* storage full or blocked — ignore */
      }
    }, 2500);
    return () => clearTimeout(t);
  }, [values, isDirty, storageKey, getValues]);

  // Offer to restore unsaved work found from an earlier visit.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const saved = JSON.parse(raw) as { savedAt: number; values: NgoFormValues };
      const serverTime = serverUpdatedAt ? Date.parse(serverUpdatedAt) : 0;
      if (saved.savedAt > serverTime && JSON.stringify(saved.values) !== JSON.stringify(initial)) setRestore(saved);
      else localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Warn before closing the tab with unsaved changes.
  useEffect(() => {
    if (!isDirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  const applyRestore = () => {
    if (!restore) return;
    for (const [k, v] of Object.entries({ ...emptyNgoForm, ...restore.values })) {
      setValue(k as keyof NgoFormValues, v as never, { shouldDirty: true });
    }
    setSlugLocked(true);
    setRestore(null);
    toast({ message: "Unsaved changes restored" });
  };

  const discardRestore = () => {
    localStorage.removeItem(storageKey);
    setRestore(null);
  };

  // --- Save / publish ---------------------------------------------------------
  const showErrors = (fieldErrors: Partial<Record<keyof NgoFormValues, string>>) => {
    const keys = Object.keys(fieldErrors) as (keyof NgoFormValues)[];
    keys.forEach((k) => setError(k, { type: "server", message: fieldErrors[k] }));
    const section = keys.map((k) => FIELD_SECTION[k]).find(Boolean);
    if (section) {
      setTab("edit");
      document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  async function submit(intent: Intent) {
    const valid = await trigger();
    const v = getValues();
    if (!valid) {
      const fe: Partial<Record<keyof NgoFormValues, string>> = {};
      for (const issue of ngoFormSchema.safeParse(v).error?.issues ?? []) fe[issue.path[0] as keyof NgoFormValues] ??= issue.message;
      showErrors(fe);
      toast({ message: "Please fix the highlighted fields.", tone: "error" });
      return;
    }
    const willBeLive = intent === "publish" || (intent === "draft" && status === "published");
    if (willBeLive) {
      const check = ngoPublishSchema.safeParse(v);
      if (!check.success) {
        const fe: Partial<Record<keyof NgoFormValues, string>> = {};
        for (const issue of check.error.issues) fe[issue.path[0] as keyof NgoFormValues] ??= issue.message;
        showErrors(fe);
        toast({ message: "A few required fields are missing before this can go live.", tone: "error" });
        return;
      }
    }
    if (slugTaken) {
      showErrors({ slug: "Already used by another NGO — pick a different URL name" });
      return;
    }

    setSaving(intent);
    const res = await saveNgo(id, v, intent);
    setSaving(null);
    if (!res.ok) {
      if (res.fieldErrors) showErrors(res.fieldErrors);
      toast({ message: res.message, tone: "error" });
      return;
    }

    localStorage.removeItem(storageKey);
    reset(v);
    setStatus(res.status);
    toast({
      message:
        intent === "publish" ? "Published! It's live on the site." : intent === "unpublish" ? "Unpublished — hidden from the site." : res.status === "published" ? "Changes saved and live." : "Draft saved.",
      action: res.status === "published" ? { label: "View live", href: `/ngos/${res.slug}` } : undefined,
    });
    if (!id) router.replace(`${base}/ngos/${res.id}/edit`);
    else router.refresh();
  }

  // --- Small render helpers (functions, not components, so inputs keep focus) --
  const err = (name: keyof NgoFormValues) => errors[name]?.message as string | undefined;
  const a11y = (name: keyof NgoFormValues) => ({
    "aria-invalid": !!err(name),
    "aria-describedby": err(name) ? `${name}-error` : `${name}-hint`,
  });

  const text = (
    name: FieldPath<NgoFormValues> & keyof NgoFormValues,
    label: string,
    opts: { hint?: string; required?: boolean; placeholder?: string; type?: string; inputMode?: "tel" | "email" | "url" | "numeric" | "decimal"; onBlurFormat?: (v: string) => string; className?: string } = {},
  ) => (
    <Field id={name} label={label} hint={opts.hint} error={err(name)} required={opts.required} className={opts.className}>
      <Input
        id={name}
        type={opts.type ?? "text"}
        inputMode={opts.inputMode}
        placeholder={opts.placeholder}
        {...a11y(name)}
        {...register(name, {
          onBlur: opts.onBlurFormat
            ? (e) => {
                const formatted = opts.onBlurFormat!(e.target.value);
                if (formatted !== e.target.value) setValue(name, formatted as never, { shouldDirty: true, shouldValidate: true });
              }
            : undefined,
        })}
      />
    </Field>
  );

  const area = (name: keyof NgoFormValues, label: string, opts: { hint?: string; rows?: number; placeholder?: string; required?: boolean } = {}) => (
    <Field id={name} label={label} hint={opts.hint} error={err(name)} required={opts.required}>
      <Textarea id={name} rows={opts.rows ?? 4} placeholder={opts.placeholder} {...a11y(name)} {...register(name)} />
    </Field>
  );

  // Phone fields: tidy to "+91 98765 43210" when valid.
  const tidyPhone = (v: string) => (v.trim() && /^\+91\d{10}$/.test(toE164India(v)) ? formatPhone(v) : v);

  const requiredDone = REQUIRED_FOR_PUBLISH.filter((r) => r.ok(values)).length;
  const publishedHref = `/ngos/${initial.slug}`;

  // --- Layout -------------------------------------------------------------------
  return (
    <div className="mx-auto max-w-[1600px] px-4 pb-16">
      {/* Sticky action bar */}
      <div className="sticky top-14 z-30 -mx-4 mb-5 border-b border-line bg-[#f3f2ec]/95 px-4 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={base} className="grid size-9 place-items-center rounded-full hover:bg-white" aria-label="Back to dashboard">
            <ArrowLeft className="size-5" />
          </Link>
          <div className="mr-auto min-w-0">
            <p className="truncate font-display text-lg font-bold">{values.name || (id ? "Untitled NGO" : "New NGO")}</p>
            <p className="flex items-center gap-2 text-xs text-muted">
              {status === "published" ? <Badge tone="success">Published</Badge> : <Badge tone="warning">Draft</Badge>}
              <span>{isDirty ? "Unsaved changes" : "All changes saved"}</span>
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setTab((t) => (t === "edit" ? "preview" : "edit"));
              document.querySelector("aside")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <Eye aria-hidden /> <span className="hidden sm:inline">Preview</span>
          </Button>
          {id && (
            <a href={`${base}/preview/${id}`} target="_blank" rel="noopener noreferrer" className={buttonClasses({ variant: "ghost", size: "sm" })}>
              <ExternalLink aria-hidden /> <span className="hidden sm:inline">Full tab</span>
            </a>
          )}
          {status === "published" && (
            <a href={publishedHref} target="_blank" rel="noopener noreferrer" className={buttonClasses({ variant: "ghost", size: "sm" })}>
              <ExternalLink aria-hidden /> <span className="hidden sm:inline">View live</span>
            </a>
          )}
          {status === "published" && (
            <Button variant="outline" size="sm" onClick={() => submit("unpublish")} disabled={!!saving}>
              {saving === "unpublish" ? <Loader2 className="animate-spin" /> : <Undo2 aria-hidden />} Unpublish
            </Button>
          )}
          <Button variant={status === "published" ? "primary" : "outline"} size="sm" onClick={() => submit("draft")} disabled={!!saving}>
            {saving === "draft" ? <Loader2 className="animate-spin" /> : <Save aria-hidden />}
            {status === "published" ? "Save changes" : "Save draft"}
          </Button>
          {status !== "published" && (
            <Button size="sm" onClick={() => submit("publish")} disabled={!!saving}>
              {saving === "publish" ? <Loader2 className="animate-spin" /> : <Upload aria-hidden />} Publish
            </Button>
          )}
        </div>
      </div>

      {restore && (
        <div role="status" className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl bg-[#fff1cc] p-4 text-sm">
          <RotateCcw className="size-5 text-[#7a5500]" aria-hidden />
          <span className="mr-auto">
            Found unsaved changes from {new Date(restore.savedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}.
          </span>
          <Button size="sm" onClick={applyRestore}>
            Restore
          </Button>
          <Button size="sm" variant="ghost" onClick={discardRestore}>
            Discard
          </Button>
        </div>
      )}

      {/* Small screens: Edit / Preview tabs */}
      <div role="tablist" aria-label="Editor view" className="mb-4 flex rounded-full bg-white p-1 shadow-soft xl:hidden">
        {(["edit", "preview"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn("flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-sm font-semibold", tab === t ? "bg-cobalt text-white" : "text-muted")}
          >
            {t === "edit" ? <PencilLine className="size-4" /> : <Eye className="size-4" />}
            {t === "edit" ? "Edit" : "Preview"}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(440px,600px)]">
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            submit("draft");
          }}
          className={cn("flex min-w-0 flex-col gap-5", tab === "preview" && "hidden xl:flex")}
        >
          {/* Checklist + section links */}
          <div className="rounded-card bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg">Ready to publish?</h2>
              <span className="text-sm font-semibold text-muted">
                {requiredDone}/{REQUIRED_FOR_PUBLISH.length} required
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-cobalt transition-all" style={{ width: `${(requiredDone / REQUIRED_FOR_PUBLISH.length) * 100}%` }} />
            </div>
            <ul className="mt-4 grid gap-1.5 text-sm sm:grid-cols-2">
              {REQUIRED_FOR_PUBLISH.map((r) => {
                const sec = FIELD_SECTION[r.field];
                return (
                  <li key={r.label}>
                    <button
                      type="button"
                      onClick={() => {
                        setTab("edit");
                        if (sec) document.getElementById(sec)?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                      className="flex items-center gap-2 text-left hover:text-cobalt cursor-pointer"
                    >
                      {r.ok(values) ? <CheckCircle2 className="size-4 text-[#16613a]" aria-label="done" /> : <Circle className="size-4 text-muted" aria-label="to do" />}
                      <span>{r.label}</span> <span className="text-cobalt">*</span>
                    </button>
                  </li>
                );
              })}
              {RECOMMENDED.map((r) => (
                <li key={r.label} className="flex items-center gap-2 text-muted">
                  {r.ok(values) ? <CheckCircle2 className="size-4 text-[#16613a]" aria-label="done" /> : <Circle className="size-4" aria-label="to do" />}
                  {r.label} <span className="text-xs">(recommended)</span>
                </li>
              ))}
            </ul>
            <nav aria-label="Form sections" className="mt-4 flex flex-wrap gap-1.5">
              {SECTIONS.map((s, i) => (
                <a key={s.id} href={`#${s.id}`} className="rounded-full bg-paper px-3 py-1 text-xs font-semibold hover:bg-ice">
                  {i + 1}. {s.title}
                </a>
              ))}
            </nav>
          </div>

          {/* 1. Basics */}
          <FormSection id="basics" title="1. Basics">
            {text("name", "NGO name", { required: true, placeholder: "e.g. Asha Learning Foundation" })}
            <Field
              id="slug"
              label="URL name"
              required
              error={err("slug") ?? (slugTaken ? "Already used by another NGO" : undefined)}
              hint={`ngoconnect…/ngos/${values.slug || "your-ngo"}`}
            >
              <div className="flex gap-2">
                <Input
                  id="slug"
                  {...a11y("slug")}
                  {...register("slug", { onChange: () => setSlugLocked(true) })}
                  aria-invalid={!!err("slug") || slugTaken}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const s = slugify(getValues("name"));
                    if (s) {
                      setValue("slug", s, { shouldDirty: true, shouldValidate: true });
                      setSlugLocked(false);
                      toast({ message: `URL name set to "${s}"` });
                    } else {
                      toast({ message: "Type an NGO name first to auto-generate URL name", tone: "error" });
                    }
                  }}
                  title="Auto-generate URL name from NGO name"
                >
                  <RotateCcw className="size-3.5" aria-hidden /> Auto
                </Button>
              </div>
            </Field>
            <Field id="tagline" label="Tagline" error={err("tagline")} hint={`${values.tagline.length}/${TAGLINE_MAX} · One line about what they do`}>
              <Input id="tagline" maxLength={TAGLINE_MAX + 20} placeholder="Free evening classes for school kids" {...a11y("tagline")} {...register("tagline")} />
            </Field>
            {area("description", "About the NGO", { required: true, rows: 6, hint: "A few lines in plain language. Line breaks are kept." })}
            <Controller
              control={control}
              name="activities"
              render={({ field }) => (
                <ListEditor label="What they do" value={field.value} onChange={field.onChange} placeholder="e.g. Weekend reading club" />
              )}
            />
          </FormSection>

          {/* 2. Causes & help */}
          <FormSection id="causes" title="2. Causes & ways to help">
            <Controller
              control={control}
              name="causes"
              render={({ field }) => (
                <ChipMultiSelect
                  legend="Causes"
                  required
                  error={err("causes")}
                  value={field.value}
                  onChange={(v) => {
                    field.onChange(v);
                    if (v.length) form.clearErrors("causes");
                  }}
                  options={causes.map((c) => ({ value: c.slug, label: <><span aria-hidden>{c.emoji}</span> {c.label}</> }))}
                />
              )}
            />
            <Controller
              control={control}
              name="help_types"
              render={({ field }) => (
                <ChipMultiSelect legend="Ways people can help" value={field.value} onChange={field.onChange} options={helpTypes.map((h) => ({ value: h.slug, label: h.label }))} />
              )}
            />
            {area("help_notes", "What they need right now", { rows: 3, placeholder: "e.g. Weekend volunteers to teach English" })}
            {text("donation_link", "Their own donation page", { type: "url", inputMode: "url", placeholder: "https://…", hint: "Optional. We only link to it — no payments on NGOConnect." })}
          </FormSection>

          {/* 3. Location */}
          <FormSection id="location" title="3. Location">
            <Field id="area" label="Area in Pune" required error={err("area")}>
              <Select
                id="area"
                {...a11y("area")}
                {...register("area", {
                  onChange: (e) => {
                    const selected = getArea(e.target.value);
                    if (selected && !getValues("lat") && !getValues("lng")) {
                      setValue("lat", selected.lat.toFixed(6), { shouldDirty: true });
                      setValue("lng", selected.lng.toFixed(6), { shouldDirty: true });
                      setMapsMsg(`Coordinates auto-set to ${selected.name} area center.`);
                    }
                  },
                })}
              >
                <option value="">Select an area…</option>
                {areas.map((a) => (
                  <option key={a.slug} value={a.slug}>
                    {a.name}
                  </option>
                ))}
              </Select>
            </Field>
            {area("address", "Full address", { rows: 2, placeholder: "Building, street, area, Pune, Maharashtra 4110xx" })}
            <div className="flex flex-col gap-2">
              {text("maps_url", "Google Maps link", { type: "url", inputMode: "url", placeholder: "https://maps.google.com/…" })}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => {
                    const rawUrl = getValues("maps_url");
                    const selectedArea = getValues("area");
                    const c = rawUrl ? coordsFromMapsUrl(rawUrl) : null;
                    if (c) {
                      setValue("lat", c.lat.toFixed(6), { shouldDirty: true, shouldValidate: true });
                      setValue("lng", c.lng.toFixed(6), { shouldDirty: true, shouldValidate: true });
                      setMapsMsg("Coordinates filled in from link.");
                    } else if (selectedArea && getArea(selectedArea)) {
                      const a = getArea(selectedArea)!;
                      setValue("lat", a.lat.toFixed(6), { shouldDirty: true, shouldValidate: true });
                      setValue("lng", a.lng.toFixed(6), { shouldDirty: true, shouldValidate: true });
                      setMapsMsg(`Coordinates filled from area centre (${a.name}).`);
                    } else {
                      setMapsMsg("No coordinates found. Paste a Google Maps link, raw coordinates (e.g. 18.52, 73.85), or select an Area above.");
                    }
                  }}
                >
                  <LocateFixed aria-hidden /> Get coordinates
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => {
                    if (typeof navigator === "undefined" || !navigator.geolocation) {
                      setMapsMsg("Geolocation is not supported by your browser.");
                      return;
                    }
                    setMapsMsg("Detecting current location…");
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        setValue("lat", pos.coords.latitude.toFixed(6), { shouldDirty: true, shouldValidate: true });
                        setValue("lng", pos.coords.longitude.toFixed(6), { shouldDirty: true, shouldValidate: true });
                        setMapsMsg("Coordinates filled from current location!");
                      },
                      (error) => {
                        setMapsMsg(`Location error: ${error.message}`);
                      },
                      { timeout: 8000 },
                    );
                  }}
                >
                  <LocateFixed aria-hidden /> Detect my location
                </Button>
                {mapsMsg && <p className="text-sm text-muted" role="status">{mapsMsg}</p>}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {text("lat", "Latitude", { inputMode: "decimal", placeholder: "18.5204", hint: "Optional — for “near me”" })}
              {text("lng", "Longitude", { inputMode: "decimal", placeholder: "73.8567" })}
            </div>
          </FormSection>

          {/* 4. Contact */}
          <FormSection id="contact" title="4. Contact" description="At least one of phone, WhatsApp or email is recommended.">
            <div className="grid gap-4 sm:grid-cols-2">
              {text("phone", "Phone", { type: "tel", inputMode: "tel", placeholder: "98765 43210 or 020 2553 1234", onBlurFormat: tidyPhone })}
              {text("whatsapp", "WhatsApp", { type: "tel", inputMode: "tel", placeholder: "98765 43210", hint: "+91 is added automatically", onBlurFormat: tidyPhone })}
            </div>
            {text("email", "Email", { type: "email", inputMode: "email", placeholder: "contact@ngo.org" })}
            {text("website", "Website", { type: "url", inputMode: "url", placeholder: "https://ngo.org" })}
            <div className="grid gap-4 sm:grid-cols-2">
              {text("instagram", "Instagram", { type: "url", inputMode: "url", placeholder: "https://instagram.com/…" })}
              {text("facebook", "Facebook", { type: "url", inputMode: "url", placeholder: "https://facebook.com/…" })}
              {text("linkedin", "LinkedIn", { type: "url", inputMode: "url", placeholder: "https://linkedin.com/company/…" })}
              {text("youtube", "YouTube", { type: "url", inputMode: "url", placeholder: "https://youtube.com/@…" })}
            </div>
          </FormSection>

          {/* 5. Photos */}
          <FormSection id="photos" title="5. Photos" description="Images are resized and converted to WebP in your browser before uploading.">
            <div className="grid gap-5 md:grid-cols-[auto_1fr]">
              <Controller
                control={control}
                name="logo_url"
                render={({ field }) => <SingleImageUploader kind="logo" label="Logo" value={field.value} onChange={field.onChange} folder={uploadFolder} />}
              />
              <Controller
                control={control}
                name="cover_url"
                render={({ field }) => <SingleImageUploader kind="cover" label="Cover photo" value={field.value} onChange={field.onChange} folder={uploadFolder} />}
              />
            </div>
            <Controller
              control={control}
              name="gallery_urls"
              render={({ field }) => <GalleryUploader value={field.value} onChange={field.onChange} folder={uploadFolder} max={GALLERY_MAX} />}
            />
          </FormSection>

          {/* 6. Details */}
          <FormSection id="details" title="6. Details" description="Shown as provided by the NGO. We don't verify registration details.">
            <div className="grid gap-4 sm:grid-cols-2">
              {text("founded_year", "Year founded", { inputMode: "numeric", placeholder: "2015" })}
              <Field id="registration_type" label="Registration type" error={err("registration_type")}>
                <Input id="registration_type" list="registration-types" placeholder="Trust / Society / Section 8 Company" {...register("registration_type")} />
              </Field>
              {text("registration_number", "Registration number", { placeholder: "As given by the NGO" })}
              {text("visiting_hours", "Visiting hours", { placeholder: "Mon–Sat, 10 am – 5 pm" })}
            </div>
            <datalist id="registration-types">
              {registrationTypes.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
            <Controller
              control={control}
              name="languages"
              render={({ field }) => <TagInput label="Languages spoken" suggestions={commonLanguages} value={field.value} onChange={field.onChange} />}
            />
          </FormSection>

          {/* 7. Private */}
          <FormSection
            id="private"
            title="7. Private notes"
            tone="private"
            description={
              <span className="inline-flex items-center gap-1 font-semibold text-[#7a5500]">
                <Lock className="size-3.5" aria-hidden /> Never shown publicly — stored in a separate, locked table.
              </span>
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {text("contact_person", "Contact person", { placeholder: "Who gave you the details" })}
              {text("contact_person_phone", "Their phone", { type: "tel", inputMode: "tel", onBlurFormat: tidyPhone })}
              {text("data_received_on", "Details received on", { type: "date" })}
            </div>
            {area("internal_notes", "Internal notes", { rows: 3 })}
          </FormSection>

          {/* 8. Visibility */}
          <FormSection id="visibility" title="8. Visibility">
            <label className="flex items-start gap-3">
              <input type="checkbox" className="mt-1 size-5 accent-cobalt" {...register("is_featured")} />
              <span>
                <span className="font-semibold">Featured</span>
                <span className="block text-sm text-muted">Show on the home page.</span>
              </span>
            </label>
            <label className="flex items-start gap-3">
              <input type="checkbox" className="mt-1 size-5 accent-cobalt" {...register("is_sample")} />
              <span>
                <span className="font-semibold">Sample listing</span>
                <span className="block text-sm text-muted">Demo data — shows a “Sample listing” badge.</span>
              </span>
            </label>
            <p className="text-sm text-muted">
              Status: <strong>{status === "published" ? "Published (live)" : "Draft (not public)"}</strong> — use the buttons at the top to publish or unpublish.
            </p>
          </FormSection>
        </form>

        {/* Preview: tab on small screens, sticky side pane on wide screens */}
        {tab === "preview" && <PreviewPane data={profile} className="xl:hidden" />}
        <aside className="hidden min-w-0 xl:sticky xl:top-36 xl:block xl:self-start">
          <PreviewPane data={profile} />
        </aside>
      </div>
    </div>
  );
}
