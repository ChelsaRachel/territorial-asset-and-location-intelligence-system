// Pure SVG half-circle gauge — SSR-safe, no external dependencies.
// The arc spans from 180° (left) to 0° (right) through the top, score 0→100.

interface Props {
  score: number;
}

const CX = 100;
const CY = 105;
const R = 80;
const STROKE = 14;

function toXY(angleDeg: number): [number, number] {
  const rad = (angleDeg * Math.PI) / 180;
  return [CX + R * Math.cos(rad), CY - R * Math.sin(rad)];
}

function arcPath(endAngleDeg: number): string {
  const [sx, sy] = toXY(180);
  const [ex, ey] = toXY(endAngleDeg);
  // sweep=1 (clockwise in SVG) traces the upper arc from left toward right.
  // large-arc=0 for arcs ≤ 180°.
  return `M ${sx.toFixed(2)},${sy.toFixed(2)} A ${R},${R} 0 0,1 ${ex.toFixed(2)},${ey.toFixed(2)}`;
}

export function GrowthProjectionGauge({ score }: Props) {
  const s = Math.min(100, Math.max(0, score));
  // Clamp to [0.5, 179.5] so we never hit the degenerate endpoint case.
  const endAngle = 180 - Math.min(99.9, Math.max(0.1, s)) * 1.8;
  const [nx, ny] = toXY(endAngle);

  const gaugeColor = s >= 70 ? "#40916C" : s >= 40 ? "#B45309" : "#B42318";

  return (
    <div className="flex flex-col items-center">
      <svg
        width={200}
        height={120}
        viewBox="0 0 200 120"
        aria-label={`Growth Projection Score ${score} dari 100`}
        role="img"
      >
        {/* Background track */}
        <path
          d={arcPath(0.1)}
          fill="none"
          stroke="#E7E5E4"
          strokeWidth={STROKE}
          strokeLinecap="round"
        />

        {/* Filled arc */}
        {s > 0 && (
          <path
            d={arcPath(endAngle)}
            fill="none"
            stroke={gaugeColor}
            strokeWidth={STROKE}
            strokeLinecap="round"
          />
        )}

        {/* Needle dot */}
        <circle cx={nx} cy={ny} r={7} fill={gaugeColor} />
        <circle cx={nx} cy={ny} r={3.5} fill="white" />

        {/* Score */}
        <text
          x={CX}
          y={CY - 14}
          textAnchor="middle"
          fontFamily="var(--font-mono), ui-monospace, monospace"
          fontSize={38}
          fontWeight={700}
          fill={gaugeColor}
        >
          {s}
        </text>
        <text
          x={CX}
          y={CY + 6}
          textAnchor="middle"
          fontFamily="var(--font-sans), ui-sans-serif, sans-serif"
          fontSize={12}
          fill="#78716C"
        >
          / 100
        </text>

        {/* Range labels */}
        <text x={20} y={118} textAnchor="middle" fontSize={10} fill="#78716C" fontFamily="var(--font-mono), ui-monospace">0</text>
        <text x={180} y={118} textAnchor="middle" fontSize={10} fill="#78716C" fontFamily="var(--font-mono), ui-monospace">100</text>
      </svg>
    </div>
  );
}
