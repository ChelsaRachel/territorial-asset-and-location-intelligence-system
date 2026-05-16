"use client";

import { Download } from "lucide-react";

interface ExportButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export function ExportButton({
  onClick,
  disabled = false,
  label = "Ekspor",
  className = "",
}: ExportButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex h-8 items-center gap-1.5 rounded-md border px-3 font-sans text-xs font-semibold transition",
        disabled
          ? "cursor-not-allowed border-talis-stone-200 bg-talis-stone-50 text-talis-stone-400"
          : "border-talis-stone-300 bg-white text-talis-stone-700 hover:border-talis-green-600 hover:text-talis-green-700",
        className,
      ].join(" ")}
      aria-label={label}
    >
      <Download className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
