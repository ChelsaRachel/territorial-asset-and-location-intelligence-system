import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { LandValueSection } from "./LandValueSection";
import { useActiveProfileStore } from "@/lib/store/activeProfile";
import type { WilayahProfile } from "@/lib/store/profileSlug";

vi.mock("../components/LandValueAreaChart", () => ({
  LandValueAreaChart: () => <div data-testid="mock-land-area-chart" />,
}));
vi.mock("../components/HargaNjopBarChart", () => ({
  HargaNjopBarChart: () => <div data-testid="mock-harga-njop-chart" />,
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

describe("LandValueSection — loading state", () => {
  beforeEach(() => {
    useActiveProfileStore.setState({
      availableProfiles: [],
      activeProfile: null,
      hydrationStatus: "pending",
      error: null,
    });
  });

  it("shows loading skeletons while hydration is pending", () => {
    render(<LandValueSection />);
    expect(screen.getAllByTestId("loading-skeleton").length).toBeGreaterThan(0);
  });
});

describe("LandValueSection — empty state", () => {
  beforeEach(() => {
    useActiveProfileStore.setState({
      availableProfiles: [],
      activeProfile: null,
      hydrationStatus: "ready",
      error: null,
    });
  });

  it("shows empty state when no active profile", () => {
    render(<LandValueSection />);
    expect(screen.getByText("Pilih wilayah aktif")).toBeInTheDocument();
  });
});

describe("LandValueSection — success with Berastagi", () => {
  beforeEach(setupBerastagi);

  it("renders section title", () => {
    render(<LandValueSection />);
    expect(screen.getByText("Dinamika Nilai Lahan")).toBeInTheDocument();
  });

  it("renders canonical median price Rp 420rb/m²", async () => {
    render(<LandValueSection />);
    await waitFor(() => expect(screen.getByText("Rp 420rb/m²")).toBeInTheDocument(), {
      timeout: 3000,
    });
  });

  it("renders appreciation +15.4%", async () => {
    render(<LandValueSection />);
    await waitFor(() => expect(screen.getByText("+15.4%")).toBeInTheDocument(), {
      timeout: 3000,
    });
  });

  it("renders speculation ratio 1.4x", async () => {
    render(<LandValueSection />);
    await waitFor(() => expect(screen.getByText("1.4x")).toBeInTheDocument(), {
      timeout: 3000,
    });
  });

  it("renders speculation status badge 'Sehat'", async () => {
    render(<LandValueSection />);
    await waitFor(() => expect(screen.getByText("Sehat")).toBeInTheDocument(), {
      timeout: 3000,
    });
  });

  it("renders timing recommendation", async () => {
    render(<LandValueSection />);
    await waitFor(() =>
      expect(screen.getByText(/Entry sekarang optimal/i)).toBeInTheDocument(),
      { timeout: 3000 },
    );
  });

  it("renders proyeksi 6 Bulan, 12 Bulan, 36 Bulan", async () => {
    render(<LandValueSection />);
    await waitFor(() => expect(screen.getByText("6 Bulan")).toBeInTheDocument(), {
      timeout: 3000,
    });
    expect(screen.getByText("12 Bulan")).toBeInTheDocument();
    expect(screen.getByText("36 Bulan")).toBeInTheDocument();
  });

  it("renders chart stubs", async () => {
    render(<LandValueSection />);
    await waitFor(() =>
      expect(screen.getByTestId("mock-land-area-chart")).toBeInTheDocument(),
      { timeout: 3000 },
    );
    expect(screen.getByTestId("mock-harga-njop-chart")).toBeInTheDocument();
  });
});

describe("LandValueSection — error state (not found)", () => {
  it("shows not-found message for unknown wilayah", async () => {
    useActiveProfileStore.setState({
      availableProfiles: [{ ...berastagi, wilayah_id: 9999999 }],
      activeProfile: { ...berastagi, wilayah_id: 9999999 },
      hydrationStatus: "ready",
      error: null,
    });
    render(<LandValueSection />);
    await waitFor(
      () => expect(screen.getByText("Data nilai lahan belum tersedia")).toBeInTheDocument(),
      { timeout: 3000 },
    );
  });
});
