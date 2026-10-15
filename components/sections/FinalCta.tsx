import { COPY } from "@/config/copy";
import { ArrowCta } from "@/components/ui/ArrowCta";

export function FinalCta() {
  const c = COPY.final;
  return (
    <section className="py-24">
      <div className="mx-4 flex max-w-[1240px] flex-col items-start gap-6 rounded-[14px] bg-mint px-6 py-12 text-ink sm:mx-6 sm:px-10 md:flex-row md:items-end md:justify-between xl:mx-auto">
        <div>
          <h2 className="display text-[clamp(44px,5.4vw,84px)]">{c.h2}</h2>
          <p className="mt-2 text-[17px]">{c.sub}</p>
        </div>
        <ArrowCta tone="on-mint">{c.cta}</ArrowCta>
      </div>
    </section>
  );
}
