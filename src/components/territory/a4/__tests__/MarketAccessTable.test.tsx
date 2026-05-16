import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MarketAccessTable } from "../MarketAccessTable";
import type { MarketAccessDestinationWithRoute } from "@/lib/types/territory";

const berastagiDestinations: MarketAccessDestinationWithRoute[] = [
  {
    tipe: "pelabuhan_export",
    nama: "Belawan, Medan",
    lat: 3.7841,
    lng: 98.6888,
    jarak_km: 84,
    waktu_menit: 135,
    kondisi_jalan: "tol_parsial",
    kondisi_jalan_label: "Tol parsial",
    cost_per_ton_rp: 800000,
    route_geojson_path: "",
  },
  {
    tipe: "bandara_internasional",
    nama: "Kualanamu",
    lat: 3.6422,
    lng: 98.8853,
    jarak_km: 96,
    waktu_menit: 150,
    kondisi_jalan: "tol_parsial",
    kondisi_jalan_label: "Tol parsial",
    cost_per_ton_rp: 950000,
    route_geojson_path: "",
  },
  {
    tipe: "pasar_induk",
    nama: "Pusat Pasar Medan",
    lat: 3.5896,
    lng: 98.6815,
    jarak_km: 78,
    waktu_menit: 125,
    kondisi_jalan: "aspal_berbukit",
    kondisi_jalan_label: "Aspal, berbukit",
    cost_per_ton_rp: 600000,
    route_geojson_path: "",
  },
  {
    tipe: "ibukota_provinsi",
    nama: "Medan",
    lat: 3.5952,
    lng: 98.6722,
    jarak_km: 78,
    waktu_menit: 125,
    kondisi_jalan: "aspal_berbukit",
    kondisi_jalan_label: "Aspal, berbukit",
    cost_per_ton_rp: null,
    route_geojson_path: "",
  },
  {
    tipe: "jalan_nasional",
    nama: "Jln. Lintas Sumatera (junction Berastagi)",
    lat: 3.1968,
    lng: 98.5095,
    jarak_km: 0,
    waktu_menit: 0,
    kondisi_jalan: "aspal_baik",
    kondisi_jalan_label: "Aspal baik",
    cost_per_ton_rp: null,
    route_geojson_path: "",
  },
];

describe("MarketAccessTable — renders canonical Berastagi destinations", () => {
  it("renders all five destination names", () => {
    render(<MarketAccessTable destinations={berastagiDestinations} />);

    expect(screen.getByText("Belawan, Medan")).toBeInTheDocument();
    expect(screen.getByText("Kualanamu")).toBeInTheDocument();
    expect(screen.getByText("Pusat Pasar Medan")).toBeInTheDocument();
    expect(screen.getByText("Medan")).toBeInTheDocument();
    expect(screen.getByText("Jln. Lintas Sumatera (junction Berastagi)")).toBeInTheDocument();
  });

  it("formats distances correctly", () => {
    render(<MarketAccessTable destinations={berastagiDestinations} />);

    expect(screen.getByText("84 km")).toBeInTheDocument();
    expect(screen.getByText("96 km")).toBeInTheDocument();
    // Both Pusat Pasar Medan and Medan have 78 km
    expect(screen.getAllByText("78 km")).toHaveLength(2);
    expect(screen.getByText("0 km")).toBeInTheDocument();
  });

  it("formats travel times correctly", () => {
    render(<MarketAccessTable destinations={berastagiDestinations} />);

    expect(screen.getByText("2j 15m")).toBeInTheDocument(); // 135 min
    expect(screen.getByText("2j 30m")).toBeInTheDocument(); // 150 min
    // Both Pusat Pasar Medan and Medan have 125 min
    expect(screen.getAllByText("2j 5m")).toHaveLength(2);
  });

  it("formats IDR costs and null cost as dash", () => {
    render(<MarketAccessTable destinations={berastagiDestinations} />);

    expect(screen.getByText("Rp 800rb/ton")).toBeInTheDocument();
    expect(screen.getByText("Rp 950rb/ton")).toBeInTheDocument();
    expect(screen.getByText("Rp 600rb/ton")).toBeInTheDocument();
    const dashes = screen.getAllByText("-");
    expect(dashes.length).toBeGreaterThanOrEqual(2);
  });

  it("table renders with data-testid marker", () => {
    render(<MarketAccessTable destinations={berastagiDestinations} />);
    expect(screen.getByTestId("market-access-table")).toBeInTheDocument();
  });
});

describe("MarketAccessTable — sort by distance ASC", () => {
  it("clicking Jarak header once sorts rows ascending by distance (sortDescFirst=false)", async () => {
    const user = userEvent.setup();
    render(<MarketAccessTable destinations={berastagiDestinations} />);

    const jarakHeader = screen.getByRole("columnheader", { name: /jarak/i });
    await user.click(jarakHeader);

    const table = screen.getByTestId("market-access-table");
    const rows = within(table).getAllByRole("row").slice(1); // skip header

    // First row after ASC sort should be 0 km (jalan_nasional junction)
    expect(rows[0]?.textContent).toContain("0 km");
    expect(rows[0]?.textContent).toContain("Jln. Lintas Sumatera");
  });

  it("after one click (ASC), distance order is 0 → 78 → 78 → 84 → 96", async () => {
    const user = userEvent.setup();
    render(<MarketAccessTable destinations={berastagiDestinations} />);

    const jarakHeader = screen.getByRole("columnheader", { name: /jarak/i });
    await user.click(jarakHeader);

    const table = screen.getByTestId("market-access-table");
    const cells = within(table)
      .getAllByText(/^\d+ km$/)
      .map((el) => parseInt(el.textContent!.replace(" km", ""), 10));

    expect(cells).toEqual([0, 78, 78, 84, 96]);
  });

  it("after two clicks (DESC), distance order is 96 → 84 → 78 → 78 → 0", async () => {
    const user = userEvent.setup();
    render(<MarketAccessTable destinations={berastagiDestinations} />);

    const jarakHeader = screen.getByRole("columnheader", { name: /jarak/i });
    await user.click(jarakHeader);
    await user.click(jarakHeader);

    const table = screen.getByTestId("market-access-table");
    const cells = within(table)
      .getAllByText(/^\d+ km$/)
      .map((el) => parseInt(el.textContent!.replace(" km", ""), 10));

    expect(cells).toEqual([96, 84, 78, 78, 0]);
  });
});

describe("MarketAccessTable — sort by cost nulls last", () => {
  it("sort by Cost/ton ASC puts rows with null cost at the end", async () => {
    const user = userEvent.setup();
    render(<MarketAccessTable destinations={berastagiDestinations} />);

    const costHeader = screen.getByRole("columnheader", { name: /cost/i });
    await user.click(costHeader);

    const table = screen.getByTestId("market-access-table");
    const rows = within(table).getAllByRole("row").slice(1);

    // First row after ASC: cheapest non-null = Rp 600rb/ton (Pusat Pasar Medan)
    expect(rows[0]?.textContent).toContain("Rp 600rb/ton");
    // Last two rows: null cost (displayed as "-")
    expect(rows[3]?.textContent).toContain("-");
    expect(rows[4]?.textContent).toContain("-");
  });
});

describe("MarketAccessTable — row expansion", () => {
  it("clicking a row expands it to show road-condition detail text", async () => {
    const user = userEvent.setup();
    render(<MarketAccessTable destinations={berastagiDestinations} />);

    const belawanRow = screen.getByText("Belawan, Medan").closest("tr");
    expect(belawanRow).not.toBeNull();
    await user.click(belawanRow!);

    // Expanded row shows the detailed road condition note for tol_parsial
    expect(screen.getByText(/Sebagian rute melewati tol/)).toBeInTheDocument();
  });

  it("expanded row shows the estimated logistics cost", async () => {
    const user = userEvent.setup();
    render(<MarketAccessTable destinations={berastagiDestinations} />);

    const belawanRow = screen.getByText("Belawan, Medan").closest("tr");
    await user.click(belawanRow!);

    // After expansion, should show cost in the expanded detail
    const rows = screen.getAllByText("Rp 800rb/ton");
    expect(rows.length).toBeGreaterThanOrEqual(1);
  });

  it("clicking an expanded row collapses it", async () => {
    const user = userEvent.setup();
    render(<MarketAccessTable destinations={berastagiDestinations} />);

    const belawanRow = screen.getByText("Belawan, Medan").closest("tr");
    await user.click(belawanRow!);
    await user.click(belawanRow!);

    expect(screen.queryByText(/Sebagian rute melewati tol/)).not.toBeInTheDocument();
  });
});
