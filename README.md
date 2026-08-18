# The Log

A 4-day upper/lower strength tracker that prescribes today's load from your own
logged sets. No accounts, no backend — everything lives in your browser's
`localStorage`. Set your bodyweight, log a hard set on each exercise, and it
starts prescribing loads from there.

**Live demo:** https://lift-log-template.vercel.app

## Getting started

```bash
npm install
npm run dev
```

Open the URL Vite prints. Data persists in `localStorage` — clearing site data
starts you over from a blank slate, no seeded history to reset to.

```bash
npm run check    # typecheck + tests
npm run build    # production build
```

## First run

1. Set your **bodyweight** in the header. Pull-up estimates and every benchmark
   row depend on it, and it defaults to 180.
2. Set **block start** to the Monday your current 4-week block began (it
   defaults to today).
3. Every exercise starts tagged **New** — none of them have a baseline yet.
   Log one hard set of each and their targets populate from there.

## How the prescription works

Your best estimated 1RM per lift is computed from logged sets with the Epley
formula. Today's load runs that backwards at your target reps *plus* your target
RIR. Beat a set and the estimate moves, so the next session's number moves with
it — nothing is entered by hand.

Weeks 1–3 add 1.5% per week. Week 4 backs off to 85% and adds 2 to every RIR.
A lift is flagged **Stalled** when its last four estimates sit within 2% of each
other, which is the signal to change the variation rather than push harder.

Each exercise also has a swap picker with alternates suited to different
situations (limited equipment, joint-friendly, breaking a plateau) — pick one
and the target represcribes from a converted estimate of your main lift's e1RM,
with a one-tap way back to the original.

## How this was built

Built with Claude Code. The interesting part wasn't the generation — it was
building a structure that made the generation verifiable.

### Context up front, not corrections after

`CLAUDE.md` encodes the domain rules that are easy to get wrong, before any
agent touches the code:

- Single-rep sets are never extrapolated through Epley (a true 335 lb 1RM
  becomes 346, which then prescribes loads never actually hit)
- RIR is added to the rep count, not subtracted from the load
- Bodyweight exercises store *added* weight only
- `src/lib/` is pure — no React imports allowed

Every one of those looks like a bug to a reader without context. Writing them
down is what stops an agent from confidently "fixing" correct code.

### Tests as the verification layer

Agent summaries are a claim, not evidence. `npm run check` runs a strict
typecheck plus the suite, and nothing counts as done until it passes.

The most useful test isn't a unit test. It feeds in estimated 1RMs from real
logged sessions and asserts the model reproduces the working loads a lifter
chose by feel — 180 lb on rows, 110 on overhead press, 185 on calves. It's the
test that catches the model drifting away from being *useful*, as opposed to
merely being internally consistent. If it fails, the answer is to investigate,
not to update the expected values. The file says so.

### Reading diffs, not summaries

A refactor renamed a `perHand` flag to `isDumbbell`. Correct rename — but that
flag also controlled a rounding increment, and the first two attempts silently
kept dumbbells rounding to 2.5 lb. Wrong: those loads are pair totals, and a
pair only moves in 5 lb steps, since a 42.5 lb pair would mean 21.25 lb per
hand. The rename landed clean; the increment took two rejected diffs to get
right.

Nothing in the tests would have caught it. The typecheck passed and every test
stayed green, because the bug was in a domain assumption rather than in logic.
That's the case for reading diffs rather than accepting a summary that says
"all 27 tests pass."

### Measuring instead of asserting

Recharts was 378 kB of a 534 kB bundle, for a view opened once a week. After
lazy-loading the progress view, the initial bundle dropped to 156 kB — a 71%
cut. The number came from running `npm run build` and comparing output, not
from the change description.

### Scoping the tooling

Skills were evaluated against the project rather than installed by popularity.
React and workflow skills earned their place. Database and infrastructure
skills didn't — there's no database and no infrastructure, so they'd burn
context on every activation for nothing.

### Found in the wild

The first bug that reached real use came from real data: with bodyweight set,
the pull-up card prescribed a negative added load. The model read a
bodyweight-only set as a max effort, then prescribed something easier than what
it thought had just been done. Fixed by clamping at zero and displaying
"bodyweight" — and by adding the test that should have existed first.
## Working on this with Claude Code

`CLAUDE.md` holds the architecture, the domain rules that are easy to get wrong,
and the design direction. Read it before making changes.

Skills worth installing for this repo specifically:

```bash
# React patterns — this is a React codebase now, so these apply
npx skills@latest add vercel/react-best-practices

# Workflow: clarify → spec → plan → execute → review
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
```

`frontend-design` ships with Claude Code already and is the relevant one for
visual work here.

Skills **not** worth installing for this project: anything database (there's no
database), anything infrastructure (there's no infrastructure). Adding those
just burns context on every activation.
