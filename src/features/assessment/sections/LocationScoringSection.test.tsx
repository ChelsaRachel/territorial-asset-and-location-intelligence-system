import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { LocationScoringSection } from "./LocationScoringSection";
import { useActiveProfileStore } from "@/lib/store/activeProfile";
import { useAssessmentStore } from "@/lib/store/assessment";
import type { WilayahProfile } from "@/lib/store/profileSlug";

// Mock Recharts to avoid jsdom layout issues
vi.mock("recharts", () => ({
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

function setupBerastagi() {
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

describe("LocationScoringSection — loading state", () => {
  beforeEach(() => {
    useActiveProfileStore.setState({
      availableProfiles: [],
      activeProfile: null,
      hydrationStatus: "pending",
      error: null,
    });
  });

  it("shows loading skeletons while hydration is pending", () => {
    render(<LocationScoringSection />);
    expect(screen.getAllByTestId("loading-skeleton").length).toBeGreaterThan(0);
  });
});

describe("LocationScoringSection — empty state", () => {
  beforeEach(() => {
    useActiveProfileStore.setState({
      availableProfiles: [],
      activeProfile: null,
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
  });

  it("shows empty state when no active profile", () => {
    render(<LocationScoringSection />);
    expect(screen.getByText("Pilih wilayah aktif")).toBeInTheDocument();
  });
});

describe("LocationScoringSection — Berastagi Agribisnis", () => {
  beforeEach(setupBerastagi);

  it("renders section title", () => {
    render(<LocationScoringSection />);
    expect(screen.getByText("C.1 — Location Scoring Card")).toBeInTheDocument();
  });

  it("renders four sektor tab buttons", () => {
    render(<LocationScoringSection />);
    expect(screen.getByText("Agribisnis")).toBeInTheDocument();
    expect(screen.getByText("Hospitality")).toBeInTheDocument();
    expect(screen.getByText("Pariwisata")).toBeInTheDocument();
    expect(screen.getByText("Properti")).toBeInTheDocument();
  });

  it("renders Location Score 78 for Berastagi Agribisnis", async () => {
    render(<LocationScoringSection />);
    await waitFor(
      () => {
        const badge = screen.getByTestId("score-badge");
        expect(badge).toHaveTextContent("78");
      },
      { timeout: 3000 },
    );
  });

  it("renders all five dimension labels", async () => {
    render(<LocationScoringSection />);
    // Labels appear in breakdown and possibly in effort-vs-impact — use getAllByText
    await waitFor(
      () => expect(screen.getAllByText("Land Suitability").length).toBeGreaterThan(0),
      { timeout: 3000 },
    );
    expect(screen.getAllByText("Infrastructure").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Zoning Compliance").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Market Access").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Growth Projection").length).toBeGreaterThan(0);
  });

  it("shows effort vs impact card with at least one entry", async () => {
    render(<LocationScoringSection />);
    await waitFor(
      () =>
        expect(
          screen.getByText("Effort vs Impact — Prioritas Peningkatan"),
        ).toBeInTheDocument(),
      { timeout: 3000 },
    );
  });
});

describe("LocationScoringSection — sektor switch recomputes score", () => {
  beforeEach(setupBerastagi);

  it("shows Hospitality score 62 after switching sektor", async () => {
    render(<LocationScoringSection />);

    // Wait for initial agribisnis load
    await waitFor(
      () => {
        const badge = screen.getByTestId("score-badge");
        expect(badge).toHaveTextContent("78");
      },
      { timeout: 3000 },
    );

    // Switch to Hospitality
    fireEvent.click(screen.getByText("Hospitality"));

    await waitFor(
      () => {
        const badge = screen.getByTestId("score-badge");
        expect(badge).toHaveTextContent("62");
      },
      { timeout: 3000 },
    );
  });
});

describe("LocationScoringSection — error state (not found)", () => {
  it("shows not-found message for unknown wilayah", async () => {
    useActiveProfileStore.setState({
      availableProfiles: [{ ...berastagi, wilayah_id: 9999999 }],
      activeProfile: { ...berastagi, wilayah_id: 9999999 },
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
    render(<LocationScoringSection />);
    await waitFor(
      () => expect(screen.getByText("Data lokasi belum tersedia")).toBeInTheDocument(),
      { timeout: 3000 },
    );
  });
});
