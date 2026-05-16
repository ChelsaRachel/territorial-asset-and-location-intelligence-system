import { ScoreBadge, TooltipWrapper } from "@/components/ui";
import { formatHectares } from "@/lib/format/territory";
import type { TerritoryZoning } from "@/lib/types/territory";
import { RegulatoryFlagDetail } from "./RegulatoryFlagDetail";
import { RdtrNotice } from "./RdtrNotice";

interface ZoningCompliancePanelProps {
  zoning: TerritoryZoning;
}

const AREA_ROWS = [
  {
    key: "sesuai_ha",
    label: "Sesuai",
    tooltip: "Luas indikatif yang konsisten dengan peruntukan tata ruang.",
  },
  {
    key: "konflik_ha",
    label: "Konflik",
    tooltip: "Luas indikatif yang perlu klarifikasi atau konversi formal sebelum pengembangan.",
  },
  {
    key: "kawasan_lindung_ha",
    label: "Kawasan lindung",
    tooltip: "Luas indikatif yang berada dalam referensi kawasan lindung atau buffer perlindungan.",
  },
] as const;

export function ZoningCompliancePanel({ zoning }: ZoningCompliancePanelProps) {
  return (
    <div className="rounded-lg border border-talis-stone-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-sans text-sm font-semibold text-talis-stone-900">
            Zoning Compliance
          </h3>
          <p className="mt-1 font-sans text-xs text-talis-stone-700">
            Skor kepatuhan tata ruang A.3
          </p>
        </div>
        <ScoreBadge value={zoning.zoning_compliance_score} size="xl" label="Compliance" />
      </div>

      <div className="mt-4">
        <RegulatoryFlagDetail zoning={zoning} />
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
        {AREA_ROWS.map((row) => {
          const value =
            row.key === "sesuai_ha"
              ? zoning.luas_breakdown.sesuai_ha
              : row.key === "konflik_ha"
                ? zoning.luas_breakdown.konflik_ha
                : zoning.luas_breakdown.kawasan_lindung_ha;

          return (
            <div key={row.key} className="h-full rounded-lg border border-talis-stone-200 bg-talis-stone-50 p-3">
              <div className="flex items-center gap-1">
                <p className="font-sans text-[11px] uppercase text-talis-stone-700">{row.label}</p>
                <TooltipWrapper content={row.tooltip}>
                  <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-talis-stone-700/40 font-mono text-[9px] text-talis-stone-700">
                    ?
                  </span>
                </TooltipWrapper>
              </div>
              <p className="mt-1 font-mono text-sm font-semibold text-talis-stone-900">
                {formatHectares(value)}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        <RdtrNotice rdtrAvailable={zoning.rdtr_available} />
      </div>
    </div>
  );
}
