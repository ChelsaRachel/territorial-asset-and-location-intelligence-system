import { StatusPill } from "@/components/ui";
import type { TerritoryZoning } from "@/lib/types/territory";

interface RegulatoryFlagDetailProps {
  zoning: TerritoryZoning;
}

const RED_FLAG_COPY: Partial<Record<TerritoryZoning["regulatory_flag"], string>> = {
  MORATORIUM: "Tunda akuisisi atau pengembangan sampai kepastian regulasi diterbitkan.",
  KAWASAN_LINDUNG: "Jangan lanjutkan tapak yang masuk area lindung tanpa klarifikasi resmi lintas instansi.",
};

export function RegulatoryFlagDetail({ zoning }: RegulatoryFlagDetailProps) {
  const redFlagCopy = RED_FLAG_COPY[zoning.regulatory_flag];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill variant="regulatory" value={zoning.regulatory_flag} />
      </div>
      <p className="font-sans text-sm leading-6 text-talis-stone-700">{zoning.flag_detail}</p>
      {redFlagCopy && (
        <div className="rounded-lg border border-talis-red-700/30 bg-talis-red-700/5 px-3 py-2">
          <p className="font-sans text-xs font-medium leading-5 text-talis-red-700">
            {redFlagCopy}
          </p>
        </div>
      )}
    </div>
  );
}
