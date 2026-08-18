/** Movement classification. Drives prescription behaviour, not just styling. */
export type Tier =
  /** The session. Do these or the day didn't happen. */
  | "anchor"
  /** Everything else that carries load and progresses. */
  | "work"
  /** Intent-driven or unloaded. Reps logged, no load prescription. */
  | "power";

export interface Exercise {
  id: string;
  name: string;
  /** Human-readable set/rep display, e.g. "4 × 5". */
  scheme: string;
  tier: Tier;
  /** Target reps for the prescribed set. Absent on `power` tier. */
  reps?: number;
  /** Target reps-in-reserve. Absent on `power` tier. */
  rir?: number;
  /** Fraction of the top set used for back-off sets, if any. */
  backoff?: number;
  /** Dumbbell load, logged as the pair total. */
  isDumbbell?: boolean;
  /** Load is bodyweight + added weight. User enters only the added portion. */
  bodyweight?: boolean;
  /** Not currently in the user's rotation — needs a first baseline set. */
  isNew?: boolean;
  note?: string;
}

export interface Day {
  id: string;
  label: string;
  sub: string;
  exercises: Exercise[];
}

export interface SetEntry {
  exId: string;
  /** For `bodyweight` exercises this is the ADDED weight only. */
  weight: number;
  reps: number;
}

export interface Session {
  id: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  dayId: string;
  /**
   * One row per set logged. Multiple entries can share the same `exId` —
   * order is set order within that session. The e1RM model only ever
   * looks at the best set per (session, exercise); the rest exist for
   * volume tracking. See `useLiftLog`'s `history` derivation.
   */
  entries: SetEntry[];
  /** True for rows imported from an external source rather than logged in-app. */
  seeded?: boolean;
}

export interface Profile {
  bodyweight: number;
  /** ISO date the current 4-week block began. */
  blockStart: string;
}

export interface HistoryPoint {
  date: string;
  /** Best set's e1RM for this (session, exercise) pair. */
  e1rm: number;
  /** Best set's weight. */
  weight: number;
  /** Best set's reps. */
  reps: number;
  /** Every set logged for this exercise that session, in set order. */
  sets: SetEntry[];
}

export interface Prescription {
  /** Load to put on the bar (or added, for bodyweight movements). */
  load: number;
  reps: number;
  rir: number;
  /** Back-off load, when the exercise defines one. */
  backoff: number | null;
}
