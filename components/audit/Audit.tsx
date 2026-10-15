"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { LEVELS, QUESTIONS, SPORTS, type LevelId, type QuestionKey, type SportId } from "@/config/audit";
import { captureAttribution, readAttribution } from "@/lib/attribution";
import { fill, scoreAudit, type AuditResult } from "@/lib/audit/score";
import { errorMessage, postLead, type Booking } from "./api";
import { ChoiceStep } from "./ChoiceStep";
import { ResultsStep } from "./ResultsStep";
import { ReviewStep, type ReviewValues } from "./ReviewStep";
import { formatWhen } from "./when";

// The Cal.com embed only loads at the last step, keeping it off the page's first paint.
const BookingStep = dynamic(() => import("./BookingStep"), {
  ssr: false,
  loading: () => <div className="card grid min-h-[420px] place-items-center text-dim">Loading the calendar…</div>,
});

// Screens: 0 sport · 1 level · 2–10 questions · 11 results · 12 review · 13 booking
const RESULTS = 2 + QUESTIONS.length;
const REVIEW = RESULTS + 1;
const BOOKING = REVIEW + 1;
const STORAGE_KEY = "janobi.sports.audit.v1";

type Saved = {
  step: number;
  sport?: SportId;
  level?: LevelId;
  answers: Partial<Record<QuestionKey, string>>;
  review: ReviewValues;
  leadId: string | null;
  booking: Booking | null;
};

/** The audit: sport, level, 9 questions, results, handles, booking. One screen at a time. */
export function Audit({ onClose }: { onClose: () => void }) {
  const [s, setS] = useState<Saved>({ step: 0, answers: {}, review: {}, leadId: null, booking: null });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const advancing = useRef(false);
  const moved = useRef(false);

  // Restore a half-finished audit after a reload.
  useEffect(() => {
    captureAttribution();
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null") as Saved | null;
      /* eslint-disable react-hooks/set-state-in-effect -- one-off hydration from sessionStorage */
      if (saved) setS({ ...saved, step: saved.step >= BOOKING && !saved.leadId ? REVIEW : saved.step });
    } catch {
      /* storage blocked or corrupt: start fresh */
    }
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {
      /* ignore */
    }
  }, [hydrated, s]);

  useEffect(() => {
    if (moved.current) titleRef.current?.focus({ preventScroll: true });
  }, [s.step, s.booking]);

  const goto = (step: number) => {
    moved.current = true;
    setError(null);
    setS((x) => ({ ...x, step }));
  };

  const pick = (apply: (x: Saved) => Saved) => {
    if (advancing.current) return;
    advancing.current = true;
    setS(apply);
    window.setTimeout(() => {
      advancing.current = false;
      moved.current = true;
      setS((x) => ({ ...x, step: x.step + 1 }));
    }, 200);
  };

  const sport = s.sport ?? "other";
  const allAnswered = QUESTIONS.every((q) => s.answers[q.key]);
  const result: AuditResult | null = allAnswered && s.sport ? scoreAudit(s.answers, s.sport) : null;

  async function submitReview(review: ReviewValues) {
    setS((x) => ({ ...x, review }));
    setBusy(true);
    setError(null);
    try {
      const { basedIn, ...contact } = review;
      const res = await postLead<{ id: string }>({
        action: "audit",
        id: s.leadId ?? undefined,
        sport: s.sport,
        level: s.level,
        answers: s.answers,
        contact: { ...contact, basedIn },
        attribution: readAttribution(),
      });
      setS((x) => ({ ...x, review, leadId: res.id }));
      goto(BOOKING);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function handleBooked(b: Booking) {
    if (!s.leadId || s.booking) return;
    moved.current = true;
    setS((x) => ({ ...x, booking: b }));
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await postLead({ action: "booked", id: s.leadId, booking: b });
        return;
      } catch {
        await new Promise((r) => setTimeout(r, 1500 * attempt));
      }
    }
  }

  let label = "";
  let title = "";
  let sub = "";
  let stage: React.ReactNode = null;
  const qIndex = s.step - 2;

  if (s.booking) {
    label = "All done";
    title = `Booked. ${formatWhen(s.booking.startTime)}.`;
    sub = "The invite is on its way. Before the call we go through your profiles and bring 3 fixes.";
  } else if (s.step === 0) {
    label = "Before we start";
    title = "What's your sport?";
    sub = "So the results talk your language.";
    stage = <ChoiceStep options={SPORTS} value={s.sport} onPick={(v) => pick((x) => ({ ...x, sport: v as SportId }))} />;
  } else if (s.step === 1) {
    label = "Before we start";
    title = "Where are you in your career?";
    sub = "Every level gets something out of this.";
    stage = <ChoiceStep options={LEVELS} value={s.level} onPick={(v) => pick((x) => ({ ...x, level: v as LevelId }))} />;
  } else if (qIndex >= 0 && qIndex < QUESTIONS.length) {
    const q = QUESTIONS[qIndex];
    label = `Question ${qIndex + 1} of ${QUESTIONS.length}`;
    title = fill(q.title, sport);
    sub = q.sub;
    stage = (
      <ChoiceStep
        key={q.key}
        options={q.options}
        value={s.answers[q.key]}
        onPick={(v) => pick((x) => ({ ...x, answers: { ...x.answers, [q.key]: v } }))}
      />
    );
  } else if (s.step === RESULTS && result) {
    label = "Your results";
    title = "Here's where you stand.";
    sub = "This is the quick version, based on your answers.";
    stage = <ResultsStep result={result} onNext={() => goto(REVIEW)} />;
  } else if (s.step === REVIEW) {
    label = "The real review";
    title = "Where can we find you?";
    sub = "We look at your actual profiles before the call and bring 3 specific fixes.";
    stage = <ReviewStep initial={s.review} busy={busy} serverError={error} onSubmit={submitReview} />;
  } else if (s.step === BOOKING && s.leadId) {
    label = "Last step";
    title = "Pick a time for your 20 minutes.";
    sub = "On the call we go through your profiles and the 3 fixes. No cost, no pressure.";
    stage = (
      <BookingStep
        name={s.review.name ?? ""}
        email={s.review.email ?? ""}
        whatsapp={s.review.whatsapp ?? ""}
        instagram={s.review.instagram ?? ""}
        leadId={s.leadId}
        onBooked={handleBooked}
      />
    );
  } else {
    // Unreachable state after a bad restore: offer a clean start.
    label = "Audit";
    title = "Let's start again.";
    stage = (
      <button type="button" className="btn btn-ink" onClick={() => goto(0)}>
        Start again
      </button>
    );
  }

  const pct = s.booking ? 100 : Math.round((Math.min(s.step, RESULTS) / RESULTS) * 100);

  return (
    <div className="mx-auto w-full max-w-[880px] px-4 pb-12 pt-5 sm:px-6">
      <div className="flex items-center gap-4">
        <div className="h-[6px] flex-1 rounded-full bg-card" aria-hidden="true">
          <div className="h-full rounded-full bg-mint transition-[width] duration-300" style={{ width: `${pct}%` }} />
        </div>
        <button type="button" onClick={onClose} aria-label="Close the audit" className="btn-arrow">
          ✕
        </button>
      </div>
      <div className="mt-6 flex min-h-[44px] items-center justify-between gap-4">
        <p className="label text-dim">{label}</p>
        {!s.booking && s.step > 0 ? (
          <button type="button" onClick={() => goto(s.step - 1)} className="label min-h-[44px] px-2 text-dim hover:text-ink">
            ← Back
          </button>
        ) : null}
      </div>
      <h2 id="audit-title" ref={titleRef} tabIndex={-1} className="display mt-2 text-[clamp(34px,6vw,60px)] [text-wrap:balance] focus:outline-none">
        {title}
      </h2>
      {sub ? <p className="mt-3 max-w-[56ch] text-[17px] leading-relaxed text-body">{sub}</p> : null}
      <div className="mt-8">{stage}</div>
    </div>
  );
}
