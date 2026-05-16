import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { TrendSection } from "./TrendSection";
import { useActiveProfileStore } from "@/lib/store/activeProfile";
import type { WilayahProfile } from "@/lib/store/profileSlug";

// Mock Recharts sub-components to avoid jsdom layout issues
vi.mock("../components/NdviTrendChart", () => ({
  NdviTrendChart: () => <div data-testid="mock-ndvi-chart" />,
}));
vi.mock("../components/PdrbTrendChart", () => ({
  PdrbTrendChart: () => <div data-testid="mock-pdrb-chart" />,
}));
vi.mock("../components/ClimateAnomalyChart", () => ({
  ClimateAnomalyChart: () => <div data-testid="mock-spi-chart" />,
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

function setupBerastagi() {
  useActiveProfileStore.setState({
    availableProfiles: [berastagi],
    activeProfile: berastagi,
    hydrationStatus: "ready",
    error: null,
  });
}

describe("TrendSection — loading state", () => {
  beforeEach(() => {
    useActiveProfileStore.setState({
      availableProfiles: [],
      activeProfile: null,
      hydrationStatus: "pending",
      error: null,
    });
  });

  it("shows loading skeletons while hydration is pending", () => {
    render(<TrendSection />);
    expect(screen.getAllByTestId("loading-skeleton").length).toBeGreaterThan(0);
  });
});

describe("TrendSection — empty state", () => {
  beforeEach(() => {
    useActiveProfileStore.setState({
      availableProfiles: [],
      activeProfile: null,
      hydrationStatus: "ready",
      error: null,
    });
  });

  it("shows empty state when no active profile", () => {
    render(<TrendSection />);
    expect(screen.getByText("Pilih wilayah aktif")).toBeInTheDocument();
  });
});

describe("TrendSection — success with Berastagi", () => {
  beforeEach(setupBerastagi);

  it("renders section title", () => {
    render(<TrendSection />);
    expect(screen.getByText("Tren Kondisi Wilayah")).toBeInTheDocument();
  });

  it("renders tren label Membaik and score 76", async () => {
    render(<TrendSection />);
    // "Membaik" appears in both banner text and badge — use getAllByText
    await waitFor(
      () => expect(screen.getAllByText("Membaik").length).toBeGreaterThan(0),
      { timeout: 3000 },
    );
    expect(screen.getByText("76")).toBeInTheDocument();
  });

  it("renders Normal scenario card with 65% probability", async () => {
    render(<TrendSection />);
    // "Normal" appears in both label and badge of the scenario card
    await waitFor(
      () => expect(screen.getAllByText("Normal").length).toBeGreaterThan(0),
      { timeout: 3000 },
    );
    expect(screen.getByText("65%")).toBeInTheDocument();
  });

  it("renders El Niño Lemah scenario with 25% probability", async () => {
    render(<TrendSection />);
    await waitFor(
      () => expect(screen.getAllByText("El Niño Lemah").length).toBeGreaterThan(0),
      { timeout: 3000 },
    );
    expect(screen.getByText("25%")).toBeInTheDocument();
  });

  it("renders El Niño Kuat scenario with 10% probability", async () => {
    render(<TrendSection />);
    await waitFor(
      () => expect(screen.getAllByText("El Niño Kuat").length).toBeGreaterThan(0),
      { timeout: 3000 },
    );
    expect(screen.getByText("10%")).toBeInTheDocument();
  });

  it("renders chart stubs for NDVI, PDRB, SPI", async () => {
    render(<TrendSection />);
    await waitFor(() => expect(screen.getByTestId("mock-ndvi-chart")).toBeInTheDocument(), {
      timeout: 3000,
    });
    expect(screen.getByTestId("mock-pdrb-chart")).toBeInTheDocument();
    expect(screen.getByTestId("mock-spi-chart")).toBeInTheDocument();
  });
});

describe("TrendSection — error state (not found)", () => {
  it("shows not-found message for unknown wilayah", async () => {
    useActiveProfileStore.setState({
      availableProfiles: [{ ...berastagi, wilayah_id: 9999999 }],
      activeProfile: { ...berastagi, wilayah_id: 9999999 },
      hydrationStatus: "ready",
      error: null,
    });
    render(<TrendSection />);
    await waitFor(
      () => expect(screen.getByText("Data tren belum tersedia")).toBeInTheDocument(),
      { timeout: 3000 },
    );
  });
});
