import "server-only";
import { BASED_IN, LEVELS, QUESTIONS, SPORTS, type BasedIn, type LevelId, type QuestionKey, type SportId } from "@/config/audit";
import { REF_PATTERN } from "@/lib/attribution";

export class ValidationError extends Error {}

export type Contact = {
  name: string;
  email: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  website: string;
  whatsapp: string;
  basedIn: BasedIn;
};
export type AuditSubmission = { sport: SportId; level: LevelId; answers: Record<QuestionKey, string>; contact: Contact };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const HANDLE = /^[A-Za-z0-9._-]{1,40}$/;
const SITE = /^(https?:\/\/)?[^\s/.]+\.[^\s]{2,}$/i;

const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export function leadId(v: unknown): string {
  if (typeof v !== "string" || !UUID.test(v)) throw new ValidationError("Invalid audit id.");
  return v;
}

/** "@kai", "instagram.com/kai/?hl=en", "tiktok.com/@kai", "youtube.com/@kai" → "kai". */
export function normalizeHandle(raw: string): string {
  let s = raw.trim();
  s = s.replace(/^https?:\/\//i, "").replace(/^(www\.|m\.)/i, "");
  s = s.replace(/^(instagram\.com|tiktok\.com|youtube\.com)\//i, "");
  s = s.split(/[/?#]/)[0];
  return s.replace(/^@/, "");
}

function handle(raw: unknown, label: string, required: boolean): string {
  const v = normalizeHandle(str(raw, 300));
  if (!v) {
    if (required) throw new ValidationError(`${label} is needed.`);
    return "";
  }
  if (!HANDLE.test(v)) throw new ValidationError(`That ${label} handle doesn't look right.`);
  return v;
}

const oneOf = <T extends string>(list: { value: T }[], v: unknown, what: string): T => {
  const hit = list.find((x) => x.value === v);
  if (!hit) throw new ValidationError(`Missing answer: ${what}.`);
  return hit.value;
};

export function submission(raw: Record<string, unknown>): AuditSubmission {
  const sport = oneOf(SPORTS, raw.sport, "sport");
  const level = oneOf(LEVELS, raw.level, "level");

  const rawAnswers = (raw.answers ?? {}) as Record<string, unknown>;
  const answers = {} as Record<QuestionKey, string>;
  for (const q of QUESTIONS) {
    const v = rawAnswers[q.key];
    if (!q.options.some((o) => o.value === v)) throw new ValidationError(`Missing answer: ${q.key}.`);
    answers[q.key] = v as string;
  }

  const c = (raw.contact ?? {}) as Record<string, unknown>;
  const name = str(c.name, 120);
  const email = str(c.email, 200).toLowerCase();
  const website = str(c.website, 200);
  const whatsapp = str(c.whatsapp, 40);
  if (!name) throw new ValidationError("Your name is needed.");
  if (!EMAIL.test(email)) throw new ValidationError("A valid email is needed.");
  if (website && !SITE.test(website)) throw new ValidationError("That website doesn't look right.");
  const digits = whatsapp.replace(/\D/g, "").length;
  if (whatsapp && (digits < 8 || digits > 15)) throw new ValidationError("Add your WhatsApp with the country code, or leave it blank.");

  return {
    sport,
    level,
    answers,
    contact: {
      name,
      email,
      instagram: handle(c.instagram, "Instagram", true),
      tiktok: handle(c.tiktok, "TikTok", false),
      youtube: handle(c.youtube, "YouTube", false),
      website,
      whatsapp,
      basedIn: oneOf(BASED_IN, c.basedIn, "where you're based"),
    },
  };
}

export function booking(raw: unknown) {
  const r = (raw ?? {}) as Record<string, unknown>;
  const uid = str(r.uid, 120);
  const startTime = str(r.startTime, 40);
  if (!uid || Number.isNaN(Date.parse(startTime))) throw new ValidationError("Invalid booking.");
  return { uid, startTime: new Date(startTime).toISOString() };
}

export const OUTCOMES = ["no_show", "client", "lost"] as const;
export type Outcome = (typeof OUTCOMES)[number];
export function outcome(raw: unknown): Outcome {
  const o = OUTCOMES.find((x) => x === raw);
  if (!o) throw new ValidationError("Unknown outcome.");
  return o;
}

/** Only ref + utm_* survive, and only a ref that is already clean. */
export function attribution(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, string> = {};
  for (const [k, val] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof val !== "string") continue;
    if (k === "ref" && REF_PATTERN.test(val)) out.ref = val;
    else if (/^utm_[a-z]+$/.test(k)) out[k] = val.slice(0, 200);
  }
  return out;
}
