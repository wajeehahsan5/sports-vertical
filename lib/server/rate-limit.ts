import "server-only";

/**
 * In-memory sliding-window rate limits for the lead API.
 *
 * Per server instance (each Supabase Edge Function isolate keeps its own count),
 * so these are a speed bump. The hard site-wide cap is counted in the database
 * (handlers.ts, DAILY_CAP).
 */
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const LIMITS = {
  // per visitor IP
  audit: { max: 8, windowMs: HOUR },
  booked: { max: 12, windowMs: HOUR },
  outcome: { max: 30, windowMs: HOUR }, // Wajeeh's "log the call" page
  lookup: { max: 30, windowMs: HOUR }, // /book and /call loading a lead
  // whole site: caps the inbox if someone rotates IPs
  "global-audit": { max: 300, windowMs: DAY },
} as const;

export type LimitName = keyof typeof LIMITS;

const hits = new Map<string, number[]>();

/** Records a hit and returns true if this request is over the limit. */
export function overLimit(name: LimitName, subject: string): boolean {
  const { max, windowMs } = LIMITS[name];
  const key = `${name}:${subject}`;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 20_000) sweep(now);
  return false;
}

function sweep(now: number) {
  for (const [key, times] of hits) {
    const name = key.slice(0, key.indexOf(":")) as LimitName;
    const windowMs = LIMITS[name]?.windowMs ?? DAY;
    if (!times.some((t) => now - t < windowMs)) hits.delete(key);
  }
}

/**
 * Visitor IP as reported by the hosting proxy. `x-real-ip` is set by the proxy
 * itself; the first `x-forwarded-for` entry is the fallback.
 */
export function clientIp(request: Request): string {
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}
