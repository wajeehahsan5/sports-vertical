import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Athlete email sequences. The emails, timing and stop rules live in Resend
 * automations (copy: janobi-sports/strategy/07-email-sequences.md). The site only
 * says what happened, as events:
 *   sports.audited  audit + handles done → "audited, not booked" sequence (S1)
 *   sports.booked   call booked           → confirmation (S2), stops S1 and S3
 *   sports.no_show  missed the call       → no-show sequence (S3)
 * Never throws: a Resend hiccup must not break the audit.
 */
export type SportsEvent = "sports.audited" | "sports.booked" | "sports.no_show";

const SITE = "https://sports.janobi.agency";
const API = "https://api.resend.com";

/** Host panels store values literally, so a pasted `"re_…"` keeps its quotes. Strip them. */
export const envValue = (v: string | undefined) => v?.trim().replace(/^(["'])(.*)\1$/, "$2") || undefined;

export const firstName =(full: string) => full.trim().split(/\s+/)[0] || "there";
export const bookUrl = (id: string) => `${SITE}/book/?a=${id}`;

export function rescheduleUrl(uid: string) {
  const origin = process.env.NEXT_PUBLIC_CAL_ORIGIN || "https://cal.com";
  return uid ? `${origin}/reschedule/${encodeURIComponent(uid)}` : `${origin}/${process.env.NEXT_PUBLIC_CAL_LINK ?? ""}`;
}

export async function sendSportsEvent(event: SportsEvent, to: { email: string; name: string }, payload: Record<string, string>) {
  const key = envValue(process.env.RESEND_API_KEY);
  if (!key) {
    if (process.env.NODE_ENV !== "production") console.info(`[automation:dev] ${event} → ${to.email}`, payload);
    return false;
  }
  const headers = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
  try {
    // Automations run on contacts. Creating an existing one returns an error we can ignore.
    await fetch(`${API}/contacts`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email: to.email, first_name: firstName(to.name), unsubscribed: false }),
    });
    const res = await fetch(`${API}/events/send`, {
      method: "POST",
      headers,
      body: JSON.stringify({ event, email: to.email, payload: { first_name: firstName(to.name), ...payload } }),
    });
    if (!res.ok) {
      console.error("[automation] event failed", event, res.status, await res.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (err) {
    console.error("[automation] event failed", event, err);
    return false;
  }
}

/* ── The private "log the call" link in Wajeeh's new-application email ──── */

function secret() {
  const s = envValue(process.env.OUTCOME_SECRET);
  if (!s || s.length < 24) return null;
  return s;
}

export function outcomeToken(id: string) {
  const s = secret();
  return s ? createHmac("sha256", s).update(`outcome:${id}`).digest("hex").slice(0, 40) : null;
}

export function validOutcomeToken(id: string, token: unknown) {
  const want = outcomeToken(id);
  if (!want || typeof token !== "string" || token.length !== want.length) return false;
  return timingSafeEqual(Buffer.from(want), Buffer.from(token));
}

export function outcomeUrl(id: string) {
  const t = outcomeToken(id);
  return t ? `${SITE}/call/?id=${id}&k=${t}` : null;
}
