import { COPY } from "@/config/copy";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function HowItWorks() {
  const h = COPY.how;
  return (
    <section id="how" className="mx-auto max-w-[1240px] scroll-mt-4 px-4 pb-24 sm:px-6 lg:pb-32">
      <Eyebrow>{h.eyebrow}</Eyebrow>
      <h2 className="display mt-4 text-[clamp(34px,4vw,52px)]">{h.h2}</h2>
      <ol className="mt-12 grid gap-4 md:grid-cols-3">
        {h.steps.map((s) => (
          <li key={s.n} data-reveal className="card flex min-h-[260px] flex-col justify-between p-6">
            <span className="display grid h-[52px] w-[52px] place-items-center rounded-[12px] bg-ink text-[22px] text-mint">{s.n}</span>
            <div>
              <h3 className="display text-[26px]">{s.title}</h3>
              <p className="mt-2 max-w-[34ch] text-[15px] text-body">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
