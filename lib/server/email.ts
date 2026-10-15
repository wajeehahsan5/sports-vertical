import "server-only";
import { BANDS, BASED_IN, LEVELS, PACKAGES, PILLARS, SPORTS, type Pillar } from "@/config/audit";
import type { AuditResult } from "@/lib/audit/score";
import { bookUrl, envValue, firstName, outcomeUrl } from "./automation";
import type { AuditSubmission } from "./validate";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const labelOf = <T extends string>(list: { value: T; label: string }[], v: T) => list.find((x) => x.value === v)?.label ?? v;
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const C = { ink: "#161616", body: "#2a2a28", dim: "#6b6b66", line: "#e6e2d8", mint: "#9beaca", paper: "#f3f0e8" };
const PILLAR_ORDER: Pillar[] = ["identity", "content", "home"];

function handles(s: AuditSubmission): [string, string][] {
  const c = s.contact;
  const out: [string, string][] = [["Instagram", `https://instagram.com/${c.instagram}`]];
  if (c.tiktok) out.push(["TikTok", `https://tiktok.com/@${c.tiktok}`]);
  if (c.youtube) out.push(["YouTube", `https://youtube.com/@${c.youtube}`]);
  if (c.website) out.push(["Website", c.website.startsWith("http") ? c.website : `https://${c.website}`]);
  return out;
}

/** Wajeeh's alert: everything he needs to prepare the 3 fixes. */
export function renderLeadAlert(id: string, s: AuditSubmission, r: AuditResult, attr: Record<string, string>) {
  const sport = labelOf(SPORTS, s.sport);
  const subject = `New audit: ${s.contact.name} (${sport}, ${labelOf(BASED_IN, s.contact.basedIn)}) scored ${r.overall}`;
  const rows: [string, string][] = [
    ["Name", s.contact.name],
    ["Email", s.contact.email],
    ["WhatsApp", s.contact.whatsapp || "none"],
    ["Sport", sport],
    ["Level", labelOf(LEVELS, s.level)],
    ["Based in", labelOf(BASED_IN, s.contact.basedIn)],
    ...PILLAR_ORDER.map((p) => [PILLARS[p].label, `${r.pillars[p].score}/9 (${BANDS[r.pillars[p].band]})`] as [string, string]),
    ["Package pointer", PACKAGES[r.pkg].name],
    ...Object.entries(attr).map(([k, val]) => [k, val] as [string, string]),
    ["Audit id", id],
  ];
  const links = handles(s);
  const log = outcomeUrl(id);
  const html = `
    <h2 style="font-family:${FONT}">${esc(subject)}</h2>
    <table cellpadding="6" style="font-family:${FONT};font-size:14px;border-collapse:collapse">
      ${rows.map(([k, val]) => `<tr><td style="color:${C.dim}">${esc(k)}</td><td><b>${esc(val)}</b></td></tr>`).join("")}
    </table>
    <h3 style="font-family:${FONT}">Profiles to review before the call</h3>
    <ul style="font-family:${FONT};font-size:14px">${links.map(([k, u]) => `<li>${esc(k)}: <a href="${esc(u)}">${esc(u)}</a></li>`).join("")}</ul>
    <h3 style="font-family:${FONT}">Their weakest answers</h3>
    <ol style="font-family:${FONT};font-size:14px">${r.findings.map((f) => `<li>${esc(f)}</li>`).join("")}</ol>
    ${log ? `<p style="font-family:${FONT};font-size:13px">After the call: <a href="${esc(log)}">log how it went</a></p>` : ""}`;
  const text = [
    ...rows.map(([k, val]) => `${k}: ${val}`),
    "",
    ...links.map(([k, u]) => `${k}: ${u}`),
    "",
    ...r.findings.map((f, i) => `${i + 1}. ${f}`),
    ...(log ? ["", `Log the call: ${log}`] : []),
  ].join("\n");
  return { subject, html, text };
}

/** The athlete's own copy of their score. Warm, short, one button. */
export function renderScoreEmail(id: string, s: AuditSubmission, r: AuditResult) {
  const subject = `Your Personal Brand Score: ${r.overall}`;
  const book = bookUrl(id);
  const bar = (score: number) => {
    const pct = Math.max(6, Math.round((score / 9) * 100));
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.line};border-radius:999px"><tr><td width="${pct}%" style="background:${C.mint};height:10px;border-radius:999px;font-size:0;line-height:0">&nbsp;</td><td style="font-size:0;line-height:0">&nbsp;</td></tr></table>`;
  };
  const pillars = PILLAR_ORDER.map(
    (p) =>
      `<tr><td style="padding:10px 0;font-family:${FONT};font-size:15px;color:${C.ink}"><b>${PILLARS[p].label}</b> <span style="color:${C.dim}">${BANDS[r.pillars[p].band]}</span><br>${bar(r.pillars[p].score)}</td></tr>`,
  ).join("");
  const findings = r.findings.length
    ? `<p style="font-family:${FONT};font-size:16px;color:${C.body}">What stood out:</p><ul style="font-family:${FONT};font-size:16px;line-height:1.6;color:${C.body}">${r.findings.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>`
    : "";
  const html = `
    <div style="background:${C.paper};padding:24px">
      <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:14px;padding:28px">
        <p style="font-family:${FONT};font-size:16px;color:${C.body}">Hi ${esc(firstName(s.contact.name))},</p>
        <p style="font-family:${FONT};font-size:16px;color:${C.body}">Here's your Personal Brand Score.</p>
        <p style="font-family:${FONT};font-size:56px;font-weight:800;margin:8px 0;color:${C.ink}">${r.overall}<span style="font-size:20px;color:${C.dim}">/100</span></p>
        <table role="presentation" width="100%">${pillars}</table>
        ${findings}
        <p style="font-family:${FONT};font-size:16px;color:${C.body}">The score is the quick version. On a 20-minute call we go through your real profiles and bring 3 specific fixes.</p>
        <p><a href="${esc(book)}" style="display:inline-block;background:${C.ink};color:${C.mint};font-family:${FONT};font-size:16px;font-weight:600;padding:13px 26px;border-radius:999px;text-decoration:none">Book my 20 minutes</a></p>
        <p style="font-family:${FONT};font-size:13px;color:${C.dim}">Janobi Agency Ltd · 128 City Road, London EC1V 2NX</p>
      </div>
    </div>`;
  const text = [
    `Hi ${firstName(s.contact.name)},`,
    "",
    `Your Personal Brand Score: ${r.overall}/100`,
    ...PILLAR_ORDER.map((p) => `${PILLARS[p].label}: ${BANDS[r.pillars[p].band]}`),
    "",
    ...r.findings.map((f) => `- ${f}`),
    "",
    `Book your 20 minutes: ${book}`,
  ].join("\n");
  return { subject, html, text };
}

async function send(to: string[], replyTo: string | undefined, e: { subject: string; html: string; text: string }) {
  const key = envValue(process.env.RESEND_API_KEY);
  const from = envValue(process.env.RESEND_FROM);
  if (!key || !from || !to.length) {
    const msg = "[email] RESEND_API_KEY / RESEND_FROM / recipient missing, not sent.";
    if (process.env.NODE_ENV === "production") console.error(msg);
    else console.info(`${msg}\n--- would have sent to ${to.join(", ")} ---\n${e.subject}\n${e.text}`);
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, ...(replyTo ? { reply_to: replyTo } : {}), ...e }),
    });
    if (!res.ok) {
      console.error("[email] Resend failed", res.status, await res.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] Resend failed", err);
    return false;
  }
}

export function sendLeadAlert(id: string, s: AuditSubmission, r: AuditResult, attr: Record<string, string>) {
  const to = (envValue(process.env.LEAD_NOTIFY_EMAIL) ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  return send(to, s.contact.email, renderLeadAlert(id, s, r, attr));
}

export function sendScoreEmail(id: string, s: AuditSubmission, r: AuditResult) {
  return send([s.contact.email], "wajeeh@janobi.agency", renderScoreEmail(id, s, r));
}
