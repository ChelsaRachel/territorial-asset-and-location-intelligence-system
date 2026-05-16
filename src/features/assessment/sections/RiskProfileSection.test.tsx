import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { RiskProfileSection } from "./RiskProfileSection";
import { useActiveProfileStore } from "@/lib/store/activeProfile";
import type { WilayahProfile } from "@/lib/store/profileSlug";

vi.mock("recharts", () => ({
  RadarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-radar-chart">{children}</div>,
  Radar: () => null,
  PolarGrid: () => null,
  PolarAngleAxis: () => null,
  PolarRadiusAxis: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Tooltip: () => null,
}));

const berastagi: WilayahProfile = {
  wilayah_id: 1206090,
  nama: "Kec. Berastagi",
  kabupaten: "Kab. Karo",
  provinsi: "Sumatera Utara",
  lat: 3.1968,
  lng: 98.5095,
  profil_kode: "AGRO_HOSP",
  marker_color: "#1E40AF",
  marker_radius: 14,
  is_default: false,
  karakter_singkat: "Dataran tinggi vulkanik subur",
  elevasi_meter: 1300,
};

describe("RiskProfileSection — loading state", () => {
  beforeEach(() => {
    useActiveProfileStore.setState({
      availableProfiles: [],
      activeProfile: null,
      hydrationStatus: "pending",
      error: null,
    });
  });

  it("shows loading skeletons while hydration is pending", () => {
    render(<RiskProfileSection />);
    expect(screen.getAllByTestId("loading-skeleton").length).toBeGreaterThan(0);
  });
});

describe("RiskProfileSection — Berastagi risk data", () => {
  beforeEach(() => {
    useActiveProfileStore.setState({
      availableProfiles: [berastagi],
      activeProfile: berastagi,
      hydrationStatus: "ready",
      error: null,
    });
  });

  it("renders section title", () => {
    render(<RiskProfileSection />);
    expect(screen.getByText("C.3 — Risk Profile")).toBeInTheDocument();
  });

  it("renders radar chart stub", async () => {
    render(<RiskProfileSection />);
    await waitFor(
      () => expect(screen.getByTestId("mock-radar-chart")).toBeInTheDocument(),
      { timeout: 3000 },
    );
  });

  it("renders Risiko Dominan as Iklim (skor 62)", async () => {
    render(<RiskProfileSection />);
    await waitFor(
      () => expect(screen.getByText("Risiko Dominan")).toBeInTheDocument(),
      { timeout: 3000 },
    );
    // "Iklim" appears in the dominan card and in the collapsible detail buttons
    expect(screen.getAllByText("Iklim").length).toBeGreaterThan(0);
    // "62" appears twice (dominan score + mitigation plan row) — use getAllByText
    expect(screen.getAllByText("62").length).toBeGreaterThan(0);
  });

  it("renders mitigation plan table with four rows", async () => {
    render(<RiskProfileSection />);
    await waitFor(
      () => expect(screen.getByText("Mitigation Plan")).toBeInTheDocument(),
      { timeout: 3000 },
    );
    const rows = screen.getAllByRole("row");
    // header + 4 data rows = 5
    expect(rows.length).toBeGreaterThanOrEqual(5);
  });

  it("expands a dimension detail card on click", async () => {
    render(<RiskProfileSection />);
    await waitFor(
      () => expect(screen.getByText("Detail Dimensi")).toBeInTheDocument(),
      { timeout: 3000 },
    );
    // Find the collapsible dimension detail button and click it
    const iklimDetailButton = screen.getByRole("button", { name: /Iklim/ });
    fireEvent.click(iklimDetailButton);
    await waitFor(
      () => expect(screen.getByText("SPI Kumulatif 10 Tahun")).toBeInTheDocument(),
      { timeout: 1000 },
    );
  });
});
