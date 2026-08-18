import { useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ALL_EXERCISES, BENCHMARKS, DAYS, findExercise } from "../data/program";
import type { HistoryPoint, Session } from "../lib/types";

interface Props {
  history: Record<string, HistoryPoint[]>;
  bestFor: (exId: string) => number | null;
  bodyweight: number;
  sessions: Session[];
}

const VIEW_TREND = "trend";
const VIEW_HISTORY = "history";

export function ProgressView({ history, bestFor, bodyweight, sessions }: Props) {
  const [view, setView] = useState(VIEW_TREND);
  const tracked = ALL_EXERCISES.filter((e) => history[e.id]?.length);
  const [selected, setSelected] = useState(tracked[0]?.id ?? "back_squat");

  const points = (history[selected] ?? []).map((p) => ({
    date: p.date.slice(5),
    e1rm: p.e1rm,
  }));

  return (
    <>
      <div className="pills">
        <button
          className={`pill ${view === VIEW_TREND ? "is-on" : ""}`}
          onClick={() => setView(VIEW_TREND)}
          aria-pressed={view === VIEW_TREND}
        >
          Trend
        </button>
        <button
          className={`pill ${view === VIEW_HISTORY ? "is-on" : ""}`}
          onClick={() => setView(VIEW_HISTORY)}
          aria-pressed={view === VIEW_HISTORY}
        >
          History
        </button>
      </div>

      {view === VIEW_HISTORY ? (
        <SessionHistory sessions={sessions} history={history} />
      ) : (
        <>
          <h2 className="section">Estimated 1RM over time</h2>

          <div className="pills">
            {tracked.map((e) => (
              <button
                key={e.id}
                className={`pill ${selected === e.id ? "is-on" : ""}`}
                onClick={() => setSelected(e.id)}
                aria-pressed={selected === e.id}
              >
                {e.name}
              </button>
            ))}
          </div>

          {points.length > 1 ? (
            <div className="chart">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={points} margin={{ top: 8, right: 12, bottom: 4, left: -14 }}>
                  <XAxis dataKey="date" stroke="var(--muted)" tick={{ fontSize: 11 }} />
                  <YAxis stroke="var(--muted)" tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--panel)",
                      border: "1px solid var(--line)",
                      borderRadius: 6,
                      color: "var(--chalk)",
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="e1rm"
                    stroke="var(--accent)"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "var(--accent)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="empty">One data point so far. Log this lift again and the line draws itself.</p>
          )}

          <h2 className="section">Benchmarks &middot; multiples of bodyweight</h2>
          <p className="section-note">
            General strength-and-conditioning rules of thumb for a field-sport athlete, not
            research-derived cutoffs. Direction, not a verdict.
          </p>

          <table className="table">
            <thead>
              <tr>
                <th scope="col">Lift</th>
                <th scope="col">Now</th>
                <th scope="col">Solid</th>
                <th scope="col">Strong</th>
              </tr>
            </thead>
            <tbody>
              {BENCHMARKS.map((b) => {
                const current = bestFor(b.exId);
                const solid = Math.round(bodyweight * b.solid);
                const strong = Math.round(bodyweight * b.strong);
                const state =
                  current === null ? "" : current >= strong ? "is-strong" : current >= solid ? "is-solid" : "";
                return (
                  <tr key={b.exId}>
                    <th scope="row">{b.label}</th>
                    <td className={state}>{current ? Math.round(current) : "—"}</td>
                    <td>{solid}</td>
                    <td>{strong}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <h2 className="section">How the target is set</h2>
          <div className="prose">
            <p>
              Your prescribed load is your best estimated 1RM run backwards through the Epley formula at
              the target reps <em>plus</em> the target RIR. Beat a set, the e1RM moves, and next
              session&rsquo;s number moves with it.
            </p>
            <p>
              Weeks 1&ndash;3 add 1.5% per week on top of that. Week 4 backs off to 85% and adds 2 to
              every RIR. <strong>Stalled</strong> appears when the last four e1RMs on a lift sit within
              2% of each other &mdash; the signal to change the variation, not to push harder.
            </p>
          </div>
        </>
      )}
    </>
  );
}

function SessionHistory({
  sessions,
  history,
}: {
  sessions: Session[];
  history: Record<string, HistoryPoint[]>;
}) {
  const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date));

  if (sorted.length === 0) {
    return <p className="empty">No sessions logged yet.</p>;
  }

  return (
    <ul className="history">
      {sorted.map((session) => {
        const day = DAYS.find((d) => d.id === session.dayId);
        const exIds = [...new Set(session.entries.map((e) => e.exId))];

        return (
          <li className="history__day card" key={session.id}>
            <div className="history__head">
              <span className="history__date">{session.date}</span>
              <span className="history__label">{day?.label ?? session.dayId}</span>
            </div>
            <ul className="history__exercises">
              {exIds.map((exId) => {
                const exercise = findExercise(exId);
                const point = history[exId]?.find((p) => p.date === session.date);
                if (!exercise || !point) return null;
                return (
                  <li key={exId} className="history__exercise">
                    <span className="history__ex-name">{exercise.name}</span>
                    <span className="history__ex-detail">
                      {point.sets.length} set{point.sets.length > 1 ? "s" : ""} &middot; best {point.weight}
                      &times;{point.reps}
                    </span>
                  </li>
                );
              })}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}
