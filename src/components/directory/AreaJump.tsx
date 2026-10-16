"use client";

import { useRouter } from "next/navigation";
import { areas } from "@/config/areas";
import { Select } from "@/components/ui/Field";

/** Fallback when location is denied: pick your area instead. */
export function AreaJump({ id = "area-jump", label = "Choose your area instead" }: { id?: string; label?: string }) {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <Select id={id} defaultValue="" onChange={(e) => e.target.value && router.push(`/areas/${e.target.value}`)}>
        <option value="" disabled>
          Select an area in Pune…
        </option>
        {areas.map((a) => (
          <option key={a.slug} value={a.slug}>
            {a.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
