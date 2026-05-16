import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BenchmarkSection } from "./BenchmarkSection";

vi.mock("../components/BenchmarkCharts", () => ({
  TrajectoryChart: () => <div data-testid="trajectory-chart">Trajectory</div>,
  GapAnalysisBar: () => <div data-testid="gap-chart">Gap</div>,
}));

describe("BenchmarkSection", () => {
  it("renders Berastagi vs Ciwidey lessons as 3+2+3 cards", async () => {
    render(<BenchmarkSection wilayahId={1206090} />);

    expect(await screen.findByText("Kebijakan Berhasil")).toBeInTheDocument();
    expect(screen.getByText("Kesalahan Hindari")).toBeInTheDocument();
    expect(screen.getByText("Implikasi Untuk Aktif")).toBeInTheDocument();
    expect(screen.getByText(/Model koperasi Ciwidey dapat diadopsi/)).toBeInTheDocument();
    expect(screen.getByText("Estimasi Kec. Berastagi di tahun 2030")).toBeInTheDocument();
  });
});
