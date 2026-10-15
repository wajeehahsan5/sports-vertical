/**
 * Where a visitor came from: the partner's ?ref= code plus UTMs.
 * First touch wins for 90 days (a partner intro often converts days later),
 * kept in localStorage. No cookies.
 */
const KEY = "janobi.sports.attribution";
const TTL_MS = 90 * 86_400_000;
const UTMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
export type AttrKey = "ref" | (typeof UTMS)[number];
export type Attribution = { first_seen: number } & Partial<Record<AttrKey, string>>;

export const REF_PATTERN = /^[a-z0-9-]{1,32}$/;

export function cleanRef(raw: string): string | null {
  const v = raw.trim().toLowerCase().replace(/\s+/g, "-");
  return REF_PATTERN.test(v) ? v : null;
}

export function mergeAttribution(stored: Attribution | null, search: string, now: number): Attribution | null {
  const live = stored && now - stored.first_seen < TTL_MS ? stored : null;
  if (live) return live;

  const params = new URLSearchParams(search);
  const out: Attribution = { first_seen: now };
  const ref = cleanRef(params.get("ref") ?? "");
  if (ref) out.ref = ref;
  for (const k of UTMS) {
    const v = params.get(k);
    if (v) out[k] = v.slice(0, 200);
  }
  return Object.keys(out).length > 1 ? out : null;
}

export function captureAttribution() {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) || "null") as Attribution | null;
    const next = mergeAttribution(stored, window.location.search, Date.now());
    if (next) localStorage.setItem(KEY, JSON.stringify(next));
    else localStorage.removeItem(KEY);
  } catch {
    /* storage blocked: attribution is a nice-to-have */
  }
}

/** The stored touch without its timestamp, ready to POST. */
export function readAttribution(): Record<string, string> {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) || "null") as Attribution | null;
    if (!stored || Date.now() - stored.first_seen >= TTL_MS) return {};
    const { first_seen: _t, ...rest } = stored;
    return rest as Record<string, string>;
  } catch {
    return {};
  }
}
