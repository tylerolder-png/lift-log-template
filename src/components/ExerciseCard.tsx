import { useState } from "react";
import { prescribe, restSeconds } from "../lib/progression";
import { convertE1RM, substitutionsFor, type Substitution } from "../lib/substitutions";
import type { Exercise, HistoryPoint } from "../lib/types";
import { FlipNumber } from "./FlipNumber";
import { RestTimer } from "./RestTimer";

export interface DraftSet {
  weight: string;
  reps: string;
}

interface Props {
  exercise: Exercise;
  best: number | null;
  history: HistoryPoint[];
  stalled: boolean;
  week: number;
  bodyweight: number;
  sets: DraftSet[];
  onSetChange: (index: number, patch: Partial<DraftSet>) => void;
  onAddSet: () => void;
  onRemoveSet: (index: number) => void;
}

export function ExerciseCard({
  exercise,
  best,
  history,
  stalled,
  week,
  bodyweight,
  sets,
  onSetChange,
  onAddSet,
  onRemoveSet,
}: Props) {
  const [restUntil, setRestUntil] = useState<number | null>(null);
  const [showSubs, setShowSubs] = useState(false);
  const [activeSub, setActiveSub] = useState<Substitution | null>(null);
  const isAnchor = exercise.tier === "anchor";
  const isPower = exercise.tier === "power";
  const recent = history.slice(-8);
  const subs = substitutionsFor(exercise.id);

  const unit = exercise.bodyweight ? "lb added" : exercise.isDumbbell ? "lb (pair)" : "lb";

  // The prescription shown is always for whatever's actually active today —
  // the parent lift, or the swap standing in for it. Logged sets still save
  // under the parent exercise's id either way (see substitutions.ts and the
  // note in CLAUDE.md) — this only changes what's displayed as the target,
  // not what gets recorded. When a swap has no loadFactor (not
  // load-comparable), there's no converted target to show — that's the
  // empty state, not a silent fallback to the parent's own number, which
  // would misrepresent what today's target actually is.
  const activeE1rm = activeSub ? convertE1RM(best, activeSub) : best;
  const rx = activeSub
    ? activeE1rm !== null
      ? prescribe(exercise, activeE1rm, week, bodyweight)
      : null
    : prescribe(exercise, best, week, bodyweight);

  function handleAddSet() {
    onAddSet();
    setRestUntil(Date.now() + restSeconds(exercise) * 1000);
  }

  function selectSub(sub: Substitution) {
    setActiveSub(sub);
    setShowSubs(false);
  }

  function clearSub() {
    setActiveSub(null);
    setShowSubs(false);
  }

  return (
    <section className={`card ${isAnchor ? "card--anchor" : ""}`}>
      <header className="card__head">
        <div>
          <h3 className="card__name">
            {activeSub ? activeSub.name : exercise.name}
            {isAnchor && <span className="tag tag--anchor">Anchor</span>}
            {exercise.isNew && <span className="tag tag--new">New</span>}
            {stalled && <span className="tag tag--stalled">Stalled</span>}
          </h3>
          <p className="card__scheme">
            {exercise.scheme}
            {rx && <> &middot; RIR {rx.rir}</>}
          </p>
          {activeSub && (
            <p className="card__swap-note">
              Swapped for {exercise.name}.{" "}
              <button type="button" className="card__swap-back" onClick={clearSub}>
                Switch back
              </button>
            </p>
          )}
        </div>
        <div className="card__max">
          <span className="card__max-num">{best ? Math.round(best) : "—"}</span>
          <span className="card__max-label">e1RM</span>
        </div>
      </header>

      {exercise.note && <p className="card__note">{exercise.note}</p>}

      {subs.length > 0 && (
        <div className="sub">
          <button
            type="button"
            className="sub__toggle"
            onClick={() => setShowSubs((v) => !v)}
            aria-expanded={showSubs}
          >
            {activeSub
              ? `Swapped: ${activeSub.name}`
              : showSubs
                ? "Hide swaps"
                : `Swap — ${subs.length} option${subs.length > 1 ? "s" : ""}`}
          </button>

          {showSubs && (
            <ul className="sub__list">
              {activeSub && (
                <li className="sub__item">
                  <button type="button" className="sub__pick" onClick={clearSub}>
                    <span className="sub__item-head">
                      <span className="sub__name">&larr; Back to {exercise.name}</span>
                    </span>
                  </button>
                </li>
              )}
              {subs.map((sub) => {
                const convertedE1rm = convertE1RM(best, sub);
                const subRx =
                  convertedE1rm !== null ? prescribe(exercise, convertedE1rm, week, bodyweight) : null;
                const isActive = activeSub?.name === sub.name;
                return (
                  <li key={sub.name} className={`sub__item ${isActive ? "is-active" : ""}`}>
                    <button type="button" className="sub__pick" onClick={() => selectSub(sub)}>
                      <span className="sub__item-head">
                        <span className="sub__name">
                          {isActive && "✓ "}
                          {sub.name}
                        </span>
                        {subRx && (
                          <span className="sub__load">
                            ~{subRx.load} {unit} &times; {subRx.reps}
                          </span>
                        )}
                      </span>
                      <p className="sub__why">{sub.why}</p>
                      <span className="sub__tags">
                        {sub.tags.map((tag) => (
                          <span key={tag} className="sub__tag">
                            {tag.replace(/-/g, " ")}
                          </span>
                        ))}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {!isPower && (
        <div className="rx">
          {rx ? (
            <>
              <span className="rx__label">Today</span>
              <span className="rx__load">
                <FlipNumber value={rx.load} />
                <span className="rx__unit"> {unit}</span>
                <span className="rx__reps"> &times; {rx.reps}</span>
              </span>
              {rx.backoff !== null && <span className="rx__backoff">back-offs {rx.backoff} &times; 5</span>}
            </>
          ) : (
            <span className="rx__empty">
              {activeSub
                ? `"${activeSub.name}" isn't load-comparable to ${exercise.name} — log a baseline set to start tracking it.`
                : "Log one hard set and the target appears here."}
            </span>
          )}
        </div>
      )}

      {recent.length > 0 && (
        <ol className="strip" aria-label={`${exercise.name} recent sessions`}>
          {recent.map((point, i) => {
            const prev = recent[i - 1];
            const climbing = prev !== undefined && point.e1rm > prev.e1rm;
            const isBest = best !== null && Math.abs(point.e1rm - best) < 0.01;
            return (
              <li
                key={`${point.date}-${i}`}
                className={`strip__box ${isBest ? "is-best" : climbing ? "is-up" : ""}`}
                title={`${point.date} — best ${point.weight}×${point.reps}${
                  point.sets.length > 1 ? ` (${point.sets.length} sets)` : ""
                }`}
              >
                <span className="strip__num">{Math.round(point.e1rm)}</span>
                <span className="strip__sub">
                  {point.weight}&times;{point.reps}
                  {point.sets.length > 1 && <> &middot; {point.sets.length}s</>}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      {sets.map((set, i) => (
        <div className="entry" key={i}>
          <span className="entry__set-num">{i + 1}</span>
          <label className="entry__field">
            <span>{exercise.bodyweight ? "Added" : "Weight"}</span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="—"
              value={set.weight}
              onChange={(e) => onSetChange(i, { weight: e.target.value })}
            />
          </label>
          <label className="entry__field">
            <span>Reps</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="—"
              value={set.reps}
              onChange={(e) => onSetChange(i, { reps: e.target.value })}
            />
          </label>
          {sets.length > 1 && (
            <button
              type="button"
              className="entry__remove"
              onClick={() => onRemoveSet(i)}
              aria-label={`Remove set ${i + 1}`}
            >
              &times;
            </button>
          )}
        </div>
      ))}

      <div className="entry__footer">
        <button type="button" className="entry__add" onClick={handleAddSet}>
          + Add set
        </button>
        <p className="entry__hint">{isPower ? "Reps only" : "One row per set"}</p>
      </div>

      {restUntil !== null && <RestTimer endAt={restUntil} onDismiss={() => setRestUntil(null)} />}
    </section>
  );
}
