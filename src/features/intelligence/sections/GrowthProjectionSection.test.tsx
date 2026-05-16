import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { GrowthProjectionSection } from "./GrowthProjectionSection";
import { useActiveProfileStore } from "@/lib/store/activeProfile";
import type { WilayahProfile } from "@/lib/store/profileSlug";

// GrowthProjectionSection uses only pure SVG (no Recharts) — no chart mocking needed.

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

describe("GrowthProjectionSection — loading state", () => {
  beforeEach(() => {
    useActiveProfileStore.setState({
      availableProfiles: [],
      activeProfile: null,
      hydrationStatus: "pending",
      error: null,
    });
  });

  it("shows loading skeletons while hydration is pending", () => {
    render(<GrowthProjectionSection />);
    expect(screen.getAllByTestId("loading-skeleton").length).toBeGreaterThan(0);
  });
});

describe("GrowthProjectionSection — empty state", () => {
  beforeEach(() => {
    useActiveProfileStore.setState({
      availableProfiles: [],
      activeProfile: null,
      hydrationStatus: "ready",
      error: null,
    });
  });

  it("shows empty state when no active profile", () => {
    render(<GrowthProjectionSection />);
    expect(screen.getByText("Pilih wilayah aktif")).toBeInTheDocument();
  });
});

describe("GrowthProjectionSection — success with Berastagi", () => {
  beforeEach(setupBerastagi);

  it("renders section title", () => {
    render(<GrowthProjectionSection />);
    expect(screen.getByText("Proyeksi Pertumbuhan")).toBeInTheDocument();
  });

  it("renders SVG gauge with aria-label containing score 81", async () => {
    render(<GrowthProjectionSection />);
    await waitFor(
      () =>
        expect(
          screen.getByRole("img", { name: /Growth Projection Score 81/i }),
        ).toBeInTheDocument(),
      { timeout: 3000 },
    );
  });

  it("renders breakdown bar Pipeline Infrastruktur with score 92", async () => {
    render(<GrowthProjectionSection />);
    await waitFor(
      () => expect(screen.getByText("Pipeline Infrastruktur")).toBeInTheDocument(),
      { timeout: 3000 },
    );
    expect(screen.getByText("92")).toBeInTheDocument();
  });

  it("renders Komponen Skor section with all three breakdown components", async () => {
    render(<GrowthProjectionSection />);
    await waitFor(
      () => expect(screen.getByText("Komponen Skor")).toBeInTheDocument(),
      { timeout: 3000 },
    );
    expect(screen.getByText("Emerging Destination")).toBeInTheDocument();
    expect(screen.getByText("CAGR Penduduk")).toBeInTheDocument();
  });

  it("renders critical timeline milestones 2026-Q3, 2027-Q1, 2027-Q4", async () => {
    render(<GrowthProjectionSection />);
    await waitFor(() => expect(screen.getByText("2026-Q3")).toBeInTheDocument(), {
      timeout: 3000,
    });
    expect(screen.getByText("2027-Q1")).toBeInTheDocument();
    expect(screen.getByText("2027-Q4")).toBeInTheDocument();
  });

  it("renders cost of delay card with Rp 18,5jt", async () => {
    render(<GrowthProjectionSection />);
    await waitFor(
      () => expect(screen.getByTestId("cost-of-delay-card")).toBeInTheDocument(),
      { timeout: 3000 },
    );
    expect(screen.getByText("Rp 18,5jt")).toBeInTheDocument();
  });

  it("renders sinyal pendukung section with Tol Medan-Berastagi signal", async () => {
    render(<GrowthProjectionSection />);
    await waitFor(
      () => expect(screen.getByText("Sinyal Pendukung")).toBeInTheDocument(),
      { timeout: 3000 },
    );
    // "Tol Medan-Berastagi" appears in both signal bullets and timeline milestones
    expect(screen.getAllByText(/Tol Medan-Berastagi/i).length).toBeGreaterThan(0);
  });
});

describe("GrowthProjectionSection — error state (not found)", () => {
  it("shows not-found message for unknown wilayah", async () => {
    useActiveProfileStore.setState({
      availableProfiles: [{ ...berastagi, wilayah_id: 9999999 }],
      activeProfile: { ...berastagi, wilayah_id: 9999999 },
      hydrationStatus: "ready",
      error: null,
    });
    render(<GrowthProjectionSection />);
    await waitFor(
      () => expect(screen.getByText("Data proyeksi belum tersedia")).toBeInTheDocument(),
      { timeout: 3000 },
    );
  });
});
