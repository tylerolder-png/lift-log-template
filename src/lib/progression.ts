import { inverseEpley, roundToIncrement } from "./oneRepMax";
import type { Exercise, HistoryPoint, Prescription } from "./types";

export const BLOCK_LENGTH_WEEKS = 4;
export const DELOAD_WEEK = 4;

/** Weekly load step during the build weeks. */
const WEEKLY_STEP = 0.015;
/** Fraction of working load used during the deload week. */
const DELOAD_FACTOR = 0.85;
/** Extra reps-in-reserve added during the deload week. */
const DELOAD_RIR_BUMP = 2;
/** e1RM spread below which a lift counts as stalled. */
const PLATEAU_TOLERANCE = 0.02;
const PLATEAU_WINDOW = 4;

/** Rest between sets on the day's main lift — full ATP-PC recovery
 *  before the next heavy set, not just enough to stop breathing hard. */
const ANCHOR_REST_SECONDS = 180;
/** Rest between sets on everything else. */
const DEFAULT_REST_SECONDS = 90;

/** Which week of the rolling 4-week block a date falls in. Returns 1–4. */
export function weekOfBlock(blockStart: string, now: Date = new Date()): number {
  const start = new Date(`${blockStart}T00:00:00`);
  const weeks = Math.floor((now.getTime() - start.getTime()) / (7 * 864e5));
  return (((weeks % BLOCK_LENGTH_WEEKS) + BLOCK_LENGTH_WEEKS) % BLOCK_LENGTH_WEEKS) + 1;
}

export function isDeloadWeek(week: number): boolean {
  return week === DELOAD_WEEK;
}

/** Multiplier applied to the estimated 1RM before back-solving the load. */
export function weekMultiplier(week: number): number {
  if (isDeloadWeek(week)) return DELOAD_FACTOR;
  return 1 + WEEKLY_STEP * (week - 1);
}

export function effectiveRir(exercise: Exercise, week: number): number {
  const base = exercise.rir ?? 0;
  return isDeloadWeek(week) ? base + DELOAD_RIR_BUMP : base;
}

/**
 * Rest between sets, tuned by movement demand. The anchor lift is the
 * heaviest, most neurologically taxing thing in the session — under-
 * resting it means the next set starts before the last one's fatigue
 * has cleared, which shows up as intensity you didn't actually hit.
 */
export function restSeconds(exercise: Exercise): number {
  return exercise.tier === "anchor" ? ANCHOR_REST_SECONDS : DEFAULT_REST_SECONDS;
}

/**
 * Back-solve today's load from the lifter's best estimated 1RM.
 *
 * The set is prescribed at (targetReps + targetRIR) — i.e. the load that would
 * bottom out at target reps plus the reps we intend to leave in the tank.
 * Because e1RM is recomputed from logged sets, beating a set moves the next
 * prescription automatically; nothing is entered by hand.
 */
export function prescribe(
  exercise: Exercise,
  bestE1rm: number | null,
  week: number,
  bodyweight: number,
): Prescription | null {
  if (exercise.tier === "power" || exercise.reps == null) return null;
  if (bestE1rm == null) return null;

  const rir = effectiveRir(exercise, week);
  const target = bestE1rm * weekMultiplier(week);
  const raw = inverseEpley(target, exercise.reps + rir);
  const adjusted = exercise.bodyweight ? raw - bodyweight : raw;
  const increment = exercise.bodyweight ? 2.5 : 5;
  const load = roundToIncrement(adjusted, increment);

  return {
    load,
    reps: exercise.reps,
    rir,
    backoff: exercise.backoff ? roundToIncrement(load * exercise.backoff, 5) : null,
  };
}

/**
 * A lift is stalled when its last four estimated 1RMs sit within 2% of each
 * other. That's the signal to change the variation, not to add weight.
 */
export function detectPlateau(history: ReadonlyArray<HistoryPoint>): boolean {
  if (history.length < PLATEAU_WINDOW) return false;
  const recent = history.slice(-PLATEAU_WINDOW).map((h) => h.e1rm);
  const high = Math.max(...recent);
  const low = Math.min(...recent);
  if (high === 0) return false;
  return (high - low) / high < PLATEAU_TOLERANCE;
}
