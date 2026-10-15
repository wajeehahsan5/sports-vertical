"use client";

import { useState } from "react";
import { BASED_IN, REVIEW_FIELDS, type BasedIn, type FieldKey } from "@/config/audit";
import { ErrorLine, FieldsStep } from "./FieldsStep";

export type ReviewValues = Partial<Record<FieldKey, string>> & { basedIn?: BasedIn };

/** Handles + contact. The lead is saved when this submits; booking comes next. */
export function ReviewStep({
  initial,
  busy,
  serverError,
  onSubmit,
}: {
  initial: ReviewValues;
  busy: boolean;
  serverError: string | null;
  onSubmit: (v: ReviewValues) => void;
}) {
  const [basedIn, setBasedIn] = useState<BasedIn | undefined>(initial.basedIn);
  const [missing, setMissing] = useState(false);

  return (
    <FieldsStep
      fields={REVIEW_FIELDS}
      initial={initial}
      busy={busy}
      serverError={serverError}
      submitLabel="Save and pick a time"
      onSubmit={(v) => {
        if (!basedIn) return setMissing(true);
        onSubmit({ ...v, basedIn });
      }}
    >
      <fieldset>
        <legend className="text-[16px] font-medium text-body">Where are you based?</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {BASED_IN.map((b) => (
            <button
              key={b.value}
              type="button"
              aria-pressed={basedIn === b.value}
              onClick={() => {
                setBasedIn(b.value);
                setMissing(false);
              }}
              className={`btn ${basedIn === b.value ? "btn-mint" : "btn-light"}`}
            >
              {b.label}
            </button>
          ))}
        </div>
        {missing ? <ErrorLine alert>{"Pick where you're based."}</ErrorLine> : null}
      </fieldset>
    </FieldsStep>
  );
}
