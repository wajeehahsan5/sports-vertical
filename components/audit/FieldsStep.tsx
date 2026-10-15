"use client";

import { useRef, useState, type FormEvent } from "react";
import type { Field, FieldKey } from "@/config/audit";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function check(f: Field, raw: string): string | null {
  const value = raw.trim();
  if (!value) return f.required ? `${f.label} is needed.` : null;
  if (f.type === "email" && !EMAIL.test(value)) return "That email doesn't look right.";
  if (f.type === "tel") {
    const digits = value.replace(/\D/g, "").length;
    if (digits < 8 || digits > 15) return "Add it with your country code, like +44 or +1.";
  }
  return null;
}

export function ErrorLine({ id, children, alert = false }: { id?: string; children: React.ReactNode; alert?: boolean }) {
  return (
    <p id={id} role={alert ? "alert" : undefined} className="mt-2 flex items-start gap-2 text-[16px] font-medium text-ink">
      <span aria-hidden="true" className="mt-[3px] grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-error text-[12px] font-bold leading-none text-white">
        !
      </span>
      <span>{children}</span>
    </p>
  );
}

export function FieldsStep({
  fields,
  initial,
  busy,
  serverError,
  submitLabel = "Continue",
  onSubmit,
  children,
}: {
  fields: Field[];
  initial: Partial<Record<FieldKey, string>>;
  busy: boolean;
  serverError: string | null;
  submitLabel?: string;
  onSubmit: (values: Partial<Record<FieldKey, string>>) => void;
  children?: React.ReactNode;
}) {
  const [values, setValues] = useState<Partial<Record<FieldKey, string>>>(() =>
    Object.fromEntries(fields.map((f) => [f.key, initial[f.key] ?? ""])),
  );
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const inputs = useRef<Partial<Record<FieldKey, HTMLInputElement | null>>>({});

  function submit(e: FormEvent) {
    e.preventDefault();
    const next: Partial<Record<FieldKey, string>> = {};
    for (const f of fields) {
      const err = check(f, values[f.key] ?? "");
      if (err) next[f.key] = err;
    }
    setErrors(next);
    const firstBad = fields.find((f) => next[f.key]);
    if (firstBad) {
      inputs.current[firstBad.key]?.focus();
      return;
    }
    onSubmit(Object.fromEntries(fields.map((f) => [f.key, (values[f.key] ?? "").trim()])));
  }

  const errorCount = Object.values(errors).filter(Boolean).length;

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-5">
      {fields.map((f, i) => {
        const id = `q-${f.key}`;
        const err = errors[f.key];
        return (
          <div key={f.key}>
            <label htmlFor={id} className="text-[16px] font-medium text-body">
              {f.label}
              {f.required ? null : <span className="font-normal text-dim"> (optional)</span>}
            </label>
            <input
              ref={(el) => {
                inputs.current[f.key] = el;
              }}
              id={id}
              name={f.key}
              type={f.type}
              inputMode={f.inputMode}
              autoComplete={f.autoComplete}
              autoCapitalize={f.key === "name" ? "words" : "off"}
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint={i === fields.length - 1 ? "go" : "next"}
              placeholder={f.placeholder}
              required={f.required}
              aria-invalid={err ? true : undefined}
              aria-describedby={err ? `${id}-error` : undefined}
              value={values[f.key] ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setValues((s) => ({ ...s, [f.key]: v }));
                if (err) setErrors((s) => ({ ...s, [f.key]: undefined }));
              }}
              className="field-input mt-2"
            />
            {err ? <ErrorLine id={`${id}-error`}>{err}</ErrorLine> : null}
          </div>
        );
      })}

      {children}

      <p className="sr-only" aria-live="polite">
        {errorCount ? `${errorCount} field${errorCount === 1 ? "" : "s"} need${errorCount === 1 ? "s" : ""} a fix.` : ""}
      </p>
      {serverError ? <ErrorLine alert>{serverError}</ErrorLine> : null}

      <div className="mt-2">
        <button type="submit" disabled={busy} className="btn btn-ink min-h-[56px] px-8 text-[17px]">
          {busy ? "Saving…" : submitLabel} <span aria-hidden="true">→</span>
        </button>
      </div>
    </form>
  );
}
