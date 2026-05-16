import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScoreBadge } from "../ScoreBadge";

function getClasses() {
  return screen.getByTestId("score-badge").querySelector("div")?.className ?? "";
}

describe("ScoreBadge verdict color thresholds", () => {
  it("value=70 (boundary) renders green", () => {
    render(<ScoreBadge value={70} />);
    expect(getClasses()).toContain("talis-green-700");
  });

  it("value=40 (boundary) renders amber", () => {
    render(<ScoreBadge value={40} />);
    expect(getClasses()).toContain("talis-amber");
  });

  it("value=39 renders red", () => {
    render(<ScoreBadge value={39} />);
    expect(getClasses()).toContain("talis-red-700");
  });

  it("value=85 renders green", () => {
    render(<ScoreBadge value={85} />);
    expect(getClasses()).toContain("talis-green-700");
  });

  it("value=0 renders red", () => {
    render(<ScoreBadge value={0} />);
    expect(getClasses()).toContain("talis-red-700");
  });
});
