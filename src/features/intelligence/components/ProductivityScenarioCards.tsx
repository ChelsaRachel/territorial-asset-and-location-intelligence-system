import type { TrendResponse } from "@/lib/types/intelligence";
import { formatPct } from "@/lib/format";

interface Props {
  proyeksi: TrendResponse["tren_summary"]["proyeksi"];
  skenario_proyeksi_saran?: {
    normal?: string;
    elnino_lemah?: string;
    elnino_kuat?: string;
  };
}

interface ScenarioCardProps {
  label: string;
  badge: string;
  pct: number;
  probabilitasPct: number;
  saran?: string;
  tone: "positive" | "neutral" | "negative";
}

const TONE_STYLES = {
  positive: {
    border: "border-talis-green-700/30",
    badgeBg: "bg-talis-green-700/15 text-talis-green-700",
    pctColor: "text-talis-green-700",
  },
  neutral: {
    border: "border-talis-amber/40",
    badgeBg: "bg-talis-amber/15 text-talis-earth-700",
    pctColor: "text-talis-earth-700",
  },
  negative: {
    border: "border-talis-red-700/30",
    badgeBg: "bg-talis-red-700/15 text-talis-red-700",
    pctColor: "text-talis-red-700",
  },
};

function ScenarioCard({ label, badge, pct, probabilitasPct, saran, tone }: ScenarioCardProps) {
  const styles = TONE_STYLES[tone];
  return (
    <div className={`rounded-lg border ${styles.border} bg-white p-4 flex flex-col gap-2`}>
      <div className="flex items-start justify-between gap-2">
        <p className="font-sans text-xs font-semibold text-talis-stone-900">{label}</p>
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] font-medium ${styles.badgeBg}`}>
          {badge}
        </span>
      </div>
      <p className={`font-mono text-2xl font-bold ${styles.pctColor}`}>
        {formatPct(pct)}
      </p>
      <div className="flex items-center gap-1">
        <span className="font-sans text-xs text-talis-stone-700">Probabilitas:</span>
        <span className="font-mono text-xs font-semibold text-talis-stone-900">
          {probabilitasPct}%
        </span>
      </div>
      {saran && (
        <p className="mt-1 border-t border-talis-stone-200 pt-2 font-sans text-xs text-talis-stone-700">
          {saran}
        </p>
      )}
    </div>
  );
}

export function ProductivityScenarioCards({ proyeksi, skenario_proyeksi_saran }: Props) {
  return (
    <div>
      <p className="mb-2 font-sans text-xs uppercase tracking-wide text-talis-stone-700">
        Proyeksi Produktivitas — 3 Skenario
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <ScenarioCard
          label="Normal"
          badge="Normal"
          pct={proyeksi.normal.pct}
          probabilitasPct={Math.round(proyeksi.normal.probabilitas * 100)}
          saran={skenario_proyeksi_saran?.normal}
          tone={proyeksi.normal.pct >= 0 ? "positive" : "negative"}
        />
        <ScenarioCard
          label="El Niño Lemah"
          badge="El Niño Lemah"
          pct={proyeksi.elnino_lemah.pct}
          probabilitasPct={Math.round(proyeksi.elnino_lemah.probabilitas * 100)}
          saran={skenario_proyeksi_saran?.elnino_lemah}
          tone={proyeksi.elnino_lemah.pct >= 1 ? "positive" : proyeksi.elnino_lemah.pct >= 0 ? "neutral" : "negative"}
        />
        <ScenarioCard
          label="El Niño Kuat"
          badge="El Niño Kuat"
          pct={proyeksi.elnino_kuat.pct}
          probabilitasPct={Math.round(proyeksi.elnino_kuat.probabilitas * 100)}
          saran={skenario_proyeksi_saran?.elnino_kuat}
          tone="negative"
        />
      </div>
    </div>
  );
}
