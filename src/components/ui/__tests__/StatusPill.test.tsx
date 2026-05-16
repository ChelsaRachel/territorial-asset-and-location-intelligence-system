import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusPill } from "../StatusPill";

function getClasses(testId = "status-pill") {
  return screen.getByTestId(testId).className;
}

describe("StatusPill regulatory", () => {
  it("BEBAS_INVESTASI has green classes", () => {
    render(<StatusPill variant="regulatory" value="BEBAS_INVESTASI" />);
    expect(getClasses()).toContain("talis-green-700");
  });
  it("KONFLIK_REGULASI has amber classes", () => {
    render(<StatusPill variant="regulatory" value="KONFLIK_REGULASI" />);
    expect(getClasses()).toContain("talis-amber");
  });
  it("KAWASAN_LINDUNG has red classes", () => {
    render(<StatusPill variant="regulatory" value="KAWASAN_LINDUNG" />);
    expect(getClasses()).toContain("talis-red-700");
  });
  it("MORATORIUM has red classes", () => {
    render(<StatusPill variant="regulatory" value="MORATORIUM" />);
    expect(getClasses()).toContain("talis-red-700");
  });
});

describe("StatusPill verdict", () => {
  it("LAYAK has green classes", () => {
    render(<StatusPill variant="verdict" value="LAYAK" />);
    expect(getClasses()).toContain("talis-green-700");
  });
  it("TIDAK_LAYAK has red classes", () => {
    render(<StatusPill variant="verdict" value="TIDAK_LAYAK" />);
    expect(getClasses()).toContain("talis-red-700");
  });
});

describe("StatusPill urgency", () => {
  it("SEGERA has red classes", () => {
    render(<StatusPill variant="urgency" value="SEGERA" />);
    expect(getClasses()).toContain("talis-red-700");
  });
  it("JANGKA_PANJANG has stone classes", () => {
    render(<StatusPill variant="urgency" value="JANGKA_PANJANG" />);
    expect(getClasses()).toContain("talis-stone-700");
  });
});

describe("StatusPill severity", () => {
  it("KRITIS has red classes", () => {
    render(<StatusPill variant="severity" value="KRITIS" />);
    expect(getClasses()).toContain("talis-red-700");
  });
});

describe("StatusPill speculation", () => {
  it("sehat has green classes", () => {
    render(<StatusPill variant="speculation" value="sehat" />);
    expect(getClasses()).toContain("talis-green-700");
  });
  it("spekulatif has red classes", () => {
    render(<StatusPill variant="speculation" value="spekulatif" />);
    expect(getClasses()).toContain("talis-red-700");
  });
});

describe("StatusPill pipeline", () => {
  it("operasional has green classes", () => {
    render(<StatusPill variant="pipeline" value="operasional" />);
    expect(getClasses()).toContain("talis-green-700");
  });
  it("tertahan has red classes", () => {
    render(<StatusPill variant="pipeline" value="tertahan" />);
    expect(getClasses()).toContain("talis-red-700");
  });
});
