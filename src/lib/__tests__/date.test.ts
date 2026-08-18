import { describe, expect, it } from "vitest";
import { todayLocal } from "../date";

describe("todayLocal", () => {
  it("formats as YYYY-MM-DD", () => {
    expect(todayLocal(new Date(2026, 7, 17, 14, 30))).toBe("2026-08-17");
  });

  it("pads single-digit months and days", () => {
    expect(todayLocal(new Date(2026, 0, 5, 9, 0))).toBe("2026-01-05");
  });

  it("does not roll over near midnight the way a UTC-based date would in a behind-UTC timezone", () => {
    // 11:30pm local, still the same local calendar day.
    const lateNight = new Date(2026, 7, 17, 23, 30);
    expect(todayLocal(lateNight)).toBe("2026-08-17");
  });
});
