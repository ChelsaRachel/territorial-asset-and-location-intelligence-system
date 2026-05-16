type RegulatoryValue = "BEBAS_INVESTASI" | "KONFLIK_REGULASI" | "KAWASAN_LINDUNG" | "MORATORIUM";
type UrgencyValue = "SEGERA" | "TERBUKA" | "JANGKA_PANJANG";
type VerdictValue = "LAYAK" | "LAYAK_BERSYARAT" | "TIDAK_LAYAK";
type SeverityValue = "KRITIS" | "TINGGI" | "SEDANG";
type SpeculationValue = "sehat" | "waspada" | "spekulatif";
type PipelineValue = "operasional" | "izin_diterbitkan" | "dalam_proses" | "tertahan";

type StatusPillVariant =
  | { variant: "regulatory"; value: RegulatoryValue }
  | { variant: "urgency"; value: UrgencyValue }
  | { variant: "verdict"; value: VerdictValue }
  | { variant: "severity"; value: SeverityValue }
  | { variant: "speculation"; value: SpeculationValue }
  | { variant: "pipeline"; value: PipelineValue };

type StatusPillProps = StatusPillVariant & { className?: string };

const LABEL_MAP: Record<string, string> = {
  BEBAS_INVESTASI: "Bebas Investasi",
  KONFLIK_REGULASI: "Konflik Regulasi",
  KAWASAN_LINDUNG: "Kawasan Lindung",
  MORATORIUM: "Moratorium",
  SEGERA: "Segera",
  TERBUKA: "Terbuka",
  JANGKA_PANJANG: "Jangka Panjang",
  LAYAK: "Layak",
  LAYAK_BERSYARAT: "Layak Bersyarat",
  TIDAK_LAYAK: "Tidak Layak",
  KRITIS: "Kritis",
  TINGGI: "Tinggi",
  SEDANG: "Sedang",
  sehat: "Sehat",
  waspada: "Waspada",
  spekulatif: "Spekulatif",
  operasional: "Operasional",
  izin_diterbitkan: "Izin Diterbitkan",
  dalam_proses: "Dalam Proses",
  tertahan: "Tertahan",
};

const COLOR_MAP: Record<string, string> = {
  BEBAS_INVESTASI: "bg-talis-green-700/15 text-talis-green-700 border-talis-green-700/30",
  KONFLIK_REGULASI: "bg-talis-amber/15 text-talis-earth-700 border-talis-amber/40",
  KAWASAN_LINDUNG: "bg-talis-red-700/15 text-talis-red-700 border-talis-red-700/30",
  MORATORIUM: "bg-talis-red-700/15 text-talis-red-700 border-talis-red-700/30",
  SEGERA: "bg-talis-red-700/15 text-talis-red-700 border-talis-red-700/30",
  TERBUKA: "bg-talis-amber/15 text-talis-earth-700 border-talis-amber/40",
  JANGKA_PANJANG: "bg-talis-stone-700/10 text-talis-stone-700 border-talis-stone-700/20",
  LAYAK: "bg-talis-green-700/15 text-talis-green-700 border-talis-green-700/30",
  LAYAK_BERSYARAT: "bg-talis-amber/15 text-talis-earth-700 border-talis-amber/40",
  TIDAK_LAYAK: "bg-talis-red-700/15 text-talis-red-700 border-talis-red-700/30",
  KRITIS: "bg-talis-red-700/15 text-talis-red-700 border-talis-red-700/30 animate-[blink_1.4s_ease-in-out_infinite]",
  TINGGI: "bg-talis-red-700/15 text-talis-red-700 border-talis-red-700/30",
  SEDANG: "bg-talis-amber/15 text-talis-earth-700 border-talis-amber/40",
  sehat: "bg-talis-green-700/15 text-talis-green-700 border-talis-green-700/30",
  waspada: "bg-talis-amber/15 text-talis-earth-700 border-talis-amber/40",
  spekulatif: "bg-talis-red-700/15 text-talis-red-700 border-talis-red-700/30",
  operasional: "bg-talis-green-700/15 text-talis-green-700 border-talis-green-700/30",
  izin_diterbitkan: "bg-talis-green-700/15 text-talis-green-700 border-talis-green-700/30",
  dalam_proses: "bg-talis-amber/15 text-talis-earth-700 border-talis-amber/40",
  tertahan: "bg-talis-red-700/15 text-talis-red-700 border-talis-red-700/30",
};

export function StatusPill({ variant: _variant, value, className }: StatusPillProps) {
  const label = LABEL_MAP[value] ?? value;
  const colorClasses = COLOR_MAP[value] ?? "bg-talis-stone-200 text-talis-stone-700 border-talis-stone-700/20";

  return (
    <span
      data-testid="status-pill"
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-sans text-xs font-medium ${colorClasses} ${className ?? ""}`}
    >
      {label}
    </span>
  );
}

export default StatusPill;
