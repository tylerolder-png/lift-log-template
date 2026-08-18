/**
 * Epley one-rep-max estimation.
 *
 * A single rep is returned unchanged. Epley extrapolates upward from the rep
 * count, so feeding it a true 1RM inflates the result — a 335 x 1 becomes 346,
 * which would then prescribe loads the lifter has never actually hit.
 */
export function epley(weight: number, reps: number): number {
  if (reps <= 1) return weight;
  return weight * (1 + reps / 30);
}

/** Load that should produce `reps` reps, given an estimated 1RM. */
export function inverseEpley(e1rm: number, reps: number): number {
  return e1rm / (1 + reps / 30);
}

/** Round to the nearest loadable increment. */
export function roundToIncrement(value: number, increment: number): number {
  return Math.round(value / increment) * increment;
}

/** Best estimated 1RM across a set of (weight, reps) pairs. */
export function bestE1RM(sets: ReadonlyArray<{ weight: number; reps: number }>): number | null {
  if (sets.length === 0) return null;
  return Math.max(...sets.map((s) => epley(s.weight, s.reps)));
}
