import { describe, expect, it } from "vitest";
import { isNewPR } from "../pr";

describe("isNewPR", () => {
  it("is not a PR the first time an exercise is logged", () => {
    expect(isNewPR(null, 225)).toBe(false);
  });

  it("is a PR when the new e1RM beats the previous best", () => {
    expect(isNewPR(225, 230)).toBe(true);
  });

  it("is not a PR when the new e1RM ties or falls short", () => {
    expect(isNewPR(225, 225)).toBe(false);
    expect(isNewPR(225, 220)).toBe(false);
  });

  it("ignores float noise around a tie", () => {
    expect(isNewPR(225, 225.001)).toBe(false);
  });
});
