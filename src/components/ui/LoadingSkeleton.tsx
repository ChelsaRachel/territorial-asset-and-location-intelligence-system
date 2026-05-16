interface LoadingSkeletonProps {
  shape?: "text" | "card" | "chart" | "table-row" | "circle";
  width?: string;
  height?: string;
  count?: number;
  className?: string;
}

const SHAPE_DEFAULTS: Record<string, { width: string; height: string }> = {
  text: { width: "w-full", height: "h-4" },
  card: { width: "w-full", height: "h-24" },
  chart: { width: "w-full", height: "h-40" },
  "table-row": { width: "w-full", height: "h-10" },
  circle: { width: "w-10", height: "h-10" },
};

function SkeletonItem({
  shape,
  width,
  height,
}: {
  shape: string;
  width: string;
  height: string;
}) {
  const rounded = shape === "circle" ? "rounded-full" : "rounded";
  return <div className={`${width} ${height} ${rounded} bg-talis-stone-200 animate-pulse`} />;
}

export function LoadingSkeleton({
  shape = "text",
  width,
  height,
  count = 1,
  className,
}: LoadingSkeletonProps) {
  const defaults = SHAPE_DEFAULTS[shape] ?? SHAPE_DEFAULTS["text"]!;
  const w = width ?? defaults.width;
  const h = height ?? defaults.height;

  return (
    <div data-testid="loading-skeleton" className={`space-y-2 ${className ?? ""}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonItem key={i} shape={shape} width={w} height={h} />
      ))}
    </div>
  );
}

export default LoadingSkeleton;
