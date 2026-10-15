"use client";

type Option = { value: string; label: string; hint?: string };

/** One answer per tap. Big targets: these get answered on phones, in DMs. */
export function ChoiceStep({ options, value, onPick }: { options: Option[]; value?: string; onPick: (v: string) => void }) {
  return (
    <div role="radiogroup" aria-labelledby="audit-title" className="grid gap-3 sm:grid-cols-2">
      {options.map((o) => {
        const on = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onPick(o.value)}
            className={`card flex min-h-[76px] flex-col items-start justify-center gap-1 px-5 py-4 text-left transition-colors duration-150 ${
              on ? "border-ink bg-mint" : "hover:border-ink"
            }`}
          >
            <span className="text-[19px] font-medium leading-tight">{o.label}</span>
            {o.hint ? <span className="text-[15px] leading-snug text-dim">{o.hint}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
