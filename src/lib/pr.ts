/**
 * True when a newly logged e1RM beats every prior best for that exercise.
 * A first-ever set on an exercise is a baseline, not a PR — there's
 * nothing yet to have beaten.
 */
export function isNewPR(previousBest: number | null, newE1rm: number): boolean {
  if (previousBest === null) return false;
  return newE1rm > previousBest + 0.01;
}
