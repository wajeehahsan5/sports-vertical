import { describe, expect, it } from "vitest";
import { QUESTIONS } from "@/config/audit";
import { scoreAudit } from "@/lib/audit/score";
import { renderLeadAlert, renderScoreEmail } from "@/lib/server/email";
import type { AuditSubmission } from "@/lib/server/validate";

const sub: AuditSubmission = {
  sport: "boxing",
  level: "regional",
  answers: Object.fromEntries(QUESTIONS.map((q) => [q.key, "c"])) as AuditSubmission["answers"],
  contact: { name: "Kai <Mercer>", email: "kai@example.com", instagram: "kai.mercer", tiktok: "", youtube: "", website: "", whatsapp: "+447700900123", basedIn: "uk" },
};
const id = "11111111-1111-4111-8111-111111111111";
const r = scoreAudit(sub.answers, sub.sport);

describe("renderLeadAlert", () => {
  it("names the athlete, sport, ref and links the Instagram", () => {
    const e = renderLeadAlert(id, sub, r, { ref: "sk" });
    expect(e.subject).toContain("Boxing");
    expect(e.subject).toContain(`${r.overall}`);
    expect(e.html).toContain("https://instagram.com/kai.mercer");
    expect(e.text).toContain("ref: sk");
  });
  it("escapes HTML in user input", () => {
    expect(renderLeadAlert(id, sub, r, {}).html).toContain("Kai &lt;Mercer&gt;");
  });
});

describe("renderScoreEmail", () => {
  it("shows the score, the three pillars and a book link, without em dashes", () => {
    const e = renderScoreEmail(id, sub, r);
    expect(e.html).toContain(`${r.overall}`);
    for (const label of ["Identity", "Content", "Home base"]) expect(e.html).toContain(label);
    expect(e.html).toContain(`/book/?a=${id}`);
    expect(e.html + e.subject + e.text).not.toContain("—");
  });
});
