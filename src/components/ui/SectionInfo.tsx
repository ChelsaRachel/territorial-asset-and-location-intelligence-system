import type { ReactNode } from "react";
import { DataTimestamp } from "./DataTimestamp";
import { TooltipWrapper } from "./TooltipWrapper";

interface SectionInfoProps {
  title: string;
  description?: string;
  lastUpdated?: string;
  tooltip?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function SectionInfo({
  title,
  description,
  lastUpdated,
  tooltip,
  icon,
  className,
}: SectionInfoProps) {
  return (
    <div data-testid="section-info" className={`mb-4 ${className ?? ""}`}>
      <div className="flex items-center gap-2">
        {icon && <span className="text-talis-green-700">{icon}</span>}
        <h2 className="font-display text-lg text-talis-stone-900">{title}</h2>
        {tooltip && (
          <TooltipWrapper content={tooltip}>
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-talis-stone-700/40 font-mono text-[10px] text-talis-stone-700 cursor-help">
              ?
            </span>
          </TooltipWrapper>
        )}
        {lastUpdated && (
          <span className="ml-auto">
            <DataTimestamp timestamp={lastUpdated} />
          </span>
        )}
      </div>
      {description && (
        <p className="mt-0.5 font-sans text-sm text-talis-stone-700">{description}</p>
      )}
    </div>
  );
}

export default SectionInfo;
