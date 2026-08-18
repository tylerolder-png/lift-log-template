import { describe, expect, it } from "vitest";
import { detectPlateau, isDeloadWeek, prescribe, restSeconds, weekMultiplier, weekOfBlock } from "../progression";
import { findExercise } from "../../data/program";
import { epley } from "../oneRepMax";
import type { Exercise, HistoryPoint } from "../types";

const BODYWEIGHT = 185;

function ex(id: string): Exercise {
  const found = findExercise(id);
  if (!found) throw new Error(`unknown exercise: ${id}`);
  return found;
}

describe("weekOfBlock", () => {
  it("starts at week 1 on the block start date", () => {
    expect(weekOfBlock("2026-08-10", new Date("2026-08-10T12:00:00"))).toBe(1);
  });

  it("advances one week at a time", () => {
    expect(weekOfBlock("2026-08-10", new Date("2026-08-18T12:00:00"))).toBe(2);
    expect(weekOfBlock("2026-08-10", new Date("2026-08-25T12:00:00"))).toBe(3);
    expect(weekOfBlock("2026-08-10", new Date("2026-09-01T12:00:00"))).toBe(4);
  });

  it("wraps back to week 1 after the deload", () => {
    expect(weekOfBlock("2026-08-10", new Date("2026-09-08T12:00:00"))).toBe(1);
  });

  it("stays in range for dates before the block started", () => {
    const w = weekOfBlock("2026-08-10", new Date("2026-07-20T12:00:00"));
    expect(w).toBeGreaterThanOrEqual(1);
    expect(w).toBeLessThanOrEqual(4);
  });
});

describe("weekMultiplier", () => {
  it("steps up through the build weeks", () => {
    expect(weekMultiplier(1)).toBeCloseTo(1.0);
    expect(weekMultiplier(2)).toBeCloseTo(1.015);
    expect(weekMultiplier(3)).toBeCloseTo(1.03);
  });

  it("backs off on the deload", () => {
    expect(isDeloadWeek(4)).toBe(true);
    expect(weekMultiplier(4)).toBeCloseTo(0.85);
  });
});

describe("prescribe", () => {
  it("returns null for power-tier movements", () => {
    expect(prescribe(ex("rot_mb"), 100, 1, BODYWEIGHT)).toBeNull();
  });

  it("returns null when no baseline exists yet", () => {
    expect(prescribe(ex("trap_bar"), null, 1, BODYWEIGHT)).toBeNull();
  });

  /**
   * Regression test against realistic training numbers.
   *
   * The loads on the right are plausible working loads a lifter would
   * actually pick by feel at that e1RM. If the model is sound it should
   * land on or near them without having seen them. This is the guardrail
   * against silent drift when tuning the prescription math — if this test
   * starts failing, the model has moved away from real-world loading, not
   * just away from a specific number.
   */
  it("reproduces loads a lifter would pick by feel", () => {
    const cases: Array<[string, number, number, number]> = [
      // exercise,   e1RM,  expected load, tolerance
      ["row_bb", epley(185, 5), 180, 5],
      ["ohp", epley(115, 6), 110, 5],
      ["calf_seated", epley(185, 10), 185, 5],
      ["curl", epley(50, 10), 50, 2.5],
      ["tri_pulldown", epley(65, 12), 65, 2.5],
      ["incline_bb", epley(155, 5), 145, 10],
    ];

    for (const [id, e1rm, expected, tolerance] of cases) {
      const rx = prescribe(ex(id), e1rm, 1, BODYWEIGHT);
      expect(rx, id).not.toBeNull();
      expect(Math.abs(rx!.load - expected), `${id}: got ${rx!.load}, expected ~${expected}`)
        .toBeLessThanOrEqual(tolerance);
    }
  });

  it("prescribes the squat top set near a known-good working load", () => {
    const rx = prescribe(ex("back_squat"), 335, 1, BODYWEIGHT);
    expect(rx!.load).toBe(280);
    expect(rx!.backoff).toBe(240);
  });

  it("subtracts bodyweight for weighted pull-ups", () => {
    const total = epley(BODYWEIGHT, 6); // bodyweight-only set
    const rx = prescribe(ex("pullup"), total, 1, BODYWEIGHT);
    // Target is 6 reps at RIR 2, which is easier than the 6-rep max set
    // that produced the e1RM, so the added weight should be negative or near
    // zero rather than a real plate.
    expect(rx!.load).toBeLessThan(10);
  });

  it("rounds dumbbell and barbell work to fives, bodyweight added weight to half-steps", () => {
    const db = prescribe(ex("curl"), 66.7, 1, BODYWEIGHT);
    const bb = prescribe(ex("row_bb"), 215.8, 1, BODYWEIGHT);
    const added = prescribe(ex("pullup"), epley(BODYWEIGHT + 30, 6), 1, BODYWEIGHT);
    expect(db!.load % 5).toBe(0);
    expect(bb!.load % 5).toBe(0);
    expect(added!.load % 2.5).toBe(0);
  });

  it("lightens the load and adds RIR during the deload", () => {
    const build = prescribe(ex("back_squat"), 335, 3, BODYWEIGHT)!;
    const deload = prescribe(ex("back_squat"), 335, 4, BODYWEIGHT)!;
    expect(deload.load).toBeLessThan(build.load);
    expect(deload.rir).toBe(build.rir + 2);
  });
});

describe("restSeconds", () => {
  it("gives the anchor lift longer rest than everything else", () => {
    const anchorRest = restSeconds(ex("back_squat"));
    const workRest = restSeconds(ex("tri_pulldown"));
    const powerRest = restSeconds(ex("rot_mb"));
    expect(anchorRest).toBeGreaterThan(workRest);
    expect(workRest).toBe(powerRest);
  });
});

describe("detectPlateau", () => {
  const point = (e1rm: number, i: number): HistoryPoint => ({
    date: `2026-08-${String(i + 1).padStart(2, "0")}`,
    e1rm,
    weight: 200,
    reps: 5,
    sets: [{ exId: "back_squat", weight: 200, reps: 5 }],
  });

  it("needs four sessions before it will call a stall", () => {
    expect(detectPlateau([300, 300, 300].map(point))).toBe(false);
  });

  it("flags four flat sessions", () => {
    expect(detectPlateau([300, 301, 299, 300].map(point))).toBe(true);
  });

  it("does not flag a lift that is still climbing", () => {
    expect(detectPlateau([300, 310, 320, 330].map(point))).toBe(false);
  });

  it("only looks at the most recent window", () => {
    // Early stall, recent progress: not a plateau.
    expect(detectPlateau([200, 200, 200, 200, 250, 275, 300, 325].map(point))).toBe(false);
  });
});
