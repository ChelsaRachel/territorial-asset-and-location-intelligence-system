import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { FeasibilitySection } from "./FeasibilitySection";
import { useActiveProfileStore } from "@/lib/store/activeProfile";
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

describe("FeasibilitySection — loading state", () => {
  beforeEach(() => {
    useActiveProfileStore.setState({
      availableProfiles: [],
      activeProfile: null,
      hydrationStatus: "pending",
      error: null,
    });
  });

  it("shows loading skeletons while hydration is pending", () => {
    render(<FeasibilitySection />);
    expect(screen.getAllByTestId("loading-skeleton").length).toBeGreaterThan(0);
  });
});

describe("FeasibilitySection — Berastagi quadrants", () => {
  beforeEach(() => {
    useActiveProfileStore.setState({
      availableProfiles: [berastagi],
      activeProfile: berastagi,
      hydrationStatus: "ready",
      error: null,
    });
  });

  it("renders section title", () => {
    render(<FeasibilitySection />);
    expect(screen.getByText("C.4 — Feasibility Snapshot")).toBeInTheDocument();
  });

  it("renders all four quadrant labels", async () => {
    render(<FeasibilitySection />);
    await waitFor(
      () => expect(screen.getByText("Land Suitability")).toBeInTheDocument(),
      { timeout: 3000 },
    );
    expect(screen.getByText("Market Access")).toBeInTheDocument();
    expect(screen.getByText("Infrastructure")).toBeInTheDocument();
    expect(screen.getByText("Zoning & Regulasi")).toBeInTheDocument();
  });

  it("renders Baik tier for lahan (score 82)", async () => {
    render(<FeasibilitySection />);
    await waitFor(
      () => {
        const baikBadges = screen.getAllByText("Baik");
        expect(baikBadges.length).toBeGreaterThanOrEqual(1);
      },
      { timeout: 3000 },
    );
  });

  it("renders Cukup tier for pasar and infrastruktur", async () => {
    render(<FeasibilitySection />);
    await waitFor(
      () => {
        const cukupBadges = screen.getAllByText("Cukup");
        expect(cukupBadges.length).toBeGreaterThanOrEqual(2);
      },
      { timeout: 3000 },
    );
  });
});
