import { describe, expect, it } from "vitest";

import { getShiftCoverage, getSuggestedVolunteers, hasSchedulingConflict } from "./mvp-data";

describe("scheduling loop helpers", () => {
  it("computes open slots and coverage percentage", () => {
    const coverage = getShiftCoverage("shift_food_sat_1");

    expect(coverage.positions).toBe(9);
    expect(coverage.assigned).toBe(6);
    expect(coverage.open).toBe(3);
    expect(coverage.percentage).toBe(67);
  });

  it("detects overlapping shift conflicts", () => {
    expect(hasSchedulingConflict("person_david", "shift_food_sat_1")).toBe(true);
    expect(hasSchedulingConflict("person_jennifer", "shift_food_sat_1")).toBe(false);
  });

  it("ranks candidates by availability then conflict", () => {
    const suggested = getSuggestedVolunteers("org_ama", "shift_food_sat_1", "role_driver");

    expect(suggested[0].person.id).toBe("person_sarah");
    expect(suggested.at(-1)?.person.id).toBe("person_jennifer");
  });
});
