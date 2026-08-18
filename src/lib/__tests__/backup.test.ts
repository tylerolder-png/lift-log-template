import { describe, expect, it } from "vitest";
import { BACKUP_VERSION, buildBackup, parseBackup } from "../backup";
import type { Profile, Session } from "../types";

const PROFILE: Profile = { bodyweight: 185, blockStart: "2026-08-10" };
const SESSIONS: Session[] = [
  { id: "s-1", date: "2026-08-11", dayId: "lowerA", entries: [{ exId: "back_squat", weight: 335, reps: 1 }] },
];

describe("buildBackup / parseBackup", () => {
  it("round-trips profile and sessions", () => {
    const backup = buildBackup(PROFILE, SESSIONS);
    const parsed = parseBackup(JSON.stringify(backup));
    expect(parsed.profile).toEqual(PROFILE);
    expect(parsed.sessions).toEqual(SESSIONS);
    expect(parsed.version).toBe(BACKUP_VERSION);
  });

  it("rejects invalid JSON", () => {
    expect(() => parseBackup("not json")).toThrow(/valid JSON/);
  });

  it("rejects a file with no version field", () => {
    expect(() => parseBackup(JSON.stringify({ profile: PROFILE, sessions: SESSIONS }))).toThrow(/version/);
  });

  it("rejects a future/unknown backup version", () => {
    const backup = { ...buildBackup(PROFILE, SESSIONS), version: 99 };
    expect(() => parseBackup(JSON.stringify(backup))).toThrow(/version/);
  });

  it("rejects a backup missing sessions", () => {
    expect(() => parseBackup(JSON.stringify({ version: BACKUP_VERSION, profile: PROFILE }))).toThrow(
      /session/,
    );
  });

  it("rejects a backup missing the profile", () => {
    expect(() => parseBackup(JSON.stringify({ version: BACKUP_VERSION, sessions: SESSIONS }))).toThrow(
      /profile/,
    );
  });
});
