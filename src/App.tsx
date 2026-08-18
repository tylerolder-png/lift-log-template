import { lazy, Suspense, useRef, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { DAYS } from "./data/program";
import { useLiftLog } from "./hooks/useLiftLog";
import { buildBackup, parseBackup } from "./lib/backup";
import { epley } from "./lib/oneRepMax";
import { isNewPR } from "./lib/pr";
import { isDeloadWeek } from "./lib/progression";
import { hasSeenWelcome, markWelcomeSeen } from "./lib/storage";
import { currentStreak } from "./lib/streak";
import type { SetEntry } from "./lib/types";
import { ExerciseCard, type DraftSet } from "./components/ExerciseCard";
import { FlipNumber } from "./components/FlipNumber";
import { Welcome } from "./components/Welcome";

/** Window to tap "Reset to baseline" again before the confirm state clears. */
const RESET_CONFIRM_MS = 4000;

const ProgressView = lazy(() =>
  import("./components/ProgressView").then((m) => ({ default: m.ProgressView })),
);

const PROGRESS_TAB = "progress";
const EMPTY_DRAFT: DraftSet = { weight: "", reps: "" };

export default function App() {
  const log = useLiftLog();
  const [welcomed, setWelcomed] = useState(hasSeenWelcome);
  const [tab, setTab] = useState(DAYS[0]!.id);
  const [draft, setDraft] = useState<Record<string, DraftSet[]>>({});
  const [toast, setToast] = useState("");
  const [confirmingReset, setConfirmingReset] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  const activeDay = DAYS.find((d) => d.id === tab);
  const deload = isDeloadWeek(log.week);
  const streak = currentStreak(log.sessions);

  function flash(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  function handleResetClick() {
    if (!confirmingReset) {
      setConfirmingReset(true);
      window.setTimeout(() => setConfirmingReset(false), RESET_CONFIRM_MS);
      return;
    }
    log.resetToSeed();
    setConfirmingReset(false);
    flash("Reset to baseline.");
  }

  function handleExport() {
    const backup = buildBackup(log.profile, log.sessions);
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lift-log-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    flash("Backup downloaded.");
  }

  async function handleImportFile(file: File) {
    let backup;
    try {
      backup = parseBackup(await file.text());
    } catch (err) {
      flash(err instanceof Error ? err.message : "Couldn't read that backup file.");
      return;
    }
    if (!window.confirm("Replace current data with this backup? This can't be undone.")) return;
    log.importBackup(backup);
    flash("Backup restored.");
  }

  function rowsFor(exId: string): DraftSet[] {
    return draft[exId] ?? [EMPTY_DRAFT];
  }

  function updateRows(exId: string, updater: (rows: DraftSet[]) => DraftSet[]) {
    setDraft((prev) => ({ ...prev, [exId]: updater(prev[exId] ?? [EMPTY_DRAFT]) }));
  }

  function handleSave() {
    if (!activeDay) return;
    const entries: SetEntry[] = [];
    const newPRs: string[] = [];

    for (const exercise of activeDay.exercises) {
      const prevBest = log.bestFor(exercise.id);
      let sessionBestE1rm = -Infinity;
      let loggedAny = false;

      for (const row of rowsFor(exercise.id)) {
        const reps = Number(row.reps);
        if (!Number.isFinite(reps) || reps < 1) continue;
        const weight = row.weight === "" ? 0 : Number(row.weight);
        if (!Number.isFinite(weight)) continue;

        entries.push({ exId: exercise.id, weight, reps });
        loggedAny = true;

        const load = exercise.bodyweight ? log.profile.bodyweight + weight : weight;
        sessionBestE1rm = Math.max(sessionBestE1rm, epley(load, reps));
      }

      if (loggedAny && isNewPR(prevBest, sessionBestE1rm)) {
        newPRs.push(exercise.name);
      }
    }

    if (entries.length === 0) {
      flash("Enter at least one set before saving.");
      return;
    }

    log.addSession(activeDay.id, entries);
    setDraft({});

    const setWord = `${entries.length} set${entries.length > 1 ? "s" : ""}`;
    const prSuffix = newPRs.length > 0 ? ` New PR: ${newPRs.join(", ")}!` : "";
    flash(`Logged ${setWord}.${prSuffix}`);
  }

  if (!welcomed) {
    return (
      <Welcome
        onDismiss={() => {
          markWelcomeSeen();
          setWelcomed(true);
        }}
      />
    );
  }

  if (!log.ready) {
    return (
      <div className="app">
        <p className="empty">Loading the log&hellip;</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="masthead">
        <div>
          <p className="masthead__eyebrow">Strength &middot; Athleticism &middot; Aesthetics</p>
          <h1 className="masthead__title">The Log</h1>
        </div>
        <div className={`masthead__week ${deload ? "is-deload" : ""}`}>
          <FlipNumber value={log.week} className="masthead__week-num" />
          <span className="masthead__week-label">{deload ? "Deload" : "Build"}</span>
        </div>
      </header>

      <div className="settings">
        <label className="settings__field">
          <span>Bodyweight</span>
          <input
            type="number"
            inputMode="decimal"
            value={log.profile.bodyweight}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (Number.isFinite(v) && v > 0) log.updateProfile({ bodyweight: v });
            }}
          />
        </label>
        <label className="settings__field">
          <span>Block start</span>
          <input
            type="date"
            value={log.profile.blockStart}
            onChange={(e) => log.updateProfile({ blockStart: e.target.value })}
          />
        </label>
        {streak > 0 && (
          <div className="settings__field settings__field--static">
            <span>Streak</span>
            <span className="settings__value">
              {streak} day{streak > 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      <div className="backup">
        <button type="button" className="backup__btn" onClick={handleExport}>
          Export backup
        </button>
        <button type="button" className="backup__btn" onClick={() => importInputRef.current?.click()}>
          Import backup
        </button>
        <input
          ref={importInputRef}
          type="file"
          accept="application/json"
          className="backup__file-input"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) void handleImportFile(file);
          }}
        />
      </div>

      {deload && (
        <p className="banner">
          Deload week &mdash; halve the sets. Loads below are already backed off.
        </p>
      )}

      {activeDay && (
        <main>
          <h2 className="section">{activeDay.sub}</h2>

          {activeDay.exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              best={log.bestFor(exercise.id)}
              history={log.history[exercise.id] ?? []}
              stalled={log.isStalled(exercise.id)}
              week={log.week}
              bodyweight={log.profile.bodyweight}
              sets={rowsFor(exercise.id)}
              onSetChange={(index, patch) =>
                updateRows(exercise.id, (rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)))
              }
              onAddSet={() => updateRows(exercise.id, (rows) => [...rows, EMPTY_DRAFT])}
              onRemoveSet={(index) =>
                updateRows(exercise.id, (rows) => (rows.length > 1 ? rows.filter((_, i) => i !== index) : rows))
              }
            />
          ))}

          <div className="actions">
            <button className="actions__save" onClick={handleSave}>
              Save {activeDay.label}
            </button>
            <button
              className={`actions__reset ${confirmingReset ? "is-confirming" : ""}`}
              onClick={handleResetClick}
            >
              {confirmingReset ? "Tap again to confirm" : "Reset to baseline"}
            </button>
          </div>
        </main>
      )}

      {tab === PROGRESS_TAB && (
        <main>
          <Suspense fallback={<p className="empty">Loading progress&hellip;</p>}>
            <ProgressView
              history={log.history}
              bestFor={log.bestFor}
              bodyweight={log.profile.bodyweight}
              sessions={log.sessions}
            />
          </Suspense>
        </main>
      )}

      <nav className="dock" role="tablist" aria-label="Training day">
        {DAYS.map((d) => (
          <button
            key={d.id}
            role="tab"
            aria-selected={tab === d.id}
            className={`dock__tab ${tab === d.id ? "is-on" : ""}`}
            onClick={() => setTab(d.id)}
          >
            {d.label}
          </button>
        ))}
        <button
          role="tab"
          aria-selected={tab === PROGRESS_TAB}
          className={`dock__tab ${tab === PROGRESS_TAB ? "is-on" : ""}`}
          onClick={() => setTab(PROGRESS_TAB)}
        >
          Progress
        </button>
      </nav>

      <div className="toast-stack">
        {toast && (
          <p className="toast" role="status">
            {toast}
          </p>
        )}

        {needRefresh && (
          <button
            type="button"
            className="toast toast--update"
            onClick={() => updateServiceWorker(true)}
          >
            Update available &mdash; tap to refresh
          </button>
        )}
      </div>
    </div>
  );
}
