import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMonitoringStore } from "@/lib/store/useMonitoring";
import { PolicyDecisionLogSection } from "./PolicyDecisionLogSection";

vi.mock("@/components/charts/PolicyTimelineLazy", () => ({
  PolicyTimelineLazy: () => <div data-testid="policy-timeline-mock">Timeline</div>,
}));

describe("PolicyDecisionLogSection", () => {
  beforeEach(() => {
    useMonitoringStore.setState({ policyPeriodA: "2024-01", policyPeriodB: "2026-04" });
  });

  it("renders canonical Berastagi deltas and policy cards", async () => {
    render(<PolicyDecisionLogSection wilayahId={1206090} />);

    expect(await screen.findByText("Pembangunan Jalan Desa Cisondari")).toBeInTheDocument();
    expect(screen.getByText("Rp 180rb/m²")).toBeInTheDocument();
    expect(screen.getByText("Rp 420rb/m²")).toBeInTheDocument();
    expect(screen.getByText("▲ +133%")).toBeInTheDocument();
    expect(screen.getByText("MoU Koperasi Stroberi Semperjaya — Dinas Pertanian Karo")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId("policy-timeline-mock")).toBeInTheDocument());
  });
});
