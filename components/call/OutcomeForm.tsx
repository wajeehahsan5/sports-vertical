"use client";

import { useState } from "react";
import { errorMessage, postLead } from "@/components/audit/api";

const CHOICES = [
  { value: "client", label: "Signed" },
  { value: "lost", label: "Not a fit / not now" },
  { value: "no_show", label: "No-show (sends the rebook emails)" },
] as const;

export default function OutcomeForm({ id, token }: { id: string; token: string }) {
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function log(outcome: string) {
    setError(null);
    try {
      await postLead({ action: "outcome", id, k: token, outcome });
      setDone(outcome);
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  if (done) return <p className="card p-6 text-[17px]">Logged: {CHOICES.find((c) => c.value === done)?.label}.</p>;
  return (
    <div className="flex flex-col gap-3">
      {CHOICES.map((c) => (
        <button key={c.value} type="button" className="btn btn-light justify-start" onClick={() => log(c.value)}>
          {c.label}
        </button>
      ))}
      {error ? <p className="text-error">{error}</p> : null}
    </div>
  );
}
