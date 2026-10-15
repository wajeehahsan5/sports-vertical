import { createHmac, timingSafeEqual } from "node:crypto";
import { envValue, rescheduleUrl, sendSportsEvent } from "@/lib/server/automation";
import { getStore } from "@/lib/server/store";
import * as v from "@/lib/server/validate";

/**
 * Cal.com webhook (BOOKING_CREATED / BOOKING_RESCHEDULED). The booking step passes
 * metadata[leadId] to Cal, so the booking lands on the lead even when the athlete's
 * browser never reports back (tab closed, signal lost). The browser callback still
 * runs too; whichever arrives second is a no-op for the automation event.
 *
 * Set up in Cal.com → Settings → Developer → Webhooks: URL https://sports.janobi.agency/api/cal,
 * those two triggers, and a secret that matches CAL_WEBHOOK_SECRET.
 */
const MAX_BYTES = 64 * 1024;
const TRIGGERS = new Set(["BOOKING_CREATED", "BOOKING_RESCHEDULED"]);

function validSignature(raw: string, signature: string | null) {
  const secret = envValue(process.env.CAL_WEBHOOK_SECRET);
  if (!secret || secret.length < 24 || !signature) return false;
  const want = createHmac("sha256", secret).update(raw).digest("hex");
  return signature.length === want.length && timingSafeEqual(Buffer.from(want), Buffer.from(signature));
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > MAX_BYTES) return json({ error: "Too large." }, 413);
  if (!validSignature(raw, request.headers.get("x-cal-signature-256"))) return json({ error: "Bad signature." }, 401);

  let body: { triggerEvent?: string; payload?: { uid?: string; startTime?: string; metadata?: { leadId?: string } } };
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: "Invalid JSON." }, 400);
  }
  // Anything we don't act on still gets a 200, so Cal doesn't keep retrying it.
  if (!TRIGGERS.has(body.triggerEvent ?? "")) return json({ ok: true, ignored: true });

  try {
    const id = v.leadId(body.payload?.metadata?.leadId);
    const b = v.booking({ uid: body.payload?.uid, startTime: body.payload?.startTime });
    const store = getStore();
    const before = await store.get(id);
    if (!before) return json({ ok: true, ignored: true });
    await store.booked(id, b);
    if (before.status !== "booked") await sendSportsEvent("sports.booked", before, { reschedule_url: rescheduleUrl(b.uid) });
    return json({ ok: true });
  } catch (err) {
    if (err instanceof v.ValidationError) return json({ ok: true, ignored: true });
    console.error("[api/cal]", err);
    return json({ error: "Something went wrong." }, 500);
  }
}

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "cache-control": "no-store" } });
}
