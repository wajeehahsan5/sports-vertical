import { COPY } from "@/config/copy";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function Faq() {
  const f = COPY.faq;
  return (
    <section id="faq" className="scroll-mt-4 bg-ink py-20 text-on-dark">
      <div className="mx-auto max-w-[900px] px-4 sm:px-6">
        <Eyebrow dark>{f.eyebrow}</Eyebrow>
        <h2 className="display mt-3 text-[clamp(34px,4vw,52px)]">{f.h2}</h2>
        <div className="mt-10 flex flex-col gap-3">
          {f.items.map((it) => (
            <details key={it.q} data-reveal className="card-dark group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[18px] font-medium">
                {it.q}
                <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-mint text-ink transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-[16px] leading-relaxed text-on-dark-dim">{it.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
