import { beforeEach, describe, expect, it } from "vitest";
import { ASSESSMENT_SESSION_KEY, useAssessmentStore } from "../assessment";

describe("useAssessmentStore session persistence", () => {
  beforeEach(() => {
    sessionStorage.clear();
    useAssessmentStore.setState({
      currentSektor: "agribisnis",
      _hasHydrated: true,
      customWeightsEnabled: false,
      customWeights: null,
      gapSortColumn: "priority_score",
      gapSortDirection: "desc",
      expandedGapRows: new Set(),
    });
  });

  it("persists only currentSektor to sessionStorage", () => {
    useAssessmentStore.getState().setCurrentSektor("hospitality");
    useAssessmentStore.getState().enableCustomWeights();

    const persisted = JSON.parse(sessionStorage.getItem(ASSESSMENT_SESSION_KEY) ?? "{}");
    expect(persisted.state).toEqual({ currentSektor: "hospitality" });
  });

  it("resets custom weights on sektor switch", () => {
    useAssessmentStore.getState().enableCustomWeights();
    expect(useAssessmentStore.getState().customWeightsEnabled).toBe(true);

    useAssessmentStore.getState().setCurrentSektor("pariwisata");

    expect(useAssessmentStore.getState().currentSektor).toBe("pariwisata");
    expect(useAssessmentStore.getState().customWeightsEnabled).toBe(false);
    expect(useAssessmentStore.getState().customWeights).toBeNull();
  });
});
