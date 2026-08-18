/**
 * Exercise substitutions.
 *
 * Every entry is keyed by an exercise id from `program.ts`. The point is that
 * swapping a movement should not reset your progression: `loadFactor` converts
 * the parent lift's estimated 1RM into a starting estimate for the substitute,
 * so `prescribe()` can hand you a working load on the first session rather than
 * making you find it by feel again.
 *
 * A `loadFactor` of null means the movement is not comparable enough to carry
 * a number across — machine stacks, unilateral work, and anything where the
 * implement changes the leverage too much. Those need one baseline set.
 *
 * IMPORTANT: these ratios are strength-and-conditioning rules of thumb, not
 * measured values. Treat a converted load as a starting point to be logged and
 * corrected, not as a prescription to trust blindly. First session on any
 * substitute should be taken a rep or two shy of the target RIR.
 */

export type SubTag =
  /** Needs no barbell or rack — travel, crowded gym, hotel. */
  | "minimal-equipment"
  /** Lower joint stress, usually shoulder or lower back. */
  | "joint-friendly"
  /** Specifically protects overhead/throwing shoulder mechanics — repetitive
   *  overhead sport or work, not just general joint stress. */
  | "overhead-friendly"
  /** Faster to set up or run — use when the session is compressed. */
  | "time-saver"
  /** The rack or machine you wanted is occupied. */
  | "gym-busy"
  /** Lower systemic fatigue — good for managing overall training load or on a low-recovery day. */
  | "low-fatigue"
  /** Trains the same pattern with a different stimulus — use when stalled. */
  | "stall-breaker";

export interface Substitution {
  name: string;
  /**
   * Multiply the parent exercise's e1RM by this to seed the substitute.
   * null when the movement isn't comparable and needs its own baseline set.
   */
  loadFactor: number | null;
  /** Why you'd reach for this one instead. */
  why: string;
  tags: SubTag[];
}

export const SUBSTITUTIONS: Record<string, Substitution[]> = {
  /* ---------------------------------------------------------------
     LOWER A
     --------------------------------------------------------------- */

  hang_clean: [
    {
      name: "Power Clean (from floor)",
      loadFactor: 0.95,
      why: "Longer pull, more time to accelerate. Use when the hang position feels sticky.",
      tags: ["stall-breaker"],
    },
    {
      name: "Clean Pull",
      loadFactor: 1.2,
      why: "Same pull, no catch. Removes the wrist and front-rack demand entirely — useful when grip and forearm fatigue is limiting the lift before your back is.",
      tags: ["joint-friendly", "overhead-friendly"],
    },
    {
      name: "Trap Bar Jump",
      loadFactor: null,
      why: "Nearly all the power output, almost none of the technical cost. The best swap on a low-recovery day.",
      tags: ["low-fatigue", "time-saver"],
    },
    {
      name: "Dumbbell Snatch",
      loadFactor: null,
      why: "Unilateral, and the offset load forces trunk control. Good when a barbell isn't free.",
      tags: ["gym-busy", "minimal-equipment"],
    },
    {
      name: "Broad Jump",
      loadFactor: null,
      why: "Zero load, full intent. Keeps the day's power slot honest when you're too fried to load a bar.",
      tags: ["low-fatigue", "minimal-equipment", "time-saver"],
    },
  ],

  back_squat: [
    {
      name: "Front Squat",
      loadFactor: 0.85,
      why: "More quad, more upright, less lower-back tax. A common swap when back stress needs to come down without losing the squat pattern.",
      tags: ["joint-friendly", "low-fatigue"],
    },
    {
      name: "Safety Bar Squat",
      loadFactor: 0.9,
      why: "Neutral grip means no shoulder external rotation under load — the single best option when overhead shoulder mechanics are cranky.",
      tags: ["overhead-friendly", "joint-friendly"],
    },
    {
      name: "Pause Squat (3s)",
      loadFactor: 0.85,
      why: "Kills the stretch reflex and exposes the hole. Reach for it when your top set stalls but your back-offs feel easy.",
      tags: ["stall-breaker"],
    },
    {
      name: "Box Squat",
      loadFactor: 0.95,
      why: "Fixed depth, more hip. Useful when knees are sore from repetitive lateral movement or direction changes.",
      tags: ["joint-friendly"],
    },
    {
      name: "Hack Squat",
      loadFactor: null,
      why: "Machine path, no stabilization cost. Same quad stimulus at a fraction of the systemic fatigue.",
      tags: ["low-fatigue", "gym-busy"],
    },
    {
      name: "Goblet Squat",
      loadFactor: null,
      why: "One dumbbell, no rack. The travel option.",
      tags: ["minimal-equipment", "time-saver"],
    },
  ],

  rdl: [
    {
      name: "Snatch-Grip RDL",
      loadFactor: 0.85,
      why: "Wider grip lengthens the range and loads the upper back hard.",
      tags: ["stall-breaker"],
    },
    {
      name: "Trap Bar RDL",
      loadFactor: 1.05,
      why: "Neutral grip and a load line closer to the body. Easier on the lower back.",
      tags: ["joint-friendly"],
    },
    {
      name: "Single-Leg RDL",
      loadFactor: null,
      why: "Exposes the side-to-side imbalance a bilateral RDL hides. Directly relevant to fielding on the move.",
      tags: ["minimal-equipment", "low-fatigue"],
    },
    {
      name: "Good Morning",
      loadFactor: 0.6,
      why: "Same hinge, bar on the back instead of in the hands. Grip stops being the limiter.",
      tags: ["stall-breaker"],
    },
    {
      name: "Seated Leg Curl",
      loadFactor: null,
      why: "If the lower back is the thing that's tired, train the hamstring without loading the spine at all.",
      tags: ["low-fatigue", "joint-friendly"],
    },
  ],

  leg_curl: [
    {
      name: "Lying Leg Curl",
      loadFactor: 0.95,
      why: "Hip extended rather than flexed — slightly different hamstring emphasis, same job.",
      tags: ["gym-busy"],
    },
    {
      name: "Nordic Curl",
      loadFactor: null,
      why: "Eccentric-dominant and brutally effective. Strongest evidence base of anything here for hamstring injury reduction.",
      tags: ["minimal-equipment", "stall-breaker"],
    },
    {
      name: "Slider / Towel Leg Curl",
      loadFactor: null,
      why: "Hardwood floor and a towel. No machine, no partner.",
      tags: ["minimal-equipment", "time-saver"],
    },
  ],

  calf_seated: [
    {
      name: "Standing Calf Raise",
      loadFactor: null,
      why: "Knee straight shifts emphasis from soleus to gastroc. Rotate between them across a block.",
      tags: ["gym-busy"],
    },
    {
      name: "Single-Leg Calf Raise",
      loadFactor: null,
      why: "Bodyweight is enough for most people on one leg. No machine needed.",
      tags: ["minimal-equipment", "time-saver"],
    },
  ],

  /* ---------------------------------------------------------------
     UPPER A
     --------------------------------------------------------------- */

  bench: [
    {
      name: "Close-Grip Bench",
      loadFactor: 0.9,
      why: "Less shoulder abduction, more triceps. Easier on the front of the shoulder.",
      tags: ["overhead-friendly", "joint-friendly"],
    },
    {
      name: "Floor Press",
      loadFactor: 0.92,
      why: "Floor caps the range before the shoulder reaches end-range extension. The safest press when shoulder health is the priority.",
      tags: ["overhead-friendly", "joint-friendly"],
    },
    {
      name: "Larsen Press",
      loadFactor: 0.92,
      why: "Feet up, no leg drive. Pure upper-body work when the lower half is wrecked from a lower day.",
      tags: ["low-fatigue"],
    },
    {
      name: "Dumbbell Bench (pair total)",
      loadFactor: 0.85,
      why: "Independent arms let each shoulder find its own path. Also the answer when every bench is taken.",
      tags: ["gym-busy", "joint-friendly"],
    },
    {
      name: "Weighted Push-Up",
      loadFactor: null,
      why: "Scapulae move freely instead of being pinned to a bench — noticeably friendlier to overhead shoulder mechanics.",
      tags: ["overhead-friendly", "minimal-equipment", "time-saver"],
    },
  ],

  incline_bb: [
    {
      name: "Incline DB Press (pair total)",
      loadFactor: 0.85,
      why: "Deeper stretch at the bottom and each arm tracks independently.",
      tags: ["joint-friendly", "gym-busy"],
    },
    {
      name: "Landmine Press",
      loadFactor: null,
      why: "Arcing path in the scapular plane. The most shoulder-friendly overhead-ish press there is.",
      tags: ["overhead-friendly", "joint-friendly"],
    },
    {
      name: "Low-Incline DB Press",
      loadFactor: 0.9,
      why: "Drop to 15-20 degrees when the steeper angle bothers the front delt.",
      tags: ["joint-friendly"],
    },
  ],

  csr: [
    {
      name: "Seal Row",
      loadFactor: 0.95,
      why: "Chest pinned to the bench, zero body english. Strictest row available.",
      tags: ["joint-friendly", "stall-breaker"],
    },
    {
      name: "Chest-Supported T-Bar Row",
      loadFactor: 1.05,
      why: "Same support, heavier loading, neutral grip options.",
      tags: ["gym-busy"],
    },
    {
      name: "Single-Arm DB Row",
      loadFactor: null,
      why: "One bench, one dumbbell. Works anywhere and lets you chase the stretch at the bottom.",
      tags: ["minimal-equipment", "gym-busy"],
    },
    {
      name: "Inverted Row",
      loadFactor: null,
      why: "Bodyweight, adjustable by foot position. Costs nothing systemically.",
      tags: ["minimal-equipment", "low-fatigue", "time-saver"],
    },
  ],

  ohp: [
    {
      name: "Push Press",
      loadFactor: 1.2,
      why: "Leg drive gets you past the sticking point with heavier overhead loads.",
      tags: ["stall-breaker"],
    },
    {
      name: "Seated DB Press (pair total)",
      loadFactor: 0.85,
      why: "Neutral grip is an option and each shoulder tracks on its own.",
      tags: ["joint-friendly", "gym-busy"],
    },
    {
      name: "Landmine Press",
      loadFactor: null,
      why: "Never reaches true overhead, so it loads the pattern without the end-range shoulder position. Best low-stress overhead swap.",
      tags: ["overhead-friendly", "joint-friendly"],
    },
    {
      name: "Z-Press",
      loadFactor: 0.8,
      why: "Seated on the floor, legs out. Removes every bit of lower-body contribution and exposes a weak trunk.",
      tags: ["stall-breaker", "minimal-equipment"],
    },
    {
      name: "Half-Kneeling DB Press",
      loadFactor: null,
      why: "Anti-extension demand from the split stance. Light load, high control.",
      tags: ["overhead-friendly", "low-fatigue", "minimal-equipment"],
    },
  ],

  lat_raise: [
    {
      name: "Cable Lateral Raise",
      loadFactor: null,
      why: "Constant tension through the whole range instead of only at the top. Better stimulus per rep.",
      tags: ["stall-breaker"],
    },
    {
      name: "Machine Lateral Raise",
      loadFactor: null,
      why: "Fixed path, easy to take close to failure safely.",
      tags: ["gym-busy", "time-saver"],
    },
    {
      name: "Band Lateral Raise",
      loadFactor: null,
      why: "A band in a bag. Travel and hotel-room option.",
      tags: ["minimal-equipment", "low-fatigue"],
    },
  ],

  tri_ext: [
    {
      name: "Overhead DB Extension",
      loadFactor: null,
      why: "Same lengthened position, no cable stack required.",
      tags: ["minimal-equipment", "gym-busy"],
    },
    {
      name: "Skull Crusher (EZ bar)",
      loadFactor: null,
      why: "Heavier loading. Back off if it bothers your elbows — a common issue for throwers.",
      tags: ["stall-breaker"],
    },
    {
      name: "Cross-Body Cable Extension",
      loadFactor: null,
      why: "Unilateral and gentler on the elbow than a straight bar.",
      tags: ["joint-friendly"],
    },
  ],

  /* ---------------------------------------------------------------
     LOWER B
     --------------------------------------------------------------- */

  trap_bar: [
    {
      name: "Conventional Deadlift",
      loadFactor: 0.9,
      why: "More hip and hamstring, more lower-back cost. Not the default when managing lower-back fatigue matters.",
      tags: ["stall-breaker"],
    },
    {
      name: "Sumo Deadlift",
      loadFactor: 0.9,
      why: "Wider stance shortens the range and loads adductors — relevant to lateral movement in the infield.",
      tags: ["stall-breaker"],
    },
    {
      name: "Block / Rack Pull",
      loadFactor: 1.1,
      why: "Shortened range, heavier load. Use when the floor position aggravates your back.",
      tags: ["joint-friendly", "low-fatigue"],
    },
    {
      name: "Deficit Deadlift",
      loadFactor: 0.85,
      why: "Longer range from a plate. For when the break off the floor is the weak point.",
      tags: ["stall-breaker"],
    },
    {
      name: "Belt Squat",
      loadFactor: null,
      why: "Loads the legs with nothing on the spine at all. The lowest-back-cost option in the building.",
      tags: ["joint-friendly", "low-fatigue"],
    },
  ],

  bss: [
    {
      name: "Reverse Lunge",
      loadFactor: 1.0,
      why: "Same unilateral demand, easier to balance, less knee flexion at the bottom.",
      tags: ["joint-friendly", "time-saver"],
    },
    {
      name: "Front-Foot-Elevated Split Squat",
      loadFactor: 1.05,
      why: "Deeper range on the front leg with less rear-leg flexibility demand.",
      tags: ["joint-friendly"],
    },
    {
      name: "Step-Up",
      loadFactor: 0.95,
      why: "Concentric-dominant, so much less soreness. Good when you can't afford dead legs going into a competition or event.",
      tags: ["low-fatigue"],
    },
    {
      name: "Walking Lunge",
      loadFactor: 0.9,
      why: "Adds a locomotion element. Higher conditioning cost — mind that during the season.",
      tags: ["minimal-equipment"],
    },
    {
      name: "Lateral Lunge",
      loadFactor: null,
      why: "Frontal plane instead of sagittal. Trains the exact pattern of a first step to the hole.",
      tags: ["stall-breaker", "minimal-equipment"],
    },
  ],

  leg_press: [
    {
      name: "Hack Squat",
      loadFactor: null,
      why: "More quad-dominant with a deeper knee bend.",
      tags: ["gym-busy"],
    },
    {
      name: "Single-Leg Press",
      loadFactor: null,
      why: "Same machine, unilateral. Doubles as an imbalance check.",
      tags: ["time-saver"],
    },
    {
      name: "Goblet Squat",
      loadFactor: null,
      why: "One dumbbell when every machine is taken.",
      tags: ["minimal-equipment", "gym-busy"],
    },
  ],

  back_ext: [
    {
      name: "Reverse Hyperextension",
      loadFactor: null,
      why: "Trains the same posterior chain with a traction effect on the lumbar spine rather than compression.",
      tags: ["joint-friendly", "low-fatigue"],
    },
    {
      name: "Glute-Ham Raise",
      loadFactor: null,
      why: "Harder, and adds real knee-flexion work on top of the hip extension.",
      tags: ["stall-breaker"],
    },
    {
      name: "Bird Dog / Hip Thrust",
      loadFactor: null,
      why: "When the lower back needs a genuinely light day rather than a different flavor of hard.",
      tags: ["low-fatigue", "minimal-equipment"],
    },
  ],

  calf_standing: [
    {
      name: "Leg Press Calf Raise",
      loadFactor: null,
      why: "Heavier loading than a standing machine usually allows.",
      tags: ["gym-busy"],
    },
    {
      name: "Single-Leg Calf Raise",
      loadFactor: null,
      why: "A step and your bodyweight. Works anywhere.",
      tags: ["minimal-equipment", "time-saver"],
    },
  ],

  /* ---------------------------------------------------------------
     UPPER B
     --------------------------------------------------------------- */

  pullup: [
    {
      name: "Chin-Up",
      loadFactor: 1.05,
      why: "Supinated grip adds biceps and most people are stronger at it. Doubles as arm work on a compressed day.",
      tags: ["time-saver"],
    },
    {
      name: "Neutral-Grip Pull-Up",
      loadFactor: 1.02,
      why: "Easiest grip on the shoulder and elbow. Default when anything upstream is irritated.",
      tags: ["overhead-friendly", "joint-friendly"],
    },
    {
      name: "Lat Pulldown",
      loadFactor: null,
      why: "Loadable in small increments, which pull-ups aren't. Better for high-rep work.",
      tags: ["gym-busy", "low-fatigue"],
    },
    {
      name: "Inverted Row",
      loadFactor: null,
      why: "Horizontal instead of vertical. Use when the shoulder doesn't want overhead loading at all.",
      tags: ["overhead-friendly", "minimal-equipment", "low-fatigue"],
    },
  ],

  row_bb: [
    {
      name: "Pendlay Row",
      loadFactor: 0.9,
      why: "Dead stop each rep, no momentum. Strict and honest.",
      tags: ["stall-breaker"],
    },
    {
      name: "T-Bar Row",
      loadFactor: 1.05,
      why: "Chest support available and neutral grip options. Kinder to the lower back than a bent-over row.",
      tags: ["joint-friendly"],
    },
    {
      name: "Chest-Supported Row",
      loadFactor: 0.9,
      why: "Removes lower-back involvement entirely. The move on a heavy lower-day week.",
      tags: ["low-fatigue", "joint-friendly"],
    },
    {
      name: "Single-Arm DB Row",
      loadFactor: null,
      why: "One dumbbell, one bench, works anywhere.",
      tags: ["minimal-equipment", "gym-busy"],
    },
  ],

  incline_db: [
    {
      name: "Incline Barbell Press",
      loadFactor: 1.18,
      why: "Heavier loading, fixed bar path.",
      tags: ["stall-breaker"],
    },
    {
      name: "Machine Chest Press",
      loadFactor: null,
      why: "Fixed path makes it safe to push near failure without a spotter.",
      tags: ["gym-busy", "time-saver"],
    },
    {
      name: "Deficit Push-Up",
      loadFactor: null,
      why: "Hands elevated for a deeper stretch. No equipment at all.",
      tags: ["minimal-equipment", "overhead-friendly"],
    },
  ],

  pulldown: [
    {
      name: "Straight-Arm Pulldown",
      loadFactor: null,
      why: "Isolates the lat with no elbow flexion — biceps stop being the limiter.",
      tags: ["stall-breaker"],
    },
    {
      name: "Neutral-Grip Pulldown",
      loadFactor: 1.0,
      why: "Same movement, friendlier shoulder position.",
      tags: ["overhead-friendly", "joint-friendly"],
    },
    {
      name: "Band Pulldown",
      loadFactor: null,
      why: "Anchor a band overhead. Travel option.",
      tags: ["minimal-equipment", "low-fatigue"],
    },
  ],

  curl: [
    {
      name: "Incline DB Curl (pair total)",
      loadFactor: 0.8,
      why: "Elbows behind the torso puts the biceps in a lengthened position under load.",
      tags: ["stall-breaker"],
    },
    {
      name: "Hammer Curl (pair total)",
      loadFactor: 1.05,
      why: "Neutral grip adds brachialis and forearm. Easier on the elbow, which matters for throwers.",
      tags: ["joint-friendly", "overhead-friendly"],
    },
    {
      name: "Cable Curl",
      loadFactor: null,
      why: "Constant tension, no dead spot at the top.",
      tags: ["gym-busy"],
    },
    {
      name: "Band Curl",
      loadFactor: null,
      why: "Your daily grease-the-groove option. Zero setup.",
      tags: ["minimal-equipment", "low-fatigue", "time-saver"],
    },
  ],

  tri_pulldown: [
    {
      name: "Straight-Bar Pushdown",
      loadFactor: 1.0,
      why: "Same movement, fixed grip, usually a bit heavier.",
      tags: ["gym-busy"],
    },
    {
      name: "Dip (assisted or weighted)",
      loadFactor: null,
      why: "Compound alternative. Skip it if the bottom position bothers your shoulder.",
      tags: ["stall-breaker"],
    },
    {
      name: "Close-Grip Push-Up",
      loadFactor: null,
      why: "No cable stack needed.",
      tags: ["minimal-equipment", "time-saver"],
    },
  ],

  /* ---------------------------------------------------------------
     POWER TIER — no load conversion, intent is the variable
     --------------------------------------------------------------- */

  rot_mb: [
    {
      name: "Scoop Toss",
      loadFactor: null,
      why: "More hip-driven, less arm. Good starting variation.",
      tags: ["minimal-equipment"],
    },
    {
      name: "Shotput Throw",
      loadFactor: null,
      why: "Closer to a throwing pattern. Alternate sides evenly regardless of your dominant side.",
      tags: ["minimal-equipment"],
    },
    {
      name: "Cable Rotational Chop",
      loadFactor: null,
      why: "When there's no wall to throw against. Less velocity, so drive the concentric hard.",
      tags: ["gym-busy"],
    },
    {
      name: "Band Rotational Punch",
      loadFactor: null,
      why: "Travel version. Intent still matters more than resistance.",
      tags: ["minimal-equipment", "time-saver"],
    },
  ],

  lat_bound: [
    {
      name: "Skater Bound (continuous)",
      loadFactor: null,
      why: "No pause between reps. More elastic, more conditioning cost.",
      tags: ["minimal-equipment"],
    },
    {
      name: "Lateral Box Jump",
      loadFactor: null,
      why: "Removes the landing impact by jumping up onto a box. Use on sore-knee days.",
      tags: ["joint-friendly", "low-fatigue"],
    },
    {
      name: "Depth Drop to Stick",
      loadFactor: null,
      why: "Landing mechanics only. Lowest-fatigue way to keep the slot filled.",
      tags: ["low-fatigue", "time-saver"],
    },
  ],

  face_pull: [
    {
      name: "Band Pull-Apart",
      loadFactor: null,
      why: "Same job, fits in a bag, can be done daily.",
      tags: ["minimal-equipment", "time-saver"],
    },
    {
      name: "Prone Y-T-W Raise",
      loadFactor: null,
      why: "Lower trap and rotator cuff emphasis. Light weight, slow tempo, no exceptions.",
      tags: ["overhead-friendly", "minimal-equipment"],
    },
    {
      name: "Cable External Rotation",
      loadFactor: null,
      why: "Direct cuff work. Worth doing alongside face pulls as ongoing shoulder maintenance, not just instead of.",
      tags: ["overhead-friendly"],
    },
  ],

  farmer: [
    {
      name: "Suitcase Carry",
      loadFactor: null,
      why: "One side loaded, so the trunk resists lateral flexion. Harder than it looks.",
      tags: ["minimal-equipment", "stall-breaker"],
    },
    {
      name: "Front-Rack Carry",
      loadFactor: null,
      why: "Anti-extension demand plus an upper-back challenge.",
      tags: ["stall-breaker"],
    },
    {
      name: "Trap Bar Carry",
      loadFactor: null,
      why: "Heaviest loading available and the easiest to pick up safely.",
      tags: ["time-saver"],
    },
  ],

  pallof: [
    {
      name: "Half-Kneeling Pallof Press",
      loadFactor: null,
      why: "Removes leg contribution and raises the anti-rotation demand.",
      tags: ["stall-breaker"],
    },
    {
      name: "Band Anti-Rotation Hold",
      loadFactor: null,
      why: "Isometric version. Hold 20-30s per side.",
      tags: ["minimal-equipment", "time-saver"],
    },
    {
      name: "Landmine Rainbow",
      loadFactor: null,
      why: "Adds a rotational range instead of purely resisting it.",
      tags: ["stall-breaker"],
    },
  ],

  hanging_knee: [
    {
      name: "Hanging Leg Raise",
      loadFactor: null,
      why: "Straight legs, longer lever, harder.",
      tags: ["stall-breaker"],
    },
    {
      name: "Captain's Chair Knee Raise",
      loadFactor: null,
      why: "Back supported, grip stops being the limiter.",
      tags: ["gym-busy"],
    },
    {
      name: "Dead Bug",
      loadFactor: null,
      why: "Floor-based anti-extension. Lowest fatigue, hardest to do badly.",
      tags: ["minimal-equipment", "low-fatigue"],
    },
  ],
};

/**
 * Seed a substitute's estimated 1RM from the parent lift's.
 * Returns null when the movement needs its own baseline set.
 */
export function convertE1RM(parentE1rm: number | null, sub: Substitution): number | null {
  if (parentE1rm == null || sub.loadFactor == null) return null;
  return parentE1rm * sub.loadFactor;
}

/** Substitutions for an exercise, optionally filtered to a reason. */
export function substitutionsFor(exerciseId: string, tag?: SubTag): Substitution[] {
  const all = SUBSTITUTIONS[exerciseId] ?? [];
  return tag ? all.filter((s) => s.tags.includes(tag)) : all;
}
