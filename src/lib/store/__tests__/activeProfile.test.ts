import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useActiveProfileStore } from "../activeProfile";
import { useActiveProfileActions } from "../useActiveProfile";
import { buildSlugMap, slugify } from "../profileSlug";
import type { WilayahProfile } from "../profileSlug";

const MOCK_PROFILES: WilayahProfile[] = [
  {
    wilayah_id: 3204170,
    nama: "Kec. Ciwidey",
    kabupaten: "Kab. Bandung",
    provinsi: "Jawa Barat",
    lat: -7.08,
    lng: 107.42,
    profil_kode: "AGRO_DOMINANT",
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
    lat: -8.69,
    lng: 115.17,
    profil_kode: "HOSPITALITY_DOMINANT",
    marker_color: "#B45309",
    marker_radius: 14,
    is_default: false,
    karakter_singkat: "Destinasi wisata premium",
    elevasi_meter: 50,
  },
  {
    wilayah_id: 1206090,
    nama: "Kec. Berastagi",
    kabupaten: "Kab. Karo",
    provinsi: "Sumatera Utara",
    lat: 3.19,
    lng: 98.52,
    profil_kode: "AGRO_HOSP",
    marker_color: "#1B4332",
    marker_radius: 14,
    is_default: false,
    karakter_singkat: "Pertanian + wisata pegunungan",
    elevasi_meter: 1320,
  },
];

function resetStore() {
  useActiveProfileStore.setState({
    availableProfiles: [],
    activeProfile: null,
    hydrationStatus: "pending",
    error: null,
  });
}

function initStore(profiles = MOCK_PROFILES) {
  useActiveProfileStore.getState()._initialize(profiles);
}

describe("activeProfile store", () => {
  beforeEach(() => {
    localStorage.clear();
    resetStore();
  });

  it("setActiveProfile resolves berastagi by slug", () => {
    initStore();
    act(() => useActiveProfileStore.getState().setActiveProfile("berastagi"));
    expect(useActiveProfileStore.getState().activeProfile?.wilayah_id).toBe(1206090);
  });

  it("setActiveProfile resolves by profil_kode", () => {
    initStore();
    act(() => useActiveProfileStore.getState().setActiveProfile("HOSPITALITY_DOMINANT"));
    expect(useActiveProfileStore.getState().activeProfile?.wilayah_id).toBe(5103060);
  });

  it("setActiveProfile warns and does nothing for unknown slug", () => {
    initStore();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    act(() => useActiveProfileStore.getState().setActiveProfile("unknown-slug"));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("Unknown slug/kode"));
    expect(useActiveProfileStore.getState().activeProfile).toBeNull();
    warn.mockRestore();
  });

  it("setActiveProfile is idempotent — calling with same profile does not mutate state reference", () => {
    initStore();
    act(() => useActiveProfileStore.getState().setActiveProfile("ciwidey"));
    const first = useActiveProfileStore.getState().activeProfile;
    act(() => useActiveProfileStore.getState().setActiveProfile("ciwidey"));
    expect(useActiveProfileStore.getState().activeProfile).toBe(first);
  });

  it("buildSlugMap covers all three profiles", () => {
    const map = buildSlugMap(MOCK_PROFILES);
    expect(map.get("ciwidey")?.wilayah_id).toBe(3204170);
    expect(map.get("seminyak")?.wilayah_id).toBe(5103060);
    expect(map.get("berastagi")?.wilayah_id).toBe(1206090);
  });

  it("is_default profile is Ciwidey", () => {
    const defaultProfile = MOCK_PROFILES.find((p) => p.is_default);
    expect(defaultProfile?.profil_kode).toBe("AGRO_DOMINANT");
    expect(slugify(defaultProfile!.nama)).toBe("ciwidey");
  });
});

describe("activeProfile hook", () => {
  beforeEach(() => resetStore());

  it("returns null before initialization", () => {
    const { result } = renderHook(() => useActiveProfileStore((s) => s.activeProfile));
    expect(result.current).toBeNull();
  });

  it("returns the active profile after setActiveProfile", () => {
    initStore();
    const { result } = renderHook(() => useActiveProfileStore((s) => s.activeProfile));
    act(() => useActiveProfileStore.getState().setActiveProfile("seminyak"));
    expect(result.current?.profil_kode).toBe("HOSPITALITY_DOMINANT");
  });

  it("keeps action selector stable across unrelated store updates", () => {
    const { result } = renderHook(() => useActiveProfileActions());
    const firstActions = result.current;

    act(() => useActiveProfileStore.getState()._setHydrationStatus("ready"));

    expect(result.current).toBe(firstActions);
  });
});
