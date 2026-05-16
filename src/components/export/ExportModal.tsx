"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  exportAccountabilityReport,
  exportComparison,
  exportShortlist,
  type ComparisonSection,
  type ExportFormat,
  type ShortlistSection,
} from "@/lib/export";
import { triggerDownload } from "./triggerDownload";

type ExportMode = "comparison" | "shortlist" | "accountability";
type ExportSection = ComparisonSection | ShortlistSection | "attribution" | "benchmark" | "recommendations";

export type ExportModalConfig =
  | {
      mode: "comparison";
      title?: string;
      wilayahIds: number[];
    }
  | {
      mode: "shortlist";
      title?: string;
      shortlistIds: string[];
    }
  | {
      mode: "accountability";
      title?: string;
      wilayahId: number;
      periodA: string;
      periodB: string;
    };

export interface ExportModalProps {
  open: boolean;
  config: ExportModalConfig | null;
  onClose: () => void;
}

interface SectionOption {
  id: ExportSection;
  label: string;
}

const FORMAT_LABELS: Record<ExportFormat, string> = {
  pdf: "PDF",
  ppt: "PPT",
  xlsx: "XLSX",
};

const SECTIONS: Record<ExportMode, SectionOption[]> = {
  comparison: [
    { id: "executive_summary", label: "Executive Summary" },
    { id: "comparison_table", label: "Comparison Table" },
    { id: "factsheet", label: "Factsheet Kandidat" },
    { id: "risk_profile", label: "Risk Profile" },
    { id: "financial_viability", label: "Financial Viability" },
    { id: "recommendations", label: "Rekomendasi" },
  ],
  shortlist: [
    { id: "entries", label: "Per-Entry Sections" },
    { id: "delta_indicators", label: "Delta Indicators" },
    { id: "notes", label: "Notes" },
    { id: "notifications", label: "Notifications" },
    { id: "summary", label: "Closing Summary" },
  ],
  accountability: [
    { id: "executive_summary", label: "Ringkasan Akuntabilitas" },
    { id: "comparison_table", label: "Delta Indikator" },
    { id: "attribution", label: "Policy Attribution" },
    { id: "benchmark", label: "Benchmark Regional" },
    { id: "recommendations", label: "Rekomendasi Kebijakan" },
  ],
};

const DEFAULT_FORMAT: Record<ExportMode, ExportFormat> = {
  comparison: "pdf",
  shortlist: "pdf",
  accountability: "pdf",
};

function supportedFormats(mode: ExportMode): ExportFormat[] {
  if (mode === "comparison") return ["pdf", "ppt", "xlsx"];
  return ["pdf"];
}

function modeTitle(config: ExportModalConfig): string {
  if (config.title) return config.title;
  if (config.mode === "comparison") return "Ekspor Komparasi";
  if (config.mode === "shortlist") return "Ekspor Shortlist";
  return "Ekspor Laporan Akuntabilitas";
}

export function ExportModal({ open, config, onClose }: ExportModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const ignoreNextCloseRef = useRef(false);
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [selectedSections, setSelectedSections] = useState<Set<ExportSection>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);

  const mode = config?.mode ?? "comparison";
  const options = useMemo(() => SECTIONS[mode], [mode]);
  const formats = supportedFormats(mode);

  useEffect(() => {
    if (!open || !config) return;
    setFormat(DEFAULT_FORMAT[config.mode]);
    setSelectedSections(new Set(SECTIONS[config.mode].map((option) => option.id)));
  }, [open, config]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !open) return undefined;
    dialog.showModal();
    return () => {
      if (dialog.open) {
        ignoreNextCloseRef.current = true;
        dialog.close();
      }
    };
  }, [open]);

  if (!open || !config) return null;

  function toggleSection(sectionId: ExportSection) {
    setSelectedSections((current) => {
      const next = new Set(current);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  }

  function handleBackdropClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current && !isGenerating) onClose();
  }

  function handleDialogClose() {
    if (ignoreNextCloseRef.current) {
      ignoreNextCloseRef.current = false;
      return;
    }
    onClose();
  }

  async function handleGenerate() {
    if (!config) return;
    setIsGenerating(true);
    try {
      let result: { blob: Blob; filename: string };
      if (config.mode === "comparison") {
        result = await exportComparison(
          {
            wilayahIds: config.wilayahIds,
            sections: Array.from(selectedSections) as ComparisonSection[],
          },
          format,
        );
      } else if (config.mode === "shortlist") {
        result = await exportShortlist(
          {
            shortlistIds: config.shortlistIds,
            sections: Array.from(selectedSections) as ShortlistSection[],
          },
          "pdf",
        );
      } else {
        result = await exportAccountabilityReport(
          {
            wilayahId: config.wilayahId,
            periodA: config.periodA,
            periodB: config.periodB,
          },
          "pdf",
        );
      }
      triggerDownload(result.blob, result.filename);
      toast.success("Export selesai", { description: result.filename });
      onClose();
    } catch (error) {
      toast.error("Export gagal", {
        description: error instanceof Error ? error.message : "Coba ulangi beberapa saat lagi.",
      });
    } finally {
      setIsGenerating(false);
    }
  }

  const disabledGenerate = isGenerating || (config.mode !== "accountability" && selectedSections.size === 0);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="export-modal-title"
      onClick={handleBackdropClick}
      onClose={handleDialogClose}
      className="m-auto w-full max-w-lg rounded-xl border border-talis-stone-200 bg-white p-0 shadow-2xl backdrop:bg-black/40"
    >
      <div className="border-b border-talis-stone-200 px-5 py-4">
        <h2 id="export-modal-title" className="font-display text-lg font-semibold text-talis-stone-900">
          {modeTitle(config)}
        </h2>
        <p className="mt-1 font-sans text-xs text-talis-stone-600">
          Pilih format dan bagian laporan yang akan dibuat.
        </p>
      </div>

      <div className="space-y-5 px-5 py-4">
        <div>
          <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-wide text-talis-stone-500">
            Format
          </p>
          <div className="inline-flex rounded-md border border-talis-stone-200 bg-talis-stone-50 p-1">
            {(["pdf", "ppt", "xlsx"] as ExportFormat[]).map((candidate) => {
              const supported = formats.includes(candidate);
              const selected = format === candidate;
              return (
                <button
                  key={candidate}
                  type="button"
                  onClick={() => supported && setFormat(candidate)}
                  disabled={!supported || isGenerating}
                  title={supported ? FORMAT_LABELS[candidate] : "Tersedia di rilis berikutnya"}
                  className={[
                    "rounded px-3 py-1.5 font-sans text-xs font-semibold transition",
                    selected ? "bg-white text-talis-green-700 shadow-sm" : "text-talis-stone-600",
                    !supported ? "cursor-not-allowed opacity-40" : "hover:text-talis-green-700",
                  ].join(" ")}
                >
                  {FORMAT_LABELS[candidate]}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-wide text-talis-stone-500">
            Bagian Laporan
          </p>
          <div className="grid gap-2">
            {options.map((option) => (
              <label
                key={option.id}
                className="flex items-center gap-2 rounded-md border border-talis-stone-200 px-3 py-2 font-sans text-sm text-talis-stone-700"
              >
                <input
                  type="checkbox"
                  checked={selectedSections.has(option.id)}
                  onChange={() => toggleSection(option.id)}
                  disabled={isGenerating}
                  className="h-4 w-4 rounded border-talis-stone-300 text-talis-green-700"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-talis-stone-200 px-5 py-4">
        <button
          type="button"
          onClick={onClose}
          disabled={isGenerating}
          className="rounded-md px-3 py-1.5 font-sans text-sm font-medium text-talis-stone-600 hover:bg-talis-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={() => void handleGenerate()}
          disabled={disabledGenerate}
          className="rounded-md bg-talis-green-700 px-4 py-1.5 font-sans text-sm font-semibold text-white hover:bg-talis-green-800 disabled:cursor-not-allowed disabled:bg-talis-stone-300"
        >
          {isGenerating ? "Membuat..." : "Generate Export"}
        </button>
      </div>
    </dialog>
  );
}
