import { useCallback, useEffect, useMemo, useState } from "react";
import { todayLocal } from "../lib/date";
import { epley } from "../lib/oneRepMax";
import { detectPlateau, weekOfBlock } from "../lib/progression";
import { localStore, type LiftStore } from "../lib/storage";
import type { HistoryPoint, Profile, SetEntry, Session } from "../lib/types";
import { findExercise } from "../data/program";
import { DEFAULT_PROFILE, SEED_SESSIONS } from "../data/seed";

export function useLiftLog(store: LiftStore = localStore) {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [p, s] = await Promise.all([store.loadProfile(), store.loadSessions()]);
      if (cancelled) return;
      if (p) setProfile(p);
      setSessions(s?.length ? s : SEED_SESSIONS);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [store]);

  const updateProfile = useCallback(
    (patch: Partial<Profile>) => {
      setProfile((prev) => {
        const next = { ...prev, ...patch };
        void store.saveProfile(next);
        return next;
      });
    },
    [store],
  );

  const addSession = useCallback(
    (dayId: string, entries: SetEntry[]) => {
      setSessions((prev) => {
        const next: Session[] = [
          ...prev,
          {
            id: `s-${Date.now()}`,
            date: todayLocal(),
            dayId,
            entries,
          },
        ];
        void store.saveSessions(next);
        return next;
      });
    },
    [store],
  );

  const resetToSeed = useCallback(() => {
    setSessions(SEED_SESSIONS);
    void store.saveSessions(SEED_SESSIONS);
  }, [store]);

  const importBackup = useCallback(
    (backup: { profile: Profile; sessions: Session[] }) => {
      setProfile(backup.profile);
      setSessions(backup.sessions);
      void store.saveProfile(backup.profile);
      void store.saveSessions(backup.sessions);
    },
    [store],
  );

  /**
   * Per-exercise estimated 1RM history, oldest first — one point per
   * (session, exercise), even when multiple sets were logged that
   * session. The e1RM model only ever looks at the best set of the
   * session; the other sets ride along on `sets` for volume display.
   */
  const history = useMemo(() => {
    const map: Record<string, HistoryPoint[]> = {};
    const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
    for (const session of sorted) {
      const byExercise = new Map<string, SetEntry[]>();
      for (const entry of session.entries) {
        const group = byExercise.get(entry.exId);
        if (group) group.push(entry);
        else byExercise.set(entry.exId, [entry]);
      }

      for (const [exId, sets] of byExercise) {
        const exercise = findExercise(exId);
        if (!exercise) continue;

        let best = sets[0]!;
        let bestE1rm = -Infinity;
        for (const set of sets) {
          const load = exercise.bodyweight ? profile.bodyweight + set.weight : set.weight;
          const e1rm = epley(load, set.reps);
          if (e1rm > bestE1rm) {
            bestE1rm = e1rm;
            best = set;
          }
        }

        (map[exId] ??= []).push({
          date: session.date,
          e1rm: Math.round(bestE1rm * 10) / 10,
          weight: best.weight,
          reps: best.reps,
          sets,
        });
      }
    }
    return map;
  }, [sessions, profile.bodyweight]);

  const bestFor = useCallback(
    (exId: string): number | null => {
      const points = history[exId];
      if (!points?.length) return null;
      return Math.max(...points.map((p) => p.e1rm));
    },
    [history],
  );

  const isStalled = useCallback((exId: string) => detectPlateau(history[exId] ?? []), [history]);

  const week = useMemo(() => weekOfBlock(profile.blockStart), [profile.blockStart]);

  return {
    ready,
    profile,
    updateProfile,
    sessions,
    addSession,
    resetToSeed,
    importBackup,
    history,
    bestFor,
    isStalled,
    week,
  };
}
