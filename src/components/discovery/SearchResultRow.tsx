"use client";

import type { SearchResultRow as SearchResultRowType } from "@/lib/store/useDiscovery";

interface SearchResultRowProps {
  result: SearchResultRowType;
  highlighted: boolean;
  onSelect(result: SearchResultRowType): void;
}

export function SearchResultRow({ result, highlighted, onSelect }: SearchResultRowProps) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={highlighted}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => onSelect(result)}
      className={[
        "flex w-full flex-col gap-0.5 px-3 py-2.5 text-left transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-talis-green-700",
        highlighted ? "bg-talis-green-700/10" : "hover:bg-talis-stone-700/10",
      ].join(" ")}
    >
      <span className="truncate font-sans text-sm font-medium text-talis-stone-900">
        {result.nama}
      </span>
      <span className="truncate font-sans text-xs text-talis-stone-700">
        {result.kabupaten} - {result.provinsi}
      </span>
    </button>
  );
}
