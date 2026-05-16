import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StyleguidePage from "../page";

describe("StyleguidePage snapshot", () => {
  it("renders all ten primitive sections", () => {
    const { container } = render(<StyleguidePage />);

    const sections = container.querySelectorAll("[data-testid='section-info']");
    expect(sections.length).toBeGreaterThanOrEqual(10);
  });

  it("renders score badges", () => {
    render(<StyleguidePage />);
    const badges = screen.getAllByTestId("score-badge");
    expect(badges.length).toBeGreaterThan(3);
  });

  it("renders status pills", () => {
    render(<StyleguidePage />);
    const pills = screen.getAllByTestId("status-pill");
    expect(pills.length).toBeGreaterThanOrEqual(20);
  });

  it("renders loading skeletons", () => {
    render(<StyleguidePage />);
    const skeletons = screen.getAllByTestId("loading-skeleton");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders empty states", () => {
    render(<StyleguidePage />);
    const empty = screen.getAllByTestId("empty-state");
    expect(empty.length).toBeGreaterThan(0);
  });

  it("renders error states", () => {
    render(<StyleguidePage />);
    const errors = screen.getAllByTestId("error-state");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("renders kpi cards", () => {
    render(<StyleguidePage />);
    const kpis = screen.getAllByTestId("kpi-card");
    expect(kpis.length).toBeGreaterThan(0);
  });

  it("matches structural snapshot", () => {
    const { container } = render(<StyleguidePage />);
    expect(container.querySelector("h1")?.textContent).toBe("TALIS Design System Primitives");
  });
});
