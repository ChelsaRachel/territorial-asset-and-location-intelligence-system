import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DemandSection } from "./DemandSection";
import { useActiveProfileStore } from "@/lib/store/activeProfile";
import type { WilayahProfile } from "@/lib/store/profileSlug";

vi.mock("../components/SupplyDemandChart", () => ({
  SupplyDemandChart: () => <div data-testid="mock-supply-demand-chart" />,
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

const seminyak: WilayahProfile = {
  wilayah_id: 5103060,
  nama: "Kec. Seminyak",
  kabupaten: "Kab. Badung",
  provinsi: "Bali",
  lat: -8.6928,
  lng: 115.1626,
  profil_kode: "HOSPITALITY_DOMINANT",
  marker_color: "#B42318",
  marker_radius: 14,
  is_default: false,
  karakter_singkat: "Destinasi premium internasional",
  elevasi_meter: 10,
};

function setupBerastagi() {
  useActiveProfileStore.setState({
    availableProfiles: [berastagi],
    activeProfile: berastagi,
    hydrationStatus: "ready",
    error: null,
  });
}

describe("DemandSection — loading state", () => {
  beforeEach(() => {
    useActiveProfileStore.setState({
      availableProfiles: [],
      activeProfile: null,
      hydrationStatus: "pending",
      error: null,
    });
  });

  it("shows loading skeletons while hydration is pending", () => {
    render(<DemandSection />);
    expect(screen.getAllByTestId("loading-skeleton").length).toBeGreaterThan(0);
  });
});

describe("DemandSection — empty state (no active profile)", () => {
  beforeEach(() => {
    useActiveProfileStore.setState({
      availableProfiles: [],
      activeProfile: null,
      hydrationStatus: "ready",
      error: null,
    });
  });

  it("shows empty state when no active profile", () => {
    render(<DemandSection />);
    expect(screen.getByText("Pilih wilayah aktif")).toBeInTheDocument();
  });
});

describe("DemandSection — Berastagi Agro success", () => {
  beforeEach(setupBerastagi);

  it("renders section title", () => {
    render(<DemandSection />);
    expect(screen.getByText("Demand dan Serapan Pasar")).toBeInTheDocument();
  });

  it("renders sector tabs", () => {
    render(<DemandSection />);
    expect(screen.getByRole("button", { name: "Agro" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hospitality" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pariwisata" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Properti" })).toBeInTheDocument();
  });

  it("renders Berastagi Agro canonical Stroberi gap +560", async () => {
    render(<DemandSection />);
    // Stroberi appears in OpportunityCard and table row
    await waitFor(() => expect(screen.getAllByText("Stroberi").length).toBeGreaterThan(0), {
      timeout: 3000,
    });
    expect(screen.getByText("+560 ton/bln")).toBeInTheDocument();
  });

  it("renders Markisa as an opportunity", async () => {
    render(<DemandSection />);
    await waitFor(() => expect(screen.getAllByText("Markisa").length).toBeGreaterThan(0), {
      timeout: 3000,
    });
  });

  it("renders Kubis oversupply warning", async () => {
    render(<DemandSection />);
    await waitFor(() => expect(screen.getAllByText("Kubis").length).toBeGreaterThan(0), {
      timeout: 3000,
    });
    expect(screen.getByText("Hindari Komoditas Ini")).toBeInTheDocument();
  });

  it("renders Kopi Arabika", async () => {
    render(<DemandSection />);
    await waitFor(() => expect(screen.getAllByText("Kopi Arabika").length).toBeGreaterThan(0), {
      timeout: 3000,
    });
  });

  it("renders demand absorption score 78", async () => {
    render(<DemandSection />);
    await waitFor(() => expect(screen.getByText("78")).toBeInTheDocument(), { timeout: 3000 });
  });
});

describe("DemandSection — sector tab switching", () => {
  beforeEach(setupBerastagi);

  it("switches to Hospitality sektor on tab click and Stroberi disappears", async () => {
    const user = userEvent.setup();
    render(<DemandSection />);
    // Wait for initial agro data
    await waitFor(() => expect(screen.getAllByText("Stroberi").length).toBeGreaterThan(0), {
      timeout: 3000,
    });
    // Switch to Hospitality
    await user.click(screen.getByRole("button", { name: "Hospitality" }));
    await waitFor(() => expect(screen.queryByText("Stroberi")).not.toBeInTheDocument(), {
      timeout: 3000,
    });
  });
});

describe("DemandSection — empty sektor for Seminyak Agro", () => {
  beforeEach(() => {
    useActiveProfileStore.setState({
      availableProfiles: [seminyak],
      activeProfile: seminyak,
      hydrationStatus: "ready",
      error: null,
    });
  });

  it("shows empty sektor message when Seminyak agro has no items", async () => {
    render(<DemandSection />);
    await waitFor(() => expect(screen.getByText(/belum ada data agro/i)).toBeInTheDocument(), {
      timeout: 3000,
    });
  });
});
