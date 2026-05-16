import type { TerritoryZoning } from "@/lib/types/territory";

interface ZoningImplicationPanelsProps {
  zoning: TerritoryZoning;
}

function ImplicationPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-talis-stone-200 bg-talis-stone-50 p-4">
      <h3 className="font-sans text-sm font-semibold text-talis-stone-900">{title}</h3>
      <ul className="mt-3 grid gap-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 font-sans text-sm leading-6 text-talis-stone-700">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-talis-green-700" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ZoningImplicationPanels({ zoning }: ZoningImplicationPanelsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ImplicationPanel title="Implikasi Investor" items={zoning.implications.investor} />
      <ImplicationPanel title="Implikasi Pejabat Daerah" items={zoning.implications.pejabat} />
    </div>
  );
}
