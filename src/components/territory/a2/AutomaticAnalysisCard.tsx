import type { TerritoryProfile } from "@/lib/types/territory";

interface AutomaticAnalysisCardProps {
  profile: TerritoryProfile;
}

export function AutomaticAnalysisCard({ profile }: AutomaticAnalysisCardProps) {
  const { analisis_otomatis } = profile;

  return (
    <div className="rounded-lg border border-talis-stone-200 bg-talis-stone-50 p-4">
      <h3 className="font-sans text-sm font-semibold text-talis-stone-900">Analisis Otomatis</h3>
      <p className="mt-2 font-sans text-sm leading-6 text-talis-stone-700">
        {analisis_otomatis.gap_kritis}
      </p>
      <ol className="mt-3 grid gap-2 font-sans text-sm leading-6 text-talis-stone-700">
        {analisis_otomatis.prioritas_intervensi.map((priority, index) => (
          <li key={priority} className="flex gap-2">
            <span className="font-mono text-xs font-semibold text-talis-green-700">
              {index + 1}.
            </span>
            <span>{priority}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
