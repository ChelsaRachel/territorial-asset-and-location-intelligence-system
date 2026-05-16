import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ZoningCompliancePanel } from "../ZoningCompliancePanel";
import type { TerritoryZoning } from "@/lib/types/territory";

const baseZoning: TerritoryZoning = {
  wilayah_id: 1206090,
  zoning_compliance_score: 84,
  regulatory_flag: "BEBAS_INVESTASI",
  flag_color: "green",
  flag_detail:
    "Seluruh rencana peruntukan sesuai dengan koridor RTRW Kabupaten Karo. Tidak ada zona moratorium aktif.",
  luas_sesuai_ha: 2486,
  luas_konflik_ha: 488,
  luas_kawasan_lindung_ha: 526,
  luas_breakdown: { sesuai_ha: 2486, konflik_ha: 488, kawasan_lindung_ha: 526 },
  rdtr_available: false,
  implications: {
    investor: ["Aman untuk akuisisi tanah setelah due-diligence lokal.", "Tidak ada hambatan regulasi yang bersifat blokir."],
    pejabat: ["Perlu pembaruan koordinasi ATR/BPN untuk 488 ha zona konflik.", "RDTR digital belum tersedia — gunakan proxy RTRW provinsi."],
  },
  map_layers: [],
  geojson_overlay_path: "src/mocks/maps/zoning/1206090.geojson",
  last_computed_at: "2026-05-04T20:00:00Z",
};

function withFlag(
  flag: TerritoryZoning["regulatory_flag"],
  color: TerritoryZoning["flag_color"],
  detail: string,
): TerritoryZoning {
  return { ...baseZoning, regulatory_flag: flag, flag_color: color, flag_detail: detail };
}

describe("ZoningCompliancePanel — Berastagi canonical values", () => {
  it("renders compliance score 84", () => {
    render(<ZoningCompliancePanel zoning={baseZoning} />);
    expect(screen.getByText("84")).toBeInTheDocument();
  });

  it("renders BEBAS_INVESTASI flag label as green StatusPill", () => {
    render(<ZoningCompliancePanel zoning={baseZoning} />);
    const pill = screen.getByTestId("status-pill");
    expect(pill).toHaveTextContent("Bebas Investasi");
    expect(pill.className).toContain("talis-green-700");
  });

  it("renders conflict area 488 ha", () => {
    render(<ZoningCompliancePanel zoning={baseZoning} />);
    expect(screen.getByText(/488/)).toBeInTheDocument();
  });

  it("shows RDTR proxy notice when rdtr_available is false", () => {
    render(<ZoningCompliancePanel zoning={baseZoning} />);
    expect(screen.getByText(/RDTR/i)).toBeInTheDocument();
  });
});

describe("ZoningCompliancePanel — regulatory flag color integration", () => {
  it("BEBAS_INVESTASI renders green StatusPill", () => {
    render(<ZoningCompliancePanel zoning={baseZoning} />);
    const pill = screen.getByTestId("status-pill");
    expect(pill.className).toContain("talis-green-700");
  });

  it("KONFLIK_REGULASI renders amber StatusPill", () => {
    render(
      <ZoningCompliancePanel
        zoning={withFlag(
          "KONFLIK_REGULASI",
          "amber",
          "Terdapat konflik kepentingan lahan di zona tengah yang memerlukan klarifikasi.",
        )}
      />,
    );
    const pill = screen.getByTestId("status-pill");
    expect(pill).toHaveTextContent("Konflik Regulasi");
    expect(pill.className).toContain("talis-amber");
  });

  it("KAWASAN_LINDUNG renders red StatusPill with red-flag warning copy", () => {
    render(
      <ZoningCompliancePanel
        zoning={withFlag(
          "KAWASAN_LINDUNG",
          "red",
          "Sebagian lahan masuk kawasan lindung berdasarkan SK Menteri LHK.",
        )}
      />,
    );
    const pill = screen.getByTestId("status-pill");
    expect(pill).toHaveTextContent("Kawasan Lindung");
    expect(pill.className).toContain("talis-red-700");
    expect(screen.getByText(/klarifikasi resmi/i)).toBeInTheDocument();
  });

  it("MORATORIUM renders red StatusPill with moratorium warning copy", () => {
    render(
      <ZoningCompliancePanel
        zoning={withFlag(
          "MORATORIUM",
          "red",
          "Zona moratorium aktif sejak Q3 2025 — pengembangan villa dan resort ditangguhkan.",
        )}
      />,
    );
    const pill = screen.getByTestId("status-pill");
    expect(pill).toHaveTextContent("Moratorium");
    expect(pill.className).toContain("talis-red-700");
    expect(screen.getByText(/kepastian regulasi/i)).toBeInTheDocument();
  });
});
