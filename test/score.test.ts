import { describe, expect, it } from "vitest";
import { QUESTIONS, type QuestionKey } from "@/config/audit";
import { AuditError, bandFor, scoreAudit } from "@/lib/audit/score";

/** Answer every question with the option worth `points`, or per-pillar overrides. */
function answers(points: number, overrides: Partial<Record<"identity" | "content" | "home", number>> = {}) {
  return Object.fromEntries(
    QUESTIONS.map((q) => {
      const p = overrides[q.pillar] ?? points;
      return [q.key, q.options.find((o) => o.points === p)!.value];
    }),
  ) as Record<QuestionKey, string>;
}

describe("bandFor", () => {
  it("maps 7–9 good, 4–6 getting, 0–3 grow", () => {
    expect([9, 7, 6, 4, 3, 0].map(bandFor)).toEqual(["good", "good", "getting", "getting", "grow", "grow"]);
  });
});

describe("scoreAudit", () => {
  it("scores a perfect audit 100 with no findings", () => {
    const r = scoreAudit(answers(3), "mma");
    expect(r.overall).toBe(100);
    expect(r.pillars.identity).toEqual({ score: 9, band: "good" });
    expect(r.findings).toEqual([]);
    expect(r.pkg).toBe("camp"); // all tied: content wins ties
  });

  it("scores all zeros 0, three findings, Title Run", () => {
    const r = scoreAudit(answers(0), "boxing");
    expect(r.overall).toBe(0);
    expect(r.pillars.home).toEqual({ score: 0, band: "grow" });
    expect(r.findings).toHaveLength(3);
    expect(r.pkg).toBe("title-run");
  });

  it("rounds the overall score", () => {
    // identity 9 + content 3 + home 1 = 13 → 13/27 = 48.1 → 48
    const a = answers(3);
    const r0 = scoreAudit({ ...a, q4: "c", q5: "c", q6: "c", q7: "c", q8: "d", q9: "d" }, "mma");
    expect(r0.pillars.content.score).toBe(3);
    expect(r0.pillars.home.score).toBe(1);
    expect(r0.overall).toBe(48);
  });

  it("points a low Identity pillar alone at Weigh-In", () => {
    expect(scoreAudit(answers(3, { identity: 0 }), "mma").pkg).toBe("weigh-in");
  });

  it("points a low Content pillar alone at Camp", () => {
    expect(scoreAudit(answers(3, { content: 1 }), "mma").pkg).toBe("camp");
  });

  it("points a low Home base pillar alone at Title Run", () => {
    expect(scoreAudit(answers(3, { home: 1 }), "mma").pkg).toBe("title-run");
  });

  it("points two pillars at 6 or below at Title Run", () => {
    expect(scoreAudit(answers(3, { identity: 2, content: 2 }), "mma").pkg).toBe("title-run");
  });

  it("lists the lowest findings first and caps them at three", () => {
    const a = { ...answers(3), q2: "c", q5: "d", q8: "c", q9: "d" }; // two 0-point, two 1-point
    const r = scoreAudit(a, "mma");
    expect(r.findings).toHaveLength(3);
    const q5 = QUESTIONS.find((q) => q.key === "q5")!.options.find((o) => o.value === "d")!.finding!;
    expect(r.findings[0]).toBe(q5.replaceAll("{events}", "fights").replaceAll("{event}", "fight"));
  });

  it("tailors the event word to the sport", () => {
    const a = { ...answers(3), q6: "d" };
    expect(scoreAudit(a, "football").findings[0]).toContain("match");
    expect(scoreAudit(a, "mma").findings[0]).toContain("fight");
    expect(scoreAudit(a, "football").findings[0]).not.toContain("{");
  });

  it("rejects a missing answer", () => {
    const { q3: _drop, ...a } = answers(3);
    expect(() => scoreAudit(a, "mma")).toThrow(AuditError);
  });

  it("rejects an answer value that is not an option", () => {
    expect(() => scoreAudit({ ...answers(3), q1: "z" }, "mma")).toThrow(AuditError);
  });
});
