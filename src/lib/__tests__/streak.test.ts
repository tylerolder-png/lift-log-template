import { describe, expect, it } from "vitest";
import { currentStreak } from "../streak";
import type { Session } from "../types";

function sessionOn(date: string): Session {
  return { id: `s-${date}`, date, dayId: "lowerA", entries: [] };
}

describe("currentStreak", () => {
  it("is zero with no sessions", () => {
    expect(currentStreak([], new Date("2026-08-16T12:00:00"))).toBe(0);
  });

  it("counts consecutive days ending today", () => {
    const sessions = [sessionOn("2026-08-14"), sessionOn("2026-08-15"), sessionOn("2026-08-16")];
    expect(currentStreak(sessions, new Date("2026-08-16T12:00:00"))).toBe(3);
  });

  it("stays alive counting from yesterday when today has no session yet", () => {
    const sessions = [sessionOn("2026-08-14"), sessionOn("2026-08-15")];
    expect(currentStreak(sessions, new Date("2026-08-16T08:00:00"))).toBe(2);
  });

  it("breaks once a day is skipped", () => {
    const sessions = [sessionOn("2026-08-10"), sessionOn("2026-08-15"), sessionOn("2026-08-16")];
    expect(currentStreak(sessions, new Date("2026-08-16T12:00:00"))).toBe(2);
  });

  it("is zero once two days have passed with nothing logged", () => {
    const sessions = [sessionOn("2026-08-13")];
    expect(currentStreak(sessions, new Date("2026-08-16T12:00:00"))).toBe(0);
  });

  it("ignores multiple sessions on the same day", () => {
    const sessions = [
      { id: "a", date: "2026-08-16", dayId: "lowerA", entries: [] },
      { id: "b", date: "2026-08-16", dayId: "upperA", entries: [] },
    ];
    expect(currentStreak(sessions, new Date("2026-08-16T12:00:00"))).toBe(1);
  });
});
