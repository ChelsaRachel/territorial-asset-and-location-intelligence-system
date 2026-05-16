"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { scaleTime } from "d3-scale";
import { axisBottom } from "d3-axis";
import { brushX } from "d3-brush";

export interface PolicyMarker {
  id: string;
  policy_date: string;
  title: string;
  tags: string[];
}

export interface PolicyTimelineProps {
  snapshotsRange: { from: string; to: string };
  policies: PolicyMarker[];
  selectedPeriodA: string | null;
  selectedPeriodB: string | null;
  onPolicyClick(policyId: string): void;
  onPeriodSelect(periodA: string, periodB: string): void;
}

const WIDTH_FALLBACK = 820;
const HEIGHT = 112;
const MARGIN = { top: 16, right: 24, bottom: 30, left: 24 };
const AXIS_Y = 72;
const HANDLE_R = 6;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

const TAG_COLOR: Record<string, string> = {
  infrastruktur: "#1E40AF",
  demand: "#40916C",
  regulasi: "#B45309",
  alert_response: "#7C3AED",
  kapasitas: "#57534E",
  lainnya: "#78716C",
};

function toMonth(date: string): string {
  return date.slice(0, 7);
}

function parseMonth(month: string): Date {
  const [year, monthIndex] = month.split("-").map(Number);
  return new Date(Date.UTC(year ?? 2024, (monthIndex ?? 1) - 1, 1));
}

function formatMonth(date: Date): string {
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

function isoMonth(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function addMonths(date: Date, months: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
}

function monthTicks(from: string, to: string): Date[] {
  const start = parseMonth(from);
  const end = parseMonth(to);
  const ticks: Date[] = [];
  let cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
  while (cursor <= end) {
    ticks.push(cursor);
    cursor = addMonths(cursor, 3);
  }
  if (ticks[ticks.length - 1]?.getTime() !== end.getTime()) ticks.push(end);
  return ticks;
}

function nearestMonthFromX(x: number, scale: ReturnType<typeof scaleTime>, from: string, to: string): string {
  const date = scale.invert(x);
  const month = isoMonth(date);
  if (month < from) return from;
  if (month > to) return to;
  return month;
}

function stackMarkers(markers: Array<PolicyMarker & { x: number }>) {
  const sorted = [...markers].sort((a, b) => a.x - b.x);
  const lanes: number[] = [];
  return sorted.map((marker) => {
    let lane = lanes.findIndex((lastX) => Math.abs(marker.x - lastX) >= 18);
    if (lane === -1) {
      lane = lanes.length;
      lanes.push(marker.x);
    } else {
      lanes[lane] = marker.x;
    }
    return { ...marker, y: 22 + lane * 12 };
  });
}

export function PolicyTimeline({
  snapshotsRange,
  policies,
  selectedPeriodA,
  selectedPeriodB,
  onPolicyClick,
  onPeriodSelect,
}: PolicyTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<number | null>(null);
  const [width, setWidth] = useState(WIDTH_FALLBACK);
  const [hovered, setHovered] = useState<PolicyMarker | null>(null);
  const [dragAnchor, setDragAnchor] = useState<"a" | "b" | null>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const measure = () => setWidth(Math.max(360, Math.round(node.getBoundingClientRect().width || WIDTH_FALLBACK)));
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const scale = useMemo(() => {
    return scaleTime()
      .domain([parseMonth(snapshotsRange.from), parseMonth(snapshotsRange.to)])
      .range([MARGIN.left, width - MARGIN.right]);
  }, [snapshotsRange.from, snapshotsRange.to, width]);

  const ticks = useMemo(() => monthTicks(snapshotsRange.from, snapshotsRange.to), [snapshotsRange.from, snapshotsRange.to]);

  useMemo(() => {
    const axis = axisBottom(scale).tickValues(ticks).tickFormat(formatMonth);
    axisBottom(scale).tickSizeOuter(0);
    return axis;
  }, [scale, ticks]);

  useMemo(() => {
    return brushX().extent([[MARGIN.left, AXIS_Y - 20], [width - MARGIN.right, AXIS_Y + 20]]);
  }, [width]);

  const periodA = selectedPeriodA ?? snapshotsRange.from;
  const periodB = selectedPeriodB ?? snapshotsRange.to;
  const xA = scale(parseMonth(periodA));
  const xB = scale(parseMonth(periodB));
  const [leftX, rightX] = xA <= xB ? [xA, xB] : [xB, xA];

  const positionedMarkers = useMemo(() => {
    return stackMarkers(
      policies.map((policy) => ({
        ...policy,
        x: scale(parseMonth(toMonth(policy.policy_date))),
      })),
    );
  }, [policies, scale]);

  const commitSelection = useCallback(
    (anchor: "a" | "b", x: number) => {
      const month = nearestMonthFromX(x, scale, snapshotsRange.from, snapshotsRange.to);
      const nextA = anchor === "a" ? month : periodA;
      const nextB = anchor === "b" ? month : periodB;
      const ordered = nextA <= nextB ? [nextA, nextB] : [nextB, nextA];
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      debounceRef.current = window.setTimeout(() => onPeriodSelect(ordered[0]!, ordered[1]!), 100);
    },
    [onPeriodSelect, periodA, periodB, scale, snapshotsRange.from, snapshotsRange.to],
  );

  useEffect(() => {
    if (!dragAnchor) return;
    const onMove = (event: MouseEvent) => {
      const svg = containerRef.current?.querySelector("svg");
      const bounds = svg?.getBoundingClientRect();
      if (!bounds) return;
      commitSelection(dragAnchor, event.clientX - bounds.left);
    };
    const onUp = () => setDragAnchor(null);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [commitSelection, dragAnchor]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} data-export-snapshot="policy-timeline" className="relative w-full rounded-lg border border-talis-stone-200 bg-white">
      <svg
        role="img"
        aria-label="Timeline catatan kebijakan"
        width="100%"
        height={HEIGHT}
        viewBox={`0 0 ${width} ${HEIGHT}`}
        className="block"
      >
        <line x1={MARGIN.left} y1={AXIS_Y} x2={width - MARGIN.right} y2={AXIS_Y} stroke="#E7E5E4" />
        {ticks.map((tick) => {
          const x = scale(tick);
          return (
            <g key={tick.toISOString()} data-testid="policy-timeline-tick" transform={`translate(${x},${AXIS_Y})`}>
              <line y2="6" stroke="#E7E5E4" />
              <text y="21" textAnchor="middle" className="fill-talis-stone-700 font-mono text-[10px]">
                {formatMonth(tick)}
              </text>
            </g>
          );
        })}

        <rect
          x={leftX}
          y={AXIS_Y - 13}
          width={Math.max(0, rightX - leftX)}
          height="26"
          rx="8"
          className="fill-talis-green-700/10"
        />
        {[
          { key: "a" as const, x: xA, label: "Period A" },
          { key: "b" as const, x: xB, label: "Period B" },
        ].map((handle) => (
          <g key={handle.key} transform={`translate(${handle.x},${AXIS_Y})`}>
            <circle
              role="slider"
              aria-label={handle.label}
              tabIndex={0}
              r={HANDLE_R}
              className="cursor-ew-resize fill-talis-green-700 stroke-white stroke-2"
              onMouseDown={() => setDragAnchor(handle.key)}
              onKeyDown={(event) => {
                if (event.key === "ArrowLeft") commitSelection(handle.key, handle.x - 18);
                if (event.key === "ArrowRight") commitSelection(handle.key, handle.x + 18);
              }}
            />
            <text y="-11" textAnchor="middle" className="fill-talis-stone-700 font-sans text-[10px]">
              {handle.key.toUpperCase()}
            </text>
          </g>
        ))}

        <rect
          x={MARGIN.left}
          y={AXIS_Y - 18}
          width={width - MARGIN.left - MARGIN.right}
          height="36"
          className="fill-transparent"
          data-testid="policy-timeline-brush"
          onMouseDown={(event) => {
            const bounds = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
            if (!bounds) return;
            const x = event.clientX - bounds.left;
            const anchor = Math.abs(x - xA) <= Math.abs(x - xB) ? "a" : "b";
            commitSelection(anchor, x);
          }}
        />

        {positionedMarkers.map((policy) => {
          const color = TAG_COLOR[policy.tags[0] ?? "lainnya"] ?? TAG_COLOR.lainnya;
          return (
            <g
              key={policy.id}
              data-testid="policy-marker"
              role="button"
              tabIndex={0}
              aria-label={`${policy.title} ${policy.policy_date}`}
              transform={`translate(${policy.x},${policy.y})`}
              className="cursor-pointer"
              onClick={() => onPolicyClick(policy.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") onPolicyClick(policy.id);
              }}
              onMouseEnter={() => setHovered(policy)}
              onMouseLeave={() => setHovered(null)}
            >
              <path d="M0 0 v18" stroke={color} strokeWidth="2" />
              <path d="M1 0 h13 l-3.5 4 3.5 4 H1z" fill={color} />
            </g>
          );
        })}
      </svg>
      {hovered && (
        <div
          role="tooltip"
          className="pointer-events-none absolute z-10 max-w-xs rounded bg-talis-stone-900 px-2.5 py-1.5 font-sans text-xs text-white shadow"
          style={{ left: Math.min(width - 220, Math.max(8, scale(parseMonth(toMonth(hovered.policy_date))) - 40)), top: 8 }}
        >
          <p className="font-semibold">{hovered.title}</p>
          <p className="font-mono text-[11px] text-talis-stone-200">{hovered.policy_date}</p>
        </div>
      )}
    </div>
  );
}
