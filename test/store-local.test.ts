import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { QUESTIONS } from "@/config/audit";
import { scoreAudit } from "@/lib/audit/score";
import { LocalStore } from "@/lib/server/store";
import type { AuditSubmission } from "@/lib/server/validate";

const sub: AuditSubmission = {
  sport: "mma",
  level: "regional",
  answers: Object.fromEntries(QUESTIONS.map((q) => [q.key, "c"])) as AuditSubmission["answers"],
  contact: { name: "Kai", email: "kai@example.com", instagram: "kai", tiktok: "", youtube: "", website: "", whatsapp: "", basedIn: "uk" },
};
const meta = { attribution: { ref: "sk" }, userAgent: "test" };
const id = "11111111-1111-4111-8111-111111111111";

let dir: string;
beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "sports-store-"));
});
afterEach(async () => {
  await fs.rm(dir, { recursive: true, force: true });
});

describe("LocalStore", () => {
  it("alerts once per audit, even when it is submitted twice", async () => {
    const store = new LocalStore(dir);
    const r = scoreAudit(sub.answers, sub.sport);
    expect(await store.saveAudit(id, sub, r, meta)).toEqual({ alreadyAlerted: false });
    await store.markAlerted(id);
    expect(await store.saveAudit(id, sub, r, meta)).toEqual({ alreadyAlerted: true });
  });

  it("never downgrades a booked lead on resubmit, and keeps the first ref", async () => {
    const store = new LocalStore(dir);
    const r = scoreAudit(sub.answers, sub.sport);
    await store.saveAudit(id, sub, r, meta);
    await store.booked(id, { uid: "u1", startTime: new Date().toISOString() });
    await store.saveAudit(id, sub, r, { attribution: {}, userAgent: "test" });
    const row = await store.get(id);
    expect(row?.status).toBe("booked");
    expect(row?.ref).toBe("sk");
  });
});
