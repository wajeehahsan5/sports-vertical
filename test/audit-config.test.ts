import { describe, expect, it } from "vitest";
import { QUESTIONS, SPORTS } from "@/config/audit";

describe("audit config", () => {
  it("has 9 questions, 3 per pillar, keys q1..q9 in order", () => {
    expect(QUESTIONS.map((q) => q.key)).toEqual(["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9"]);
    for (const p of ["identity", "content", "home"]) expect(QUESTIONS.filter((q) => q.pillar === p)).toHaveLength(3);
  });

  it("gives every question options a–d worth 3,2,1,0", () => {
    for (const q of QUESTIONS) {
      expect(q.options.map((o) => [o.value, o.points])).toEqual([["a", 3], ["b", 2], ["c", 1], ["d", 0]]);
    }
  });

  it("has a finding on every 0–1 point option and none above", () => {
    for (const q of QUESTIONS) for (const o of q.options) expect(Boolean(o.finding)).toBe(o.points <= 1);
  });

  it("has no em dashes in customer-facing text", () => {
    const text = JSON.stringify([QUESTIONS, SPORTS]);
    expect(text).not.toContain("—");
  });
});
