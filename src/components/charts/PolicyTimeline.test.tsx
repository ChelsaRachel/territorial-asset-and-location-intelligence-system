import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PolicyTimeline, type PolicyMarker } from "./PolicyTimeline";

const policies: PolicyMarker[] = [
  { id: "pol-1", policy_date: "2024-08-12", title: "Pembangunan Jalan Desa Cisondari", tags: ["infrastruktur"] },
  { id: "pol-2", policy_date: "2024-11-05", title: "Pembangunan Tower 4G Naman Teran", tags: ["infrastruktur"] },
  { id: "pol-3", policy_date: "2025-02-18", title: "MoU Koperasi Stroberi Semperjaya", tags: ["demand"] },
];

describe("PolicyTimeline", () => {
  it("renders markers and fires policy click callbacks", () => {
    const onPolicyClick = vi.fn();
    render(
      <PolicyTimeline
        snapshotsRange={{ from: "2024-01", to: "2026-04" }}
        policies={policies}
        selectedPeriodA="2024-01"
        selectedPeriodB="2026-04"
        onPolicyClick={onPolicyClick}
        onPeriodSelect={vi.fn()}
      />,
    );

    expect(screen.getAllByTestId("policy-marker")).toHaveLength(3);
    fireEvent.click(screen.getByLabelText(/Pembangunan Jalan Desa Cisondari/i));
    expect(onPolicyClick).toHaveBeenCalledWith("pol-1");
    expect(screen.getAllByTestId("policy-timeline-tick").length).toBeGreaterThan(3);
  });

  it("fires period selection from the brush target", async () => {
    vi.useFakeTimers();
    const onPeriodSelect = vi.fn();
    render(
      <PolicyTimeline
        snapshotsRange={{ from: "2024-01", to: "2026-04" }}
        policies={policies}
        selectedPeriodA="2024-01"
        selectedPeriodB="2026-04"
        onPolicyClick={vi.fn()}
        onPeriodSelect={onPeriodSelect}
      />,
    );

    const brush = screen.getByTestId("policy-timeline-brush");
    (brush as unknown as SVGElement).ownerSVGElement!.getBoundingClientRect = () =>
      ({ left: 0, top: 0, right: 820, bottom: 112, width: 820, height: 112, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect;
    fireEvent.mouseDown(brush, { clientX: 410 });
    vi.advanceTimersByTime(120);
    expect(onPeriodSelect).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
