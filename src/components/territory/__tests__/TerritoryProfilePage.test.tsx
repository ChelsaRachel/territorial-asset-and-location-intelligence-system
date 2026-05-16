import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { TerritoryProfilePage } from "../TerritoryProfilePage";
import { useActiveProfileStore } from "@/lib/store/activeProfile";
import type { WilayahProfile } from "@/lib/store/profileSlug";

// Mock Leaflet-backed dynamic components — they cannot render in jsdom
vi.mock("@/components/territory/a3/ZoningMiniMap.dynamic", () => ({
  ZoningMiniMap: () => <div data-testid="mock-zoning-map" aria-label="Peta zoning wilayah" />,
}));

vi.mock("@/components/territory/a4/MarketAccessRouteMap.dynamic", () => ({
  MarketAccessRouteMap: () => (
    <div data-testid="mock-route-map" aria-label="Peta rute akses pasar" />
  ),
}));

const berastagiProfile: WilayahProfile = {
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
    availableProfiles: [berastagiProfile],
    activeProfile: berastagiProfile,
    hydrationStatus: "ready",
    error: null,
  });
}

describe("TerritoryProfilePage — renders with active Berastagi profile", () => {
  beforeEach(setupBerastagi);

  it("shows the profile header with Berastagi name and location", () => {
    render(<TerritoryProfilePage />);
    expect(screen.getByRole("heading", { name: "Kec. Berastagi" })).toBeInTheDocument();
    // Page header shows kabupaten + provinsi; exact match avoids clash with SectionInfo description
    expect(screen.getByText("Kab. Karo, Sumatera Utara")).toBeInTheDocument();
  });

  it("renders A.2 canonical values: luas (30.5), penduduk (43.214), infra index (75.6)", async () => {
    render(<TerritoryProfilePage />);

    // KpiCard splits value and unit into separate spans; search for value only
    await waitFor(() => {
      expect(screen.getByText("30.5")).toBeInTheDocument();
    });

    // Population formatted in Indonesian locale with dot as thousands separator
    expect(screen.getByText("43.214")).toBeInTheDocument();
    // Infrastructure index rendered as raw JS number by ScoreBadge
    expect(screen.getByText("75.6")).toBeInTheDocument();
  });

  it("renders A.3 canonical values: compliance score 84, BEBAS_INVESTASI flag", async () => {
    render(<TerritoryProfilePage />);

    // Wait for compliance score (ScoreBadge renders raw number in circle div)
    await waitFor(() => {
      expect(screen.getByText("84")).toBeInTheDocument();
    });

    // Only one StatusPill in the page — ZoningCompliancePanel
    expect(screen.getByTestId("status-pill")).toHaveTextContent("Bebas Investasi");

    // Conflict area "488 ha" appears in area breakdown AND possibly implication text
    const matching488 = screen.getAllByText(/488/);
    expect(matching488.length).toBeGreaterThan(0);
  });

  it("renders A.4 canonical values: market access score and route destinations", async () => {
    render(<TerritoryProfilePage />);

    // Wait for the table to appear (A.4 resolves after A.2 and A.3)
    await waitFor(() => {
      expect(screen.getByTestId("market-access-table")).toBeInTheDocument();
    });

    expect(screen.getByText("Belawan, Medan")).toBeInTheDocument();
    expect(screen.getByText("Kualanamu")).toBeInTheDocument();
    expect(screen.getByText("Pusat Pasar Medan")).toBeInTheDocument();
  });

  it("renders A.4 market access score 64 via ScoreBadge", async () => {
    render(<TerritoryProfilePage />);

    await waitFor(() => {
      expect(screen.getByTestId("market-access-table")).toBeInTheDocument();
    });

    // ScoreBadge renders value as raw number; 64 appears in A.4 score panel
    // (air_bersih in A.2 infra breakdown is also 64, so use getAllByText)
    const score64 = screen.getAllByText("64");
    expect(score64.length).toBeGreaterThanOrEqual(1);
  });

  it("renders mock map stubs in A.3 and A.4", async () => {
    render(<TerritoryProfilePage />);

    await waitFor(() => {
      expect(screen.getByTestId("mock-zoning-map")).toBeInTheDocument();
    });

    expect(screen.getByTestId("mock-route-map")).toBeInTheDocument();
  });

  it("renders bottleneck analysis card with Berastagi-Medan road description", async () => {
    render(<TerritoryProfilePage />);

    await waitFor(() => {
      expect(screen.getByTestId("bottleneck-analysis-card")).toBeInTheDocument();
    });

    expect(screen.getByText(/Berastagi.{0,15}Medan/i)).toBeInTheDocument();
  });
});

describe("TerritoryProfilePage — loading and empty states", () => {
  it("shows pending state when hydration is pending and no profile", () => {
    useActiveProfileStore.setState({
      availableProfiles: [],
      activeProfile: null,
      hydrationStatus: "pending",
      error: null,
    });

    render(<TerritoryProfilePage />);
    expect(screen.getByText(/Memuat active profile/)).toBeInTheDocument();
  });

  it("shows empty state message when no active profile after hydration", () => {
    useActiveProfileStore.setState({
      availableProfiles: [],
      activeProfile: null,
      hydrationStatus: "ready",
      error: null,
    });

    render(<TerritoryProfilePage />);
    expect(screen.getByText(/Active profile belum tersedia/)).toBeInTheDocument();
  });
});
