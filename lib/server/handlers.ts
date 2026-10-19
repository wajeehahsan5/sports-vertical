import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { scoreAudit } from "@/lib/audit/score";
import { bookUrl, envValue, rescheduleUrl, sendSportsEvent, validOutcomeToken } from "./automation";
import { sendLeadAlert, sendScoreEmail } from "./email";
import { clientIp, overLimit } from "./rate-limit";
import { getStore } from "./store";
import * as v from "./validate";

/**
 * The site's whole backend, as two plain Request → Response handlers.
 * Live, they run in the Supabase Edge Function `sports` (edge/sports.ts), because the
 * site itself is static files on Hostinger. In `npm run dev` the same handlers sit
 * behind app/api/{lead,cal}/route.dev.ts.
 *
 * handleLead: POST { action }
 *   audit      save the audit + handles, alert Wajeeh, email the score (first time only)
 *   booked     store the Cal.com booking
 *   book-lead  name/email/handles for /book/?a=<id>, to prefill Cal (the id is an unguessable UUID)
 *   call-lead  the lead for Wajeeh's /call page (HMAC-token gated)
 *   outcome    Wajeeh logs the call (HMAC-token gated)
 */
const ACTIONS = ["audit", "booked", "book-lead", "call-lead", "outcome"] as const;
type Action = (typeof ACTIONS)[number];
const MAX_JSON_BYTES = 32 * 1024;
/** Leads per rolling day, counted in the database so it holds across server instances. */
const DAILY_CAP = 300;

const LIMIT_FOR: Record<Action, Parameters<typeof overLimit>[0]> = {
  audit: "audit",
  booked: "booked",
  "book-lead": "lookup",
  "call-lead": "lookup",
  outcome: "outcome",
};

export async function handleLead(request: Request): Promise<Response> {
  if (Number(request.headers.get("content-length") ?? 0) > MAX_JSON_BYTES) return json({ error: "Request too large." }, 413);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  const action = ACTIONS.find((a) => a === body.action);
  if (!action) return json({ error: "Unknown action." }, 400);
  if (overLimit(LIMIT_FOR[action], clientIp(request))) {
    return json({ error: "Too many tries from this connection. Give it a few minutes and try again." }, 429);
  }

  try {
    const store = getStore();
    switch (action) {
      case "audit": {
        const sub = v.submission(body);
        // Reuse a client-sent id only if that lead already exists; new leads always get a server id,
        // so a script can't dodge the site-wide cap by inventing ids.
        const known = body.id ? v.leadId(body.id) : null;
        const id = known && (await store.exists(known)) ? known : crypto.randomUUID();
        if (id !== known && (overLimit("global-audit", "site") || (await store.countSince(Date.now() - 864e5)) >= DAILY_CAP)) {
          return json({ error: "We're getting a lot of audits right now. Try again in a little while." }, 429);
        }
        const result = scoreAudit(sub.answers, sub.sport); // never trust a client score
        const attr = v.attribution(body.attribution);
        await store.saveAudit(id, sub, result, {
          attribution: attr,
          userAgent: (request.headers.get("user-agent") ?? "").slice(0, 300),
        });
        // Exactly one request per lead wins the claim, so a resubmit, a race or a failed send never repeats emails.
        if (await store.claimAlert(id)) {
          await sendLeadAlert(id, sub, result, attr);
          await sendScoreEmail(id, sub, result);
          await sendSportsEvent("sports.audited", sub.contact, { book_url: bookUrl(id), package: result.pkg });
        }
        return json({ id, result });
      }

      case "booked": {
        const id = v.leadId(body.id);
        const b = v.booking(body.booking);
        const before = await store.get(id);
        if (!before) return json({ error: "Audit not found." }, 404);
        await store.booked(id, b);
        // The Cal.com webhook may have got here first; only the first arrival fires the event.
        if (before.status !== "booked") await sendSportsEvent("sports.booked", before, { reschedule_url: rescheduleUrl(b.uid) });
        return json({ ok: true });
      }

      case "book-lead": {
        const lead = await store.get(v.leadId(body.id));
        if (!lead) return json({ error: "Not found." }, 404);
        return json({ name: lead.name, email: lead.email, whatsapp: lead.whatsapp, instagram: lead.instagram });
      }

      case "call-lead": {
        const id = v.leadId(body.id);
        if (!validOutcomeToken(id, body.k)) return json({ error: "Not found." }, 404);
        const lead = await store.get(id);
        if (!lead) return json({ error: "Not found." }, 404);
        return json({ name: lead.name, email: lead.email, instagram: lead.instagram, status: lead.status });
      }

      case "outcome": {
        const id = v.leadId(body.id);
        if (!validOutcomeToken(id, body.k)) return json({ error: "Not found." }, 404);
        const o = v.outcome(body.outcome);
        await store.setStatus(id, o);
        const lead = await store.get(id);
        if (o === "no_show" && lead) await sendSportsEvent("sports.no_show", lead, { book_url: bookUrl(id) });
        return json({ ok: true });
      }
    }
  } catch (err) {
    if (err instanceof v.ValidationError) return json({ error: err.message }, 422);
    console.error("[lead]", err);
    return json({ error: "Something went wrong on our side. Try again." }, 500);
  }
}

/**
 * Cal.com webhook (BOOKING_CREATED / BOOKING_RESCHEDULED). The booking step passes
 * metadata[leadId] to Cal, so the booking lands on the lead even when the athlete's
 * browser never reports back (tab closed, signal lost). The browser callback still
 * runs too; whichever arrives second is a no-op for the automation event.
 */
const MAX_CAL_BYTES = 64 * 1024;
const TRIGGERS = new Set(["BOOKING_CREATED", "BOOKING_RESCHEDULED"]);

function validSignature(raw: string, signature: string | null) {
  const secret = envValue(process.env.CAL_WEBHOOK_SECRET);
  if (!secret || secret.length < 24 || !signature) return false;
  const want = createHmac("sha256", secret).update(raw).digest("hex");
  return signature.length === want.length && timingSafeEqual(Buffer.from(want), Buffer.from(signature));
}

export async function handleCal(request: Request): Promise<Response> {
  const raw = await request.text();
  if (raw.length > MAX_CAL_BYTES) return json({ error: "Too large." }, 413);
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
    console.error("[cal]", err);
    return json({ error: "Something went wrong." }, 500);
  }
}

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "cache-control": "no-store" } });
}
