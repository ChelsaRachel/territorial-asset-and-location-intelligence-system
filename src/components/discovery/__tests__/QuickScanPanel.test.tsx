import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuickScanPanel } from "../QuickScanPanel";
import { useActiveProfileStore } from "@/lib/store/activeProfile";
import { useDiscoveryStore } from "@/lib/store/discovery";
import { useAssessmentStore } from "@/lib/store/assessment";

const sampleProfiles = [
  {
    wilayah_id: 3204170,
    nama: "Kec. Ciwidey",
    kabupaten: "Kab. Bandung",
    provinsi: "Jawa Barat",
    lat: -7.08,
    lng: 107.42,
    profil_kode: "AGRO_DOMINANT" as const,
    marker_color: "#2D6A4F",
    marker_radius: 14,
    is_default: true,
    karakter_singkat: "Dataran tinggi subur",
    elevasi_meter: 1200,
  },
  {
    wilayah_id: 5103060,
    nama: "Kel. Seminyak",
    kabupaten: "Kab. Badung",
    provinsi: "Bali",
    lat: -8.6905,
    lng: 115.1729,
    profil_kode: "HOSPITALITY_DOMINANT" as const,
    marker_color: "#B45309",
    marker_radius: 14,
    is_default: false,
    karakter_singkat: "Destinasi wisata premium internasional",
    elevasi_meter: 50,
  },
  {
    wilayah_id: 1206090,
    nama: "Kec. Berastagi",
    kabupaten: "Kab. Karo",
    provinsi: "Sumatera Utara",
    lat: 3.1968,
    lng: 98.5095,
    profil_kode: "AGRO_HOSP" as const,
    marker_color: "#1E40AF",
    marker_radius: 14,
    is_default: false,
    karakter_singkat: "Dataran tinggi vulkanik subur",
    elevasi_meter: 1300,
  },
];

function openBerastagiPanel() {
  useDiscoveryStore.setState({
    searchMode: "location",
    mode1Query: "",
    mode2Filters: { sektor: [] },
    mode3Intent: null,
    searchResults: [],
    searchResultMode: null,
    searchStatus: "idle",
    searchError: null,
    panelOpen: true,
    panelWilayahId: 1206090,
    panelTab: "AGRO_HOSP",
  });
}

describe("QuickScanPanel", () => {
  beforeEach(() => {
    useActiveProfileStore.setState({
      availableProfiles: sampleProfiles,
      activeProfile: sampleProfiles[0],
      hydrationStatus: "ready",
      error: null,
    });
    useAssessmentStore.setState({
      currentSektor: "agribisnis",
      _hasHydrated: true,
      customWeightsEnabled: false,
      customWeights: null,
      gapSortColumn: "priority_score",
      gapSortDirection: "desc",
      expandedGapRows: new Set(),
    });
    openBerastagiPanel();
  });

  it("renders all non-CTA Quick Scan sections for Berastagi", async () => {
    render(<QuickScanPanel />);

    expect(await screen.findByText("Kec. Berastagi")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Agro+Hosp" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByText("Kab. Karo · Sumatera Utara")).toBeInTheDocument();
    expect(screen.getByText("Sektor aktif")).toBeInTheDocument();
    expect(screen.getByText("agribisnis")).toBeInTheDocument();
    expect(screen.getByText("Layak")).toBeInTheDocument();
    expect(screen.getByText("Peluang Konkret")).toBeInTheDocument();
    expect(screen.getByText("Sinyal Kunci")).toBeInTheDocument();
    expect(screen.getByText("Harga & Window")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Lihat Detail Page 2" })).not.toBeInTheDocument();
    expect(screen.queryByText(/Page 2 tersedia/)).not.toBeInTheDocument();
    expect(screen.getAllByTestId("data-timestamp").length).toBeGreaterThanOrEqual(5);
  });

  it("closes the panel from the close button", async () => {
    const user = userEvent.setup();
    render(<QuickScanPanel />);

    await screen.findByText("Kec. Berastagi");
    await user.click(screen.getByRole("button", { name: "Tutup Quick Scan panel" }));

    await waitFor(() => {
      expect(useDiscoveryStore.getState().panelOpen).toBe(false);
    });
  });

  it("panel tab switching does not call setActiveProfile", async () => {
    const user = userEvent.setup();
    const setActiveProfile = vi.spyOn(useActiveProfileStore.getState(), "setActiveProfile");
    render(<QuickScanPanel />);

    await screen.findByText("Kec. Berastagi");
    await user.click(screen.getByRole("tab", { name: "Agro" }));

    expect(setActiveProfile).not.toHaveBeenCalled();
    expect(useDiscoveryStore.getState().panelTab).toBe("AGRO_DOMINANT");
  });
});
