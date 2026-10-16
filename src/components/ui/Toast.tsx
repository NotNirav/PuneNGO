"use client";

import { CheckCircle2, AlertCircle, X } from "lucide-react";
import Link from "next/link";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type ToastItem = {
  id: number;
  message: string;
  tone: "success" | "error";
  action?: { label: string; href: string };
};

type ToastInput = Omit<ToastItem, "id" | "tone"> & { tone?: ToastItem["tone"] };

const ToastContext = createContext<(t: ToastInput) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((all) => all.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (t: ToastInput) => {
      const id = nextId++;
      setToasts((all) => [...all, { tone: "success", ...t, id }]);
      setTimeout(() => dismiss(id), 6000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl px-4 py-3 text-sm shadow-lift",
              t.tone === "success" ? "bg-ink text-white" : "bg-red-600 text-white",
            )}
          >
            {t.tone === "success" ? (
              <CheckCircle2 className="size-5 shrink-0 text-lime" />
            ) : (
              <AlertCircle className="size-5 shrink-0" />
            )}
            <span className="flex-1">{t.message}</span>
            {t.action && (
              <Link href={t.action.href} target="_blank" className="font-semibold text-lime underline-offset-2 hover:underline">
                {t.action.label}
              </Link>
            )}
            <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss" className="opacity-70 hover:opacity-100">
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
