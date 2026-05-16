import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { AppSidebar } from "../AppSidebar";
import { useActiveProfileStore } from "@/lib/store/activeProfile";
import type { WilayahProfile } from "@/lib/store/profileSlug";

const navigationState = vi.hoisted(() => ({
  pathname: "/",
  search: "",
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: () => undefined, replace: () => undefined, prefetch: () => undefined }),
  usePathname: () => navigationState.pathname,
  useSearchParams: () => new URLSearchParams(navigationState.search),
}));

const sampleProfiles: WilayahProfile[] = [
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
  },
];

const navItems = [
  ["Command Center", "/"],
  ["Territory Profile", "/profile"],
  ["Territory Intelligence", "/intelligence"],
  ["Opportunity & Risk", "/assessment"],
  ["Investment Decision", "/decision"],
  ["Monitoring & Governance", "/monitoring"],
] as const;

function resetActiveProfile(activeProfile: WilayahProfile | null = null) {
  useActiveProfileStore.setState({
    availableProfiles: sampleProfiles,
    activeProfile,
    hydrationStatus: activeProfile ? "ready" : "pending",
    error: null,
  });
}

describe("AppSidebar", () => {
  beforeEach(() => {
    navigationState.pathname = "/";
    navigationState.search = "";
    resetActiveProfile();
  });

  it("renders the six approved nav links with accessible names", () => {
    render(<AppSidebar />);

    const nav = screen.getByRole("navigation", { name: "Primary pages" });
    for (const [label, href] of navItems) {
      expect(within(nav).getByRole("link", { name: label })).toHaveAttribute("href", href);
    }
  });

  it("marks only root active on / and supports nested active matching for non-root routes", () => {
    const { rerender } = render(<AppSidebar />);

    expect(screen.getByRole("link", { name: "Command Center" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("link", { name: "Territory Profile" })).not.toHaveAttribute(
      "aria-current"
    );

    navigationState.pathname = "/assessment/gap-analysis";
    rerender(<AppSidebar />);

    expect(screen.getByRole("link", { name: "Command Center" })).not.toHaveAttribute(
      "aria-current"
    );
    expect(screen.getByRole("link", { name: "Opportunity & Risk" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("preserves the current profile query while active profile is still hydrating", () => {
    navigationState.search = "profile=seminyak";
    resetActiveProfile(null);

    render(<AppSidebar />);

    expect(screen.getByRole("link", { name: "Territory Profile" })).toHaveAttribute(
      "href",
      "/profile?profile=seminyak"
    );
    expect(screen.getByRole("link", { name: "Command Center" })).toHaveAttribute(
      "href",
      "/?profile=seminyak"
    );
  });

  it("prefers the active profile slug over the current profile query", () => {
    navigationState.search = "profile=ciwidey";
    resetActiveProfile(sampleProfiles[1]!);

    render(<AppSidebar />);

    expect(screen.getByRole("link", { name: "Territory Profile" })).toHaveAttribute(
      "href",
      "/profile?profile=berastagi"
    );
    expect(screen.getByRole("link", { name: "Monitoring & Governance" })).toHaveAttribute(
      "href",
      "/monitoring?profile=berastagi"
    );
  });
});
