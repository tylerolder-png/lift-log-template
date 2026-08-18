import { describe, expect, it } from "vitest";
import { bestE1RM, epley, inverseEpley, roundToIncrement } from "../oneRepMax";

describe("epley", () => {
  it("returns a single rep unchanged", () => {
    // Extrapolating from a true 1RM inflates it (335 would become 346) and
    // would prescribe loads the lifter has never hit.
    expect(epley(335, 1)).toBe(335);
  });

  it("returns zero-rep sets unchanged rather than scaling them", () => {
    expect(epley(225, 0)).toBe(225);
  });

  it("scales with rep count", () => {
    expect(epley(255, 6)).toBeCloseTo(306, 1);
    expect(epley(185, 5)).toBeCloseTo(215.83, 1);
    expect(epley(115, 6)).toBeCloseTo(138, 1);
  });

  it("is monotonic in both weight and reps", () => {
    expect(epley(200, 5)).toBeGreaterThan(epley(195, 5));
    expect(epley(200, 6)).toBeGreaterThan(epley(200, 5));
  });
});

describe("inverseEpley", () => {
  it("round-trips with epley", () => {
    const e1rm = epley(225, 5);
    expect(inverseEpley(e1rm, 5)).toBeCloseTo(225, 6);
  });

  it("prescribes lighter loads for higher rep targets", () => {
    const e1rm = 300;
    expect(inverseEpley(e1rm, 10)).toBeLessThan(inverseEpley(e1rm, 5));
  });
});

describe("roundToIncrement", () => {
  it("rounds to the nearest plate jump", () => {
    expect(roundToIncrement(243.7, 5)).toBe(245);
    expect(roundToIncrement(242.1, 5)).toBe(240);
  });

  it("supports dumbbell half-steps", () => {
    expect(roundToIncrement(41.3, 2.5)).toBe(42.5);
  });
});

describe("bestE1RM", () => {
  it("returns null for an empty set list", () => {
    expect(bestE1RM([])).toBeNull();
  });

  it("picks the hardest set, not the heaviest", () => {
    // 275 x 3 (302.5) beats 335 x 1 only if the single is extrapolated.
    // Guarding the single keeps 335 on top, which is the true max.
    const sets = [
      { weight: 275, reps: 3 },
      { weight: 335, reps: 1 },
    ];
    expect(bestE1RM(sets)).toBe(335);
  });
});
