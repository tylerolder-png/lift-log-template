# The Log

A 4-day upper/lower strength tracker that prescribes today's load from your own
logged sets. No accounts, no backend — everything lives in your browser's
`localStorage`. Set your bodyweight, log a hard set on each exercise, and it
starts prescribing loads from there.

**Live demo:** _(add after deploying)_

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
