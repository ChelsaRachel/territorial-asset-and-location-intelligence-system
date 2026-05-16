import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { FinancialViabilitySection } from "./FinancialViabilitySection";
import { useActiveProfileStore } from "@/lib/store/activeProfile";
import { useAssessmentStore } from "@/lib/store/assessment";
import type { WilayahProfile } from "@/lib/store/profileSlug";

vi.mock("recharts", () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-bar-chart">{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
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

function setupBerastagiAgribisnis() {
  useActiveProfileStore.setState({
    availableProfiles: [berastagi],
    activeProfile: berastagi,
    hydrationStatus: "ready",
    error: null,
  });
  useAssessmentStore.setState({
    currentSektor: "agribisnis",
    customWeightsEnabled: false,
    customWeights: null,
    gapSortColumn: "priority_score",
    gapSortDirection: "desc",
    expandedGapRows: new Set(),
  });
}

describe("FinancialViabilitySection — loading state", () => {
  beforeEach(() => {
    useActiveProfileStore.setState({
      availableProfiles: [],
      activeProfile: null,
      hydrationStatus: "pending",
      error: null,
    });
  });

  it("shows loading skeletons while hydration is pending", () => {
    render(<FinancialViabilitySection />);
    expect(screen.getAllByTestId("loading-skeleton").length).toBeGreaterThan(0);
  });
});

describe("FinancialViabilitySection — Berastagi Agribisnis", () => {
  beforeEach(setupBerastagiAgribisnis);

  it("renders section title", () => {
    render(<FinancialViabilitySection />);
    expect(screen.getByText("C.6 — Financial Viability")).toBeInTheDocument();
  });

  it("renders VIABLE zone for stroberi agribisnis (ratio 2.12x)", async () => {
    render(<FinancialViabilitySection />);
    await waitFor(
      () => expect(screen.getAllByText("Viable").length).toBeGreaterThanOrEqual(1),
      { timeout: 3000 },
    );
    expect(screen.getByText("2.12x")).toBeInTheDocument();
  });

  it("renders sensitivitas table with 4 skenario rows", async () => {
    render(<FinancialViabilitySection />);
    await waitFor(
      () => expect(screen.getByText("Analisis Sensitivitas")).toBeInTheDocument(),
      { timeout: 3000 },
    );
    expect(screen.getByText("Harga turun -10%")).toBeInTheDocument();
    expect(screen.getByText("Yield turun -15%")).toBeInTheDocument();
    expect(screen.getByText("Biaya input naik +20%")).toBeInTheDocument();
    expect(screen.getByText("Kombinasi Terburuk")).toBeInTheDocument();
  });

  it("sensitivitas kombinasi terburuk shows BORDERLINE zone", async () => {
    render(<FinancialViabilitySection />);
    await waitFor(
      () => expect(screen.getByText("Kombinasi Terburuk")).toBeInTheDocument(),
      { timeout: 3000 },
    );
    expect(screen.getByText("Borderline")).toBeInTheDocument();
  });

  it("asumsi disclosure expands on click", async () => {
    render(<FinancialViabilitySection />);
    await waitFor(
      () => expect(screen.getByText("Asumsi & Basis Kalkulasi")).toBeInTheDocument(),
      { timeout: 3000 },
    );
    fireEvent.click(screen.getByText("Asumsi & Basis Kalkulasi"));
    await waitFor(
      () => expect(screen.getByText("stroberi")).toBeInTheDocument(),
      { timeout: 1000 },
    );
  });
});
