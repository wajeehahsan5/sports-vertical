import { COPY } from "@/config/copy";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function Faq() {
  const f = COPY.faq;
  return (
    <section id="faq" className="cage scroll-mt-4 border-y border-line py-24">
      <div className="mx-auto max-w-[900px] px-4 sm:px-6">
        <Eyebrow>{f.eyebrow}</Eyebrow>
        <h2 className="display mt-4 text-[clamp(36px,4.2vw,56px)]">{f.h2}</h2>
        <div className="mt-10 flex flex-col gap-3">
          {f.items.map((it) => (
            <details key={it.q} data-reveal className="card group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[18px] font-medium">
                {it.q}
                <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-mint text-ink transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-[16px] leading-relaxed text-fg-body">{it.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
