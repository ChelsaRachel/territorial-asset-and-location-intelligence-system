import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      data-testid="empty-state"
      className={`flex flex-col items-center justify-center py-12 text-center ${className ?? ""}`}
    >
      {icon && <div className="mb-3 text-talis-stone-700/50 text-4xl">{icon}</div>}
      <p className="font-sans text-sm font-medium text-talis-stone-900">{title}</p>
      {description && (
        <p className="mt-1 font-sans text-xs text-talis-stone-700 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default EmptyState;
