/**
 * Supabase Edge Function `sports`: the live backend for the static site.
 *   POST …/functions/v1/sports/lead  audit, booking, /book and /call lookups, call outcome
 *   POST …/functions/v1/sports/cal   Cal.com webhook (BOOKING_CREATED / BOOKING_RESCHEDULED)
 *
 * Not deployed from this file directly: `npm run build:edge` bundles it with the shared
 * lib/ code into supabase/functions/sports/index.ts, which is what gets deployed.
 * SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by Supabase automatically.
 * Secrets to set in Supabase → Edge Functions → Secrets: RESEND_API_KEY, OUTCOME_SECRET, CAL_WEBHOOK_SECRET.
 */
import { handleCal, handleLead } from "@/lib/server/handlers";

declare const Deno: { serve(handler: (req: Request) => Response | Promise<Response>): void };

// The live site, plus local previews of the static build (this PC, or a phone on the same Wi-Fi).
const ALLOWED_ORIGIN = /^(https:\/\/sports\.janobi\.agency|http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}):\d{2,5})$/;

function cors(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  if (!ALLOWED_ORIGIN.test(origin)) return {};
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
    vary: "origin",
  };
}

Deno.serve(async (req) => {
  const headers = cors(req);
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (req.method !== "POST") return new Response("Not found", { status: 404, headers });

  const path = new URL(req.url).pathname;
  const res = path.endsWith("/lead") ? await handleLead(req) : path.endsWith("/cal") ? await handleCal(req) : null;
  if (!res) return new Response("Not found", { status: 404, headers });
  for (const [k, v] of Object.entries(headers)) res.headers.set(k, v);
  return res;
});
