import { COPY } from "@/config/copy";
import { Eyebrow } from "@/components/ui/Eyebrow";

/** Three rounds, like a fight card. */
export function HowItWorks() {
  const h = COPY.how;
  return (
    <section id="how" className="mx-auto max-w-[1240px] scroll-mt-4 px-4 pb-24 sm:px-6 lg:pb-32">
      <Eyebrow>{h.eyebrow}</Eyebrow>
      <h2 className="display mt-4 text-[clamp(36px,4.2vw,56px)]">{h.h2}</h2>
      <ol className="mt-12 grid gap-4 md:grid-cols-3">
        {h.steps.map((s) => (
          <li key={s.n} data-reveal className="card relative flex min-h-[260px] flex-col justify-between overflow-hidden p-6">
            <span aria-hidden="true" className="display pointer-events-none absolute -right-2 -top-6 text-[140px] leading-none text-white/[0.04]">
              {s.n}
            </span>
            <span className="label text-mint">Round {s.n}</span>
            <div>
              <h3 className="display text-[28px]">{s.title}</h3>
              <p className="mt-2 max-w-[34ch] text-[15px] text-fg-body">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
