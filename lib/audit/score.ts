import { QUESTIONS, SPORTS, type PackageId, type Pillar, type QuestionKey, type SportId } from "@/config/audit";

export type Band = "good" | "getting" | "grow";
export type PillarScore = { score: number; band: Band };
export type AuditResult = { overall: number; pillars: Record<Pillar, PillarScore>; findings: string[]; pkg: PackageId };

export class AuditError extends Error {}

/** 7–9 Looking good · 4–6 Getting there · 0–3 Room to grow (per pillar, out of 9). */
export const bandFor = (score: number): Band => (score >= 7 ? "good" : score >= 4 ? "getting" : "grow");

// Ties go to the first pillar in this list.
const PRIORITY: Pillar[] = ["content", "identity", "home"];
const PILLAR_PACKAGE: Record<Pillar, PackageId> = { identity: "weigh-in", content: "camp", home: "title-run" };

/** Fills {event}/{events} with the sport's own word ("fight", "match"). */
export function fill(text: string, sport: SportId) {
  const s = SPORTS.find((x) => x.value === sport) ?? SPORTS[SPORTS.length - 1];
  return text.replaceAll("{events}", s.events).replaceAll("{event}", s.event);
}

/** Pure: the same answers always give the same result, on the client and on the server. */
export function scoreAudit(answers: Partial<Record<QuestionKey, string>>, sport: SportId): AuditResult {
  const totals: Record<Pillar, number> = { identity: 0, content: 0, home: 0 };
  const weak: { points: number; order: number; text: string }[] = [];

  QUESTIONS.forEach((q, order) => {
    const option = q.options.find((o) => o.value === answers[q.key]);
    if (!option) throw new AuditError(`Missing answer: ${q.key}.`);
    totals[q.pillar] += option.points;
    if (option.finding) weak.push({ points: option.points, order, text: fill(option.finding, sport) });
  });

  const pillars = Object.fromEntries(
    (Object.keys(totals) as Pillar[]).map((p) => [p, { score: totals[p], band: bandFor(totals[p]) }]),
  ) as Record<Pillar, PillarScore>;

  const findings = weak
    .sort((a, b) => a.points - b.points || a.order - b.order)
    .slice(0, 3)
    .map((w) => w.text);

  const lowCount = PRIORITY.filter((p) => totals[p] <= 6).length;
  const lowest = PRIORITY.reduce((min, p) => (totals[p] < totals[min] ? p : min), PRIORITY[0]);
  const pkg: PackageId = lowCount >= 2 ? "title-run" : PILLAR_PACKAGE[lowest];

  const total = totals.identity + totals.content + totals.home;
  return { overall: Math.round((total / 27) * 100), pillars, findings, pkg };
}
