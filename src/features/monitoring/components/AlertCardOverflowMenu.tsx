"use client";
// SPRINT-07 TASK-006 — Card overflow menu: FALSE_POSITIVE + Reopen

import { useRef, useState, useEffect } from "react";
import type { Alert } from "@/lib/types/monitoring";
import type { AlertStatus } from "@/lib/types/common";
import { ALLOWED_TRANSITIONS } from "../lib/alertLifecycle";

interface AlertCardOverflowMenuProps {
  alert: Alert;
  onTransition: (to: AlertStatus) => Promise<void>;
}

export function AlertCardOverflowMenu({ alert, onTransition }: AlertCardOverflowMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const canFalsePositive = ALLOWED_TRANSITIONS[alert.status]?.includes("FALSE_POSITIVE") ?? false;
  const canReopen = alert.status === "RESOLVED";

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!canFalsePositive && !canReopen) return null;

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Opsi lainnya"
        className="flex h-6 w-6 items-center justify-center rounded hover:bg-talis-stone-100 text-talis-stone-500 transition-colors"
      >
        <svg
          viewBox="0 0 16 16"
          fill="currentColor"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <circle cx="8" cy="2" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="8" cy="14" r="1.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-7 z-50 min-w-[200px] rounded-lg border border-talis-stone-200 bg-white py-1 shadow-lg">
          {canReopen && (
            <button
              type="button"
              onClick={async () => {
                setOpen(false);
                await onTransition("INVESTIGATED");
              }}
              className="w-full px-4 py-2 text-left font-sans text-xs text-talis-stone-700 hover:bg-talis-stone-50"
            >
              Buka kembali → Diselidiki
            </button>
          )}
          {canFalsePositive && (
            <button
              type="button"
              onClick={async () => {
                setOpen(false);
                await onTransition("FALSE_POSITIVE");
              }}
              className="w-full px-4 py-2 text-left font-sans text-xs text-red-600 hover:bg-red-50"
            >
              Tandai sebagai Salah Deteksi
            </button>
          )}
        </div>
      )}
    </div>
  );
}
