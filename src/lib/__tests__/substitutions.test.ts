import { describe, expect, it } from "vitest";
import { ALL_EXERCISES } from "../../data/program";
import { SUBSTITUTIONS, convertE1RM, substitutionsFor } from "../substitutions";

describe("SUBSTITUTIONS", () => {
  it("keys every list to a real exercise id", () => {
    const validIds = new Set(ALL_EXERCISES.map((e) => e.id));
    for (const exId of Object.keys(SUBSTITUTIONS)) {
      expect(validIds.has(exId), `"${exId}" is not a real exercise id`).toBe(true);
    }
  });

  it("covers every exercise in the program", () => {
    for (const exercise of ALL_EXERCISES) {
      expect(SUBSTITUTIONS[exercise.id], `no substitutions for "${exercise.id}"`).toBeDefined();
    }
  });
});

describe("convertE1RM", () => {
  it("scales the parent e1RM by the substitute's loadFactor", () => {
    const sub = substitutionsFor("back_squat").find((s) => s.name === "Front Squat")!;
    expect(convertE1RM(335, sub)).toBeCloseTo(335 * 0.85);
  });

  it("returns null when the parent has no e1RM yet", () => {
    const sub = substitutionsFor("back_squat")[0]!;
    expect(convertE1RM(null, sub)).toBeNull();
  });

  it("returns null when the substitute isn't load-comparable", () => {
    const sub = substitutionsFor("hang_clean").find((s) => s.name === "Trap Bar Jump")!;
    expect(convertE1RM(200, sub)).toBeNull();
  });
});

describe("substitutionsFor", () => {
  it("returns an empty list for an unknown exercise", () => {
    expect(substitutionsFor("not_a_real_id")).toEqual([]);
  });

  it("filters by tag", () => {
    const throwerFriendly = substitutionsFor("bench", "overhead-friendly");
    expect(throwerFriendly.length).toBeGreaterThan(0);
    for (const sub of throwerFriendly) {
      expect(sub.tags).toContain("overhead-friendly");
    }
  });
});
