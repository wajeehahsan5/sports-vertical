import { scoreAudit } from "@/lib/audit/score";
import { bookUrl, rescheduleUrl, sendSportsEvent, validOutcomeToken } from "@/lib/server/automation";
import { sendLeadAlert, sendScoreEmail } from "@/lib/server/email";
import { clientIp, overLimit } from "@/lib/server/rate-limit";
import { getStore } from "@/lib/server/store";
import * as v from "@/lib/server/validate";

/**
 * The one API route.
 *   POST { action: "audit" }   → save the audit + handles, alert Wajeeh, email the score (first time only)
 *   POST { action: "booked" }  → store the Cal.com booking
 *   POST { action: "outcome" } → Wajeeh logs the call (/call/[id], HMAC-token gated)
 */
const ACTIONS = ["audit", "booked", "outcome"] as const;
type Action = (typeof ACTIONS)[number];
const MAX_JSON_BYTES = 32 * 1024;

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > MAX_JSON_BYTES) return json({ error: "Request too large." }, 413);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  const action = ACTIONS.find((a) => a === body.action) as Action | undefined;
  if (!action) return json({ error: "Unknown action." }, 400);
  if (overLimit(action, clientIp(request))) {
    return json({ error: "Too many tries from this connection. Give it a few minutes and try again." }, 429);
  }

  try {
    const store = getStore();
    switch (action) {
      case "audit": {
        if (!body.id && overLimit("global-audit", "site")) {
          return json({ error: "We're getting a lot of audits right now. Try again in a little while." }, 429);
        }
        const id = body.id ? v.leadId(body.id) : crypto.randomUUID();
        const sub = v.submission(body);
        const result = scoreAudit(sub.answers, sub.sport); // never trust a client score
        const attr = v.attribution(body.attribution);
        const { alreadyAlerted } = await store.saveAudit(id, sub, result, {
          attribution: attr,
          userAgent: (request.headers.get("user-agent") ?? "").slice(0, 300),
        });
        if (!alreadyAlerted) {
          const sent = await sendLeadAlert(id, sub, result, attr);
          if (sent) await store.markAlerted(id);
          await sendScoreEmail(id, sub, result);
          await sendSportsEvent("sports.audited", sub.contact, { book_url: bookUrl(id), package: result.pkg });
        }
        return json({ id, result });
      }

      case "booked": {
        const id = v.leadId(body.id);
        const b = v.booking(body.booking);
        await store.booked(id, b);
        const lead = await store.get(id);
        if (lead) await sendSportsEvent("sports.booked", lead, { reschedule_url: rescheduleUrl(b.uid) });
        return json({ ok: true });
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
    console.error("[api/lead]", err);
    return json({ error: "Something went wrong on our side. Try again." }, 500);
  }
}

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "cache-control": "no-store" } });
}
