import { createHmac } from "node:crypto";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { QUESTIONS } from "@/config/audit";

// Route-level tests: real route handlers, the dev LocalStore in a temp dir, no Resend key (emails log instead).
let dir: string;
let ip = 0;
const SECRET = "test-cal-webhook-secret-1234567890";

beforeAll(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "sports-route-"));
  process.env.LOCAL_STORE_DIR = dir;
  process.env.CAL_WEBHOOK_SECRET = SECRET;
  delete process.env.RESEND_API_KEY;
});
afterAll(async () => {
  await fs.rm(dir, { recursive: true, force: true });
});

const audit = (extra: Record<string, unknown> = {}) => ({
  action: "audit",
  sport: "mma",
  level: "regional",
  answers: Object.fromEntries(QUESTIONS.map((q) => [q.key, "c"])),
  contact: { name: "Kai Test", email: "kai@example.com", instagram: "kai.test", basedIn: "uk" },
  ...extra,
});

async function post(body: unknown) {
  const { POST } = await import("@/app/api/lead/route");
  ip += 1; // a fresh IP per call keeps the per-IP limits out of the way
  const res = await POST(
    new Request("http://localhost/api/lead", {
      method: "POST",
      headers: { "content-type": "application/json", "x-real-ip": `10.0.0.${ip}` },
      body: JSON.stringify(body),
    }),
  );
  return { status: res.status, json: (await res.json()) as Record<string, unknown> };
}

const sentCount = (spy: ReturnType<typeof vi.spyOn>) =>
  spy.mock.calls.filter((c) => String(c[0]).includes("would have sent")).length;

describe("POST /api/lead audit", () => {
  it("never lets the client choose the id of a new lead", async () => {
    const chosen = "22222222-2222-4222-8222-222222222222";
    const r = await post(audit({ id: chosen }));
    expect(r.status).toBe(200);
    expect(r.json.id).not.toBe(chosen);
  });

  it("sends the alert and score email once per lead, even when sending fails", async () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const first = await post(audit());
    expect(sentCount(spy)).toBe(2); // alert + score email (logged, no Resend key)
    await post(audit({ id: first.json.id }));
    expect(sentCount(spy)).toBe(2);
    spy.mockRestore();
  });
});

describe("POST /api/cal (Cal.com webhook)", () => {
  async function cal(body: unknown, secret = SECRET) {
    const { POST } = await import("@/app/api/cal/route");
    const raw = JSON.stringify(body);
    const sig = createHmac("sha256", secret).update(raw).digest("hex");
    const res = await POST(
      new Request("http://localhost/api/cal", { method: "POST", headers: { "x-cal-signature-256": sig }, body: raw }),
    );
    return res.status;
  }

  it("marks the lead booked from a signed BOOKING_CREATED", async () => {
    const lead = await post(audit({ contact: { name: "Booked Kai", email: "booked@example.com", instagram: "booked.kai", basedIn: "us" } }));
    const id = lead.json.id as string;
    const status = await cal({
      triggerEvent: "BOOKING_CREATED",
      payload: { uid: "cal-uid-1", startTime: "2026-10-20T15:00:00.000Z", metadata: { leadId: id } },
    });
    expect(status).toBe(200);
    const row = JSON.parse(await fs.readFile(path.join(dir, `${id}.json`), "utf8"));
    expect(row.status).toBe("booked");
    expect(row.booking_uid).toBe("cal-uid-1");
  });

  it("rejects a bad signature", async () => {
    expect(await cal({ triggerEvent: "BOOKING_CREATED", payload: {} }, "wrong-secret-wrong-secret-wrong")).toBe(401);
  });
});
