"use client";

import { Plus, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ToggleChip } from "@/components/ui/Chip";
import { Input } from "@/components/ui/Field";

export function FormSection({
  id,
  title,
  description,
  children,
  tone = "white",
}: {
  id: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  tone?: "white" | "private";
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn(
        "scroll-mt-32 rounded-card p-5 shadow-soft sm:p-6",
        tone === "private" ? "border-2 border-dashed border-[#e6b800] bg-[#fffbea]" : "bg-white",
      )}
    >
      <h2 id={`${id}-title`} className="text-xl">
        {title}
      </h2>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      <div className="mt-5 flex flex-col gap-5">{children}</div>
    </section>
  );
}

/** Multi-select as toggle chips (causes, ways to help). */
export function ChipMultiSelect({
  legend,
  options,
  value,
  onChange,
  error,
  required,
}: {
  legend: string;
  options: { value: string; label: ReactNode }[];
  value: string[];
  onChange: (v: string[]) => void;
  error?: string;
  required?: boolean;
}) {
  return (
    <fieldset aria-invalid={!!error}>
      <legend className="mb-2 text-sm font-semibold">
        {legend}
        {required && <span className="text-cobalt"> *</span>}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <ToggleChip
            key={o.value}
            selected={value.includes(o.value)}
            onClick={() => onChange(value.includes(o.value) ? value.filter((v) => v !== o.value) : [...value, o.value])}
          >
            {o.label}
          </ToggleChip>
        ))}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </fieldset>
  );
}

/** Editable list of short text rows (activities). */
export function ListEditor({
  label,
  value,
  onChange,
  placeholder,
  max = 20,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  max?: number;
}) {
  const rows = value.length ? value : [""];
  const set = (i: number, text: string) => onChange(rows.map((r, j) => (j === i ? text : r)));
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold">{label}</legend>
      <ul className="flex flex-col gap-2">
        {rows.map((row, i) => (
          <li key={i} className="flex gap-2">
            <Input
              aria-label={`${label} ${i + 1}`}
              value={row}
              placeholder={placeholder}
              onChange={(e) => set(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (rows.length < max) onChange([...rows, ""]);
                }
              }}
            />
            <button
              type="button"
              onClick={() => onChange(rows.filter((_, j) => j !== i))}
              aria-label={`Remove ${label.toLowerCase()} ${i + 1}`}
              className="grid size-11 shrink-0 place-items-center rounded-2xl border border-line bg-white text-muted hover:border-red-500 hover:text-red-600"
            >
              <X className="size-4" />
            </button>
          </li>
        ))}
      </ul>
      {rows.length < max && (
        <button
          type="button"
          onClick={() => onChange([...rows, ""])}
          className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-cobalt hover:underline"
        >
          <Plus className="size-4" /> Add another
        </button>
      )}
    </fieldset>
  );
}

/** Pick common languages or add your own. */
export function TagInput({
  label,
  suggestions,
  value,
  onChange,
}: {
  label: string;
  suggestions: string[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [custom, setCustom] = useState("");
  const all = [...suggestions, ...value.filter((v) => !suggestions.includes(v))];
  const add = () => {
    const t = custom.trim();
    if (t && !value.some((v) => v.toLowerCase() === t.toLowerCase())) onChange([...value, t]);
    setCustom("");
  };
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {all.map((s) => (
          <ToggleChip key={s} selected={value.includes(s)} onClick={() => onChange(value.includes(s) ? value.filter((v) => v !== s) : [...value, s])}>
            {s}
          </ToggleChip>
        ))}
      </div>
      <div className="mt-2 flex max-w-xs gap-2">
        <Input
          aria-label={`Add another ${label.toLowerCase()}`}
          value={custom}
          placeholder="Add another…"
          className="h-9 text-sm"
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <button type="button" onClick={add} className="rounded-full bg-ice px-3 text-sm font-semibold text-cobalt-deep">
          Add
        </button>
      </div>
    </fieldset>
  );
}
