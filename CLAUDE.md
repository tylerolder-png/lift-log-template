# CLAUDE.md

Context for Claude Code working in this repo.

## What this is

A strength-training tracker for a 4-day upper/lower split, built as a template —
plug in your own bodyweight and lift numbers and it's immediately usable, no setup
beyond that. Meant for one person at a time, used one-handed, on a phone,
mid-workout, between sets. That constraint outranks everything else: if a change
makes the app prettier but slower to enter a set into, it's the wrong change.

Goals of the training program itself: general strength, athleticism, aesthetics —
built for a field-sport athlete's split, but the model (Epley e1RM, RIR-based
progression, plateau detection) applies to any barbell-and-dumbbell strength
program.

## Stack

Vite + React 18 + TypeScript (strict) + Recharts. Plain CSS with custom
properties — no Tailwind, no CSS-in-JS. Vitest for tests.

```
npm run dev        # local server
npm run check      # typecheck + tests — run before declaring anything done
npm run build      # production build
```

## Architecture

```
src/
  lib/            pure domain logic — no React imports allowed here
    oneRepMax.ts    Epley estimation and inversion
    progression.ts  week-in-block, load prescription, plateau detection
    storage.ts      LiftStore interface + localStorage and in-memory impls
    substitutions.ts  alternate lifts per exercise + e1RM conversion
    pr.ts           PR detection
    streak.ts       consecutive logging streak
    types.ts        shared domain types
  data/
    program.ts      the 4-day split as data
    seed.ts         intentionally empty — see its own header comment
  hooks/
    useLiftLog.ts   the only place state and persistence are wired together
  components/       presentational, driven by props
```

**The `lib/` boundary is the important one.** Everything that decides a number
lives there, is pure, and is unit-tested. Components render what they're given.
If you find yourself doing arithmetic inside a component, it belongs in `lib/`.

## Domain rules that are easy to get wrong

- **Never extrapolate a 1-rep set.** `epley()` returns single-rep sets unchanged.
  Epley inflates a true 1RM (335 → 346), which would then prescribe loads the
  lifter has never actually hit. There is a test guarding this. Don't "fix" it.
- **Prescription is `inverseEpley(e1RM × weekMultiplier, targetReps + targetRIR)`.**
  The RIR is added to the rep count, not subtracted from the load. This is what
  makes the model self-correcting: beat a set, e1RM rises, next prescription rises.
- **Bodyweight exercises store the *added* weight only.** Pull-ups log 0 for a
  bodyweight set. Total load = profile.bodyweight + entry.weight. The prescription
  subtracts bodyweight back out before display.
- **Rounding increments differ.** Bodyweight added weight rounds to 2.5 lb
  (plates really do come in 2.5 lb steps there). Dumbbells are logged as the
  pair total, so they round to 5 lb like barbells — a 2.5 lb per-hand step
  isn't a real plate change on one dumbbell. See `prescribe()`.
- **`power` tier exercises get no load prescription.** Med ball throws, bounds,
  carries, face pulls. Intent and reps are the point; adding a target load to
  these would be actively wrong.
- **Substitution load estimates reuse the parent exercise's slot, not the
  substitute's own.** `ExerciseCard` calls `prescribe(exercise, convertE1RM(best,
  sub), week, bodyweight)` — same `exercise` as the primary card, just with a
  converted e1RM swapped in. This is only valid because `loadFactor` in
  `substitutions.ts` is `null` for every substitute where reusing the parent's
  reps/RIR/bodyweight flags wouldn't make sense (different equipment class,
  unilateral vs bilateral, etc.) — `convertE1RM` returns `null` in exactly
  those cases, so no numeric estimate is ever shown for a mismatched swap.
  Don't add a `loadFactor` to `substitutions.ts` without checking it's
  actually comparable on the parent's own terms.
- **Multiple sets per exercise per session are allowed, but only the best one
  feeds the model.** `Session.entries` can hold several `SetEntry`s with the
  same `exId`. `useLiftLog`'s `history` groups them by (session, exercise) and
  keeps the highest-e1RM set as that session's `HistoryPoint` — `e1rm`/
  `weight`/`reps` are always the best set, `sets` on that same `HistoryPoint`
  carries every set logged that session for volume display. Don't feed `sets`
  into `bestFor`/`detectPlateau` — they operate on one point per session by
  design, and multiplying that to one point per set would break the "last
  four sessions" plateau window.

There is a regression test in `progression.test.ts` that checks the model
reproduces loads a lifter would plausibly pick by feel. If that test
starts failing, the model has drifted from realistic loading — investigate rather than
updating the expected values.

## Conventions

- Named exports from `lib/`, default export only for `App`.
- CSS uses BEM-ish `block__element is-state`. Tokens live in `:root` in
  `index.css`; don't hardcode hex values in components.
- Comments explain *why*, not *what*. Most of the existing comments record a
  decision that would otherwise look like a bug.
- Keep `data/program.ts` free of logic. It's a description of the training plan.

## Design direction

Dark ground because of the gym-lighting constraint, not for style. Palette is a
deep maroon (`--maroon`) and burnt orange (`--accent`) on near-black.
The accent is deliberately spent in only two places — the week counter and the
prescribed load — so the number needed mid-set is the brightest thing on screen.
Display face is Barlow Condensed (scoreboard numerals), body is IBM Plex Sans,
data is IBM Plex Mono for tabular alignment.

If you're reworking the visuals, keep the accent scarce. Adding a third accent
colour or accenting every card is the fastest way to make this look generic.

## Known gaps / good next work

- No wearable integration (WHOOP, Oura, etc.). Most wearable APIs don't expose
  exercise-level strength-training data (sets/reps/weights) even when they have
  it in-app, so import would mean OCR or manual entry either way. `storage.ts`
  is the seam where a sync would plug in.
- No recovery-based autoregulation yet; a wearable's recovery score would gate
  whether to show the full session or a compressed one.
- PWA installability note: Chrome on iOS cannot install PWAs at all (Apple
  restriction) — installing from an iPhone requires Safari specifically.
