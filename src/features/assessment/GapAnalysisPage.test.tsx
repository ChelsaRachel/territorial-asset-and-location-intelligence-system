import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { GapAnalysisPage } from "./GapAnalysisPage";
import { useActiveProfileStore } from "@/lib/store/activeProfile";
import { useAssessmentStore } from "@/lib/store/assessment";
import type { WilayahProfile } from "@/lib/store/profileSlug";

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

describe("GapAnalysisPage — loading state", () => {
  beforeEach(() => {
    useActiveProfileStore.setState({
      availableProfiles: [],
      activeProfile: null,
      hydrationStatus: "pending",
      error: null,
    });
  });

  it("shows loading skeletons while hydration is pending", () => {
    render(<GapAnalysisPage />);
    expect(screen.getAllByTestId("loading-skeleton").length).toBeGreaterThan(0);
  });
});

describe("GapAnalysisPage — with Berastagi active", () => {
  beforeEach(setupBerastagi);

  it("renders page heading", () => {
    render(<GapAnalysisPage />);
    expect(screen.getByText("Multi-Wilayah Gap Analysis")).toBeInTheDocument();
  });

  it("renders column headers", async () => {
    render(<GapAnalysisPage />);
    await waitFor(
      () => expect(screen.getByText("Priority Score")).toBeInTheDocument(),
      { timeout: 3000 },
    );
    expect(screen.getByText("Skor Potensi")).toBeInTheDocument();
    expect(screen.getByText("Infra Gap")).toBeInTheDocument();
  });

  it("renders Berastagi in the table", async () => {
    render(<GapAnalysisPage />);
    await waitFor(
      () => expect(screen.getByText("Kec. Berastagi")).toBeInTheDocument(),
      { timeout: 3000 },
    );
  });

  it("sorts by rank ascending by default (row 1 appears first)", async () => {
    render(<GapAnalysisPage />);
    await waitFor(
      () => expect(screen.getByText("Kec. Berastagi")).toBeInTheDocument(),
      { timeout: 3000 },
    );
    const rows = screen.getAllByRole("row");
    // First data row (index 1 after header) should have rank #1
    expect(rows[1]).toHaveTextContent("#1");
  });

  it("expands row detail on click", async () => {
    render(<GapAnalysisPage />);
    await waitFor(
      () => expect(screen.getByText("Kec. Berastagi")).toBeInTheDocument(),
      { timeout: 3000 },
    );
    const lihatButtons = screen.getAllByRole("button", { name: /Lihat/ });
    fireEvent.click(lihatButtons[0]!);
    await waitFor(
      () => expect(screen.getByText(/Sub-Komponen Gap/)).toBeInTheDocument(),
      { timeout: 1000 },
    );
  });

  it("changes sort direction when clicking a column header", async () => {
    render(<GapAnalysisPage />);
    await waitFor(
      () => expect(screen.getByText("Priority Score")).toBeInTheDocument(),
      { timeout: 3000 },
    );
    const priorityHeader = screen.getByText("Priority Score");
    fireEvent.click(priorityHeader);
    // After click, sort indicator should appear
    await waitFor(
      () => expect(screen.getByText("↑")).toBeInTheDocument(),
      { timeout: 1000 },
    );
  });
});
