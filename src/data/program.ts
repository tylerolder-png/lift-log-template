import type { Day } from "../lib/types";

/**
 * Four-day upper/lower split. Two anchors per day carry the session; the rest
 * are cuttable when time or recovery is short.
 *
 * Weekly fractional volume lands at 13-17 sets per muscle group.
 */
export const DAYS: Day[] = [
  {
    id: "lowerA",
    label: "Lower A",
    sub: "Power & Max Strength",
    exercises: [
      {
        id: "rot_mb",
        name: "Rotational Med Ball Throw",
        scheme: "4 x 3 ea",
        tier: "power",
        isNew: true,
        note: "Max intent, not fatigue. Rotational power output transfers directly to rotational-sport performance.",
      },
      {
        id: "hang_clean",
        name: "Hang Clean",
        scheme: "5 x 3",
        reps: 3,
        rir: 4,
        tier: "anchor",
        note: "Never to failure. Bar speed is the metric, not load.",
      },
      {
        id: "back_squat",
        name: "Back Squat",
        scheme: "1 x 4 top, 3 x 5 back-off",
        reps: 4,
        rir: 2,
        backoff: 0.85,
        tier: "anchor",
      },
      { id: "rdl", name: "Romanian Deadlift", scheme: "3 x 6", reps: 6, rir: 2, tier: "work" },
      {
        id: "leg_curl",
        name: "Seated Leg Curl",
        scheme: "3 x 10",
        reps: 10,
        rir: 0,
        tier: "work",
        isNew: true,
        note: "Knee flexion. RDLs alone don't cover the hamstring.",
      },
      {
        id: "calf_seated",
        name: "Seated Calf Raise",
        scheme: "3 x 10",
        reps: 10,
        rir: 0,
        tier: "work",
        note: "Two-second pause in the stretch.",
      },
      { id: "hanging_knee", name: "Hanging Knee Raise", scheme: "3 x 8", tier: "power" },
    ],
  },
  {
    id: "upperA",
    label: "Upper A",
    sub: "Push Bias",
    exercises: [
      {
        id: "bench",
        name: "Bench Press",
        scheme: "4 x 5",
        reps: 5,
        rir: 2,
        tier: "anchor",
        isNew: true,
        note: "Flat press, added to balance out incline-heavy pressing volume.",
      },
      {
        id: "incline_bb",
        name: "Incline Bench - Barbell",
        scheme: "3 x 5",
        reps: 5,
        rir: 2,
        tier: "work",
      },
      {
        id: "csr",
        name: "Chest-Supported Row",
        scheme: "3 x 8",
        reps: 8,
        rir: 1,
        tier: "work",
        isNew: true,
        note: "Row volume without the lower-back tax.",
      },
      { id: "ohp", name: "Overhead Press", scheme: "3 x 6", reps: 6, rir: 2, tier: "work" },
      {
        id: "lat_raise",
        name: "Lateral Raise - DB",
        scheme: "3 x 12",
        reps: 12,
        rir: 0,
        tier: "work",
        isDumbbell: true,
      },
      {
        id: "tri_ext",
        name: "Overhead Tricep Ext - Rope",
        scheme: "3 x 12",
        reps: 12,
        rir: 0,
        tier: "work",
      },
      {
        id: "face_pull",
        name: "Face Pull",
        scheme: "3 x 15",
        tier: "power",
        isNew: true,
        note: "Shoulder care. Non-negotiable during a competitive season.",
      },
    ],
  },
  {
    id: "lowerB",
    label: "Lower B",
    sub: "Hypertrophy & Unilateral",
    exercises: [
      {
        id: "lat_bound",
        name: "Lateral Bound",
        scheme: "3 x 3 ea",
        tier: "power",
        isNew: true,
        note: "Stick the landing. Frontal plane movement - the first step in any lateral change of direction.",
      },
      {
        id: "trap_bar",
        name: "Trap Bar Deadlift",
        scheme: "4 x 5",
        reps: 5,
        rir: 2,
        tier: "anchor",
        isNew: true,
        note: "Start near 90% of your RDL e1RM and adjust from there.",
      },
      {
        id: "bss",
        name: "Bulgarian Split Squat",
        scheme: "3 x 8 ea",
        reps: 8,
        rir: 1,
        tier: "work",
        isNew: true,
        isDumbbell: true,
      },
      { id: "leg_press", name: "Leg Press", scheme: "3 x 10", reps: 10, rir: 0, tier: "work", isNew: true },
      { id: "back_ext", name: "45 Back Extension", scheme: "3 x 10", reps: 10, rir: 1, tier: "work", isNew: true },
      {
        id: "calf_standing",
        name: "Standing Calf Raise",
        scheme: "3 x 12",
        reps: 12,
        rir: 0,
        tier: "work",
        isNew: true,
      },
      { id: "pallof", name: "Pallof Press", scheme: "3 x 10 ea", tier: "power" },
    ],
  },
  {
    id: "upperB",
    label: "Upper B",
    sub: "Pull Bias",
    exercises: [
      {
        id: "pullup",
        name: "Pull Up",
        scheme: "4 x 6",
        reps: 6,
        rir: 2,
        tier: "anchor",
        bodyweight: true,
        note: "Log added weight only, 0 for a bodyweight-only set. Add a belt once bodyweight reps stop being challenging.",
      },
      { id: "row_bb", name: "Bent Over Row", scheme: "4 x 5", reps: 5, rir: 1, tier: "anchor" },
      {
        id: "incline_db",
        name: "Incline DB Press",
        scheme: "3 x 8",
        reps: 8,
        rir: 2,
        tier: "work",
        isNew: true,
        isDumbbell: true,
      },
      { id: "pulldown", name: "Lat Pulldown", scheme: "3 x 12", reps: 12, rir: 0, tier: "work", isNew: true },
      {
        id: "curl",
        name: "Bicep Curl - DB",
        scheme: "3 x 10",
        reps: 10,
        rir: 0,
        tier: "work",
        isDumbbell: true,
      },
      {
        id: "tri_pulldown",
        name: "Triceps Pulldown - Rope",
        scheme: "3 x 12",
        reps: 12,
        rir: 0,
        tier: "work",
      },
      { id: "farmer", name: "Farmer Carry", scheme: "3 x 40 yd", tier: "power" },
    ],
  },
];

export const ALL_EXERCISES = DAYS.flatMap((d) => d.exercises);

export function findExercise(id: string) {
  return ALL_EXERCISES.find((e) => e.id === id);
}

/** Bodyweight multiples. General S&C rules of thumb, not research cutoffs. */
export const BENCHMARKS = [
  { exId: "back_squat", label: "Back Squat", solid: 1.5, strong: 2.0 },
  { exId: "trap_bar", label: "Trap Bar Deadlift", solid: 2.0, strong: 2.5 },
  { exId: "bench", label: "Bench Press", solid: 1.0, strong: 1.25 },
  { exId: "pullup", label: "Pull Up (total load)", solid: 1.3, strong: 1.5 },
  { exId: "hang_clean", label: "Hang Clean", solid: 0.9, strong: 1.15 },
] as const;
