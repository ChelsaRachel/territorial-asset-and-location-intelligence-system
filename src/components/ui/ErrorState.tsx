interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Gagal memuat data",
  description,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      data-testid="error-state"
      className={`rounded-lg border border-talis-red-700/30 bg-talis-red-700/5 p-4 ${className ?? ""}`}
    >
      <p className="font-sans text-sm font-medium text-talis-red-700">{title}</p>
      {description && (
        <p className="mt-1 font-sans text-xs text-talis-stone-700">{description}</p>
      )}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 font-sans text-xs font-medium text-talis-green-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-talis-green-700"
        >
          Coba lagi
        </button>
      )}
    </div>
  );
}

export default ErrorState;
