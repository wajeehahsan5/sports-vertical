"use client";

import { BANDS, PACKAGES, PILLARS, type Pillar } from "@/config/audit";
import type { AuditResult } from "@/lib/audit/score";

const ORDER: Pillar[] = ["identity", "content", "home"];

export function ResultsStep({ result, onNext }: { result: AuditResult; onNext: () => void }) {
  const pkg = PACKAGES[result.pkg];
  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <div className="card-dark flex flex-col justify-between p-6">
        <p className="label text-on-dark-dim">Your Personal Brand Score</p>
        <p className="display mt-4 text-[120px] leading-none text-mint">
          {result.overall}
          <span className="text-[32px] text-on-dark-dim">/100</span>
        </p>
      </div>
      <div className="card p-6">
        <ul className="flex flex-col gap-5">
          {ORDER.map((p) => {
            const s = result.pillars[p];
            return (
              <li key={p}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[17px] font-medium">{PILLARS[p].label}</span>
                  <span className="text-[14px] text-dim">{BANDS[s.band]}</span>
                </div>
                <div className="mt-2 h-[10px] rounded-full bg-paper" aria-hidden="true">
                  <div className="h-full rounded-full bg-mint" style={{ width: `${Math.max(6, Math.round((s.score / 9) * 100))}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      {result.findings.length ? (
        <div className="card p-6 md:col-span-2">
          <p className="label text-dim">What stood out</p>
          <ul className="mt-3 flex flex-col gap-3 text-[17px] leading-relaxed text-body">
            {result.findings.map((f) => (
              <li key={f} className="flex gap-3">
                <span aria-hidden="true" className="mt-[9px] h-2 w-2 shrink-0 rounded-full bg-magenta" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="card flex flex-col gap-4 p-6 md:col-span-2 md:flex-row md:items-center md:justify-between">
        <p className="text-[17px] text-body">
          The package that fits best: <b className="text-ink">{pkg.name}</b>. {pkg.line}
        </p>
        <button type="button" onClick={onNext} className="btn btn-ink">
          Get the real review <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
