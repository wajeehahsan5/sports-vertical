import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { PackageId } from "@/config/audit";
import type { AuditResult } from "@/lib/audit/score";
import type { AuditSubmission, Outcome } from "./validate";

/**
 * Lead storage. Supabase in production; JSON files under .local-data/ in dev so
 * the whole funnel can be clicked through before any keys exist.
 */
export type Status = "audited" | "booked" | Outcome;
export type LeadRow = {
  id: string;
  name: string;
  email: string;
  instagram: string;
  whatsapp: string;
  status: Status;
  pkg: PackageId;
  ref: string | null;
};
type Meta = { attribution: Record<string, string>; userAgent: string };

export interface LeadStore {
  kind: "supabase" | "local";
  /** Creates or updates the audit. Never touches status or alerted_at; ref/attribution are set on the first save only. */
  saveAudit(id: string, s: AuditSubmission, r: AuditResult, meta: Meta): Promise<void>;
  exists(id: string): Promise<boolean>;
  /** How many audits were created since this time (ms). Backs the site-wide daily cap. */
  countSince(sinceMs: number): Promise<number>;
  /**
   * Atomically claims the one-time alert + score email for this lead. True for exactly one caller,
   * ever, so a resubmit, a race or a failed send never sends twice.
   */
  claimAlert(id: string): Promise<boolean>;
  get(id: string): Promise<LeadRow | null>;
  booked(id: string, b: { uid: string; startTime: string }): Promise<void>;
  setStatus(id: string, status: Outcome): Promise<void>;
}

const TABLE = "sports_audits";

const columns = (s: AuditSubmission, r: AuditResult) => ({
  name: s.contact.name,
  email: s.contact.email,
  instagram: s.contact.instagram,
  tiktok: s.contact.tiktok || null,
  youtube: s.contact.youtube || null,
  website: s.contact.website || null,
  whatsapp: s.contact.whatsapp || null,
  based_in: s.contact.basedIn,
  sport: s.sport,
  level: s.level,
  answers: s.answers,
  scores: r,
  pkg: r.pkg,
});

/** Attribution is written on the first save only, so a resubmit never rewrites where they came from. */
const firstTouch = (isNew: boolean, attribution: Record<string, string>) =>
  isNew && Object.keys(attribution).length ? { ref: attribution.ref ?? null, attribution } : {};

const toRow = (d: Record<string, unknown>): LeadRow => ({
  id: d.id as string,
  name: d.name as string,
  email: d.email as string,
  instagram: d.instagram as string,
  whatsapp: (d.whatsapp as string | null) ?? "",
  status: d.status as Status,
  pkg: d.pkg as PackageId,
  ref: (d.ref as string | null) ?? null,
});

class SupabaseStore implements LeadStore {
  kind = "supabase" as const;
  private db: SupabaseClient;

  constructor() {
    this.db = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  async saveAudit(id: string, s: AuditSubmission, r: AuditResult, meta: Meta) {
    const existing = await this.exists(id);
    const { error } = await this.db.from(TABLE).upsert(
      {
        id,
        ...columns(s, r),
        ...firstTouch(!existing, meta.attribution),
        user_agent: meta.userAgent,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
    if (error) throw error;
  }

  async exists(id: string) {
    const { data, error } = await this.db.from(TABLE).select("id").eq("id", id).maybeSingle();
    if (error) throw error;
    return Boolean(data);
  }

  async countSince(sinceMs: number) {
    const { count, error } = await this.db
      .from(TABLE)
      .select("id", { count: "exact", head: true })
      .gte("created_at", new Date(sinceMs).toISOString());
    if (error) throw error;
    return count ?? 0;
  }

  async claimAlert(id: string) {
    const now = new Date().toISOString();
    // One UPDATE … WHERE alerted_at IS NULL: Postgres lets exactly one request win it.
    const { data, error } = await this.db
      .from(TABLE)
      .update({ alerted_at: now, updated_at: now })
      .eq("id", id)
      .is("alerted_at", null)
      .select("id");
    if (error) throw error;
    return (data?.length ?? 0) > 0;
  }

  async get(id: string) {
    const { data, error } = await this.db
      .from(TABLE)
      .select("id, name, email, instagram, whatsapp, status, pkg, ref")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? toRow(data) : null;
  }

  async booked(id: string, b: { uid: string; startTime: string }) {
    const now = new Date().toISOString();
    const { error } = await this.db
      .from(TABLE)
      .update({ status: "booked", booking_uid: b.uid, booking_start: b.startTime, booked_at: now, updated_at: now })
      .eq("id", id);
    if (error) throw error;
  }

  async setStatus(id: string, status: Outcome) {
    const { error } = await this.db.from(TABLE).update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) throw error;
  }
}

/** Dev-only: one JSON file per lead. Exported for tests. */
export class LocalStore implements LeadStore {
  kind = "local" as const;
  constructor(private root = process.env.LOCAL_STORE_DIR || path.join(process.cwd(), ".local-data", "audits")) {}

  private file(id: string) {
    return path.join(this.root, `${id}.json`);
  }
  private async read(id: string): Promise<Record<string, unknown> | null> {
    try {
      return JSON.parse(await fs.readFile(this.file(id), "utf8"));
    } catch {
      return null;
    }
  }
  private async write(id: string, patch: Record<string, unknown>) {
    await fs.mkdir(this.root, { recursive: true });
    const row = { ...(await this.read(id)), ...patch, id, updated_at: new Date().toISOString() };
    await fs.writeFile(this.file(id), JSON.stringify(row, null, 2));
  }

  async saveAudit(id: string, s: AuditSubmission, r: AuditResult, meta: Meta) {
    const current = await this.read(id);
    await this.write(id, {
      ...columns(s, r),
      ...firstTouch(!current, meta.attribution),
      user_agent: meta.userAgent,
      status: current?.status ?? "audited",
      created_at: current?.created_at ?? new Date().toISOString(),
    });
  }

  async exists(id: string) {
    return Boolean(await this.read(id));
  }

  async countSince(sinceMs: number) {
    let n = 0;
    for (const f of await fs.readdir(this.root).catch(() => [] as string[])) {
      const row = f.endsWith(".json") ? await this.read(f.slice(0, -5)) : null;
      if (row && Date.parse(String(row.created_at)) >= sinceMs) n++;
    }
    return n;
  }

  async claimAlert(id: string) {
    const row = await this.read(id);
    if (!row || row.alerted_at) return false;
    await this.write(id, { alerted_at: new Date().toISOString() });
    return true;
  }

  async get(id: string) {
    const row = await this.read(id);
    return row ? toRow(row) : null;
  }

  async booked(id: string, b: { uid: string; startTime: string }) {
    await this.write(id, { status: "booked", booking_uid: b.uid, booking_start: b.startTime, booked_at: new Date().toISOString() });
  }

  async setStatus(id: string, status: Outcome) {
    await this.write(id, { status });
  }
}

let store: LeadStore | null = null;

export function getStore(): LeadStore {
  if (store) return store;
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) store = new SupabaseStore();
  else if (process.env.NODE_ENV !== "production" || process.env.ALLOW_LOCAL_STORE === "1") store = new LocalStore();
  else throw new Error("Lead storage is not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  return store;
}
