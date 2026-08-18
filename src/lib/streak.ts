import { todayLocal } from "./date";
import type { Session } from "./types";

/**
 * Consecutive calendar days, ending today or yesterday, with at least
 * one session logged. Ending "yesterday" (not just "today") means a
 * streak reads as still alive right up until the day actually lapses,
 * rather than dropping to zero the moment today's session isn't in yet.
 */
export function currentStreak(sessions: Session[], today: Date = new Date()): number {
  const days = new Set(sessions.map((s) => s.date));

  const cursor = new Date(`${todayLocal(today)}T00:00:00`);
  if (!days.has(todayLocal(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (days.has(todayLocal(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
