import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { CommandCenterSearch } from "../CommandCenterSearch";
import { useDiscoveryStore } from "@/lib/store/discovery";

function resetDiscovery() {
  useDiscoveryStore.setState({
    searchMode: "criteria",
    mode1Query: "",
    mode2Filters: { sektor: [] },
    mode3Intent: null,
    searchResults: [],
    searchResultMode: null,
    searchStatus: "idle",
    searchError: null,
    panelOpen: false,
    panelWilayahId: null,
    panelTab: null,
  });
}

describe("CommandCenterSearch states", () => {
  beforeEach(() => resetDiscovery());

  it("renders the canonical criteria empty copy", () => {
    useDiscoveryStore.setState({
      searchMode: "criteria",
      searchResultMode: "criteria",
      searchStatus: "empty",
      searchResults: [],
    });

    render(<CommandCenterSearch onSelectLocation={() => undefined} />);

    expect(screen.getByLabelText("Command Center search")).toBeInTheDocument();
    expect(screen.getByText("Sektor")).toBeInTheDocument();
    expect(
      screen.getByText("Tidak ada wilayah memenuhi kriteria. Longgarkan filter atau coba mode lain.")
    ).toBeInTheDocument();
  });

  it("renders a retryable error state for opportunity search", () => {
    useDiscoveryStore.setState({
      searchMode: "opportunity",
      searchResultMode: "opportunity",
      searchStatus: "error",
      searchError: "Simulated adapter failure",
      searchResults: [],
    });

    render(<CommandCenterSearch onSelectLocation={() => undefined} />);

    expect(screen.getByLabelText("Command Center search")).toBeInTheDocument();
    expect(screen.getByText("Sektor target")).toBeInTheDocument();
    expect(screen.getByTestId("error-state")).toBeInTheDocument();
    expect(screen.getByText("Pencarian gagal")).toBeInTheDocument();
    expect(screen.getByText("Simulated adapter failure")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Coba lagi" })).toBeInTheDocument();
  });

  it("keeps the location search in the top-right command surface", () => {
    useDiscoveryStore.setState({ searchMode: "location" });

    render(<CommandCenterSearch onSelectLocation={() => undefined} />);

    expect(screen.getByLabelText("Command Center search")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Cari wilayah...")).toBeInTheDocument();
    expect(screen.queryByText("Sektor")).not.toBeInTheDocument();
    expect(screen.queryByText("Sektor target")).not.toBeInTheDocument();
  });

  it("does not render the old idle helper copy for filter modes", () => {
    useDiscoveryStore.setState({
      searchMode: "criteria",
      searchStatus: "idle",
      searchResultMode: null,
    });

    render(<CommandCenterSearch onSelectLocation={() => undefined} />);

    expect(screen.getByText("Sektor")).toBeInTheDocument();
    expect(
      screen.queryByText("Atur filter lalu klik Apply untuk melihat wilayah prioritas.")
    ).not.toBeInTheDocument();
  });
});
