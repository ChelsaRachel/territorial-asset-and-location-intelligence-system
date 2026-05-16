"use client";

import dynamic from "next/dynamic";
import type { ExportModalProps } from "./ExportModal";

const ExportModal = dynamic(
  () => import("./ExportModal").then((mod) => mod.ExportModal),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-50 grid place-items-center bg-black/30">
        <div className="rounded-md border border-talis-stone-200 bg-white px-4 py-3 font-sans text-sm text-talis-stone-700 shadow-xl">
          Memuat opsi ekspor...
        </div>
      </div>
    ),
  },
);

export function ExportModalLazy(props: ExportModalProps) {
  if (!props.open || !props.config) return null;
  return <ExportModal {...props} />;
}
