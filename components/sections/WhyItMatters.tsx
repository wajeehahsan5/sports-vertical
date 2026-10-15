import Image from "next/image";
import { COPY } from "@/config/copy";
import { ArrowCta } from "@/components/ui/ArrowCta";

/** The reference's "about" block: a photo left; stats, a big statement and a pill right. */
export function WhyItMatters() {
  const w = COPY.why;
  return (
    <section className="mx-auto grid max-w-[1240px] items-center gap-12 px-4 py-24 sm:px-6 md:grid-cols-2 lg:gap-20 lg:py-36">
      <div data-reveal className="relative aspect-[6/7] overflow-hidden rounded-[14px] border border-line bg-surface">
        <Image src={w.photo.src} alt={w.photo.alt} fill sizes="(min-width: 768px) 600px, 100vw" className="photo object-cover" />
      </div>
      <div>
        <dl data-reveal className="grid grid-cols-3 gap-6 border-b border-line pb-10">
          {w.stats.map(([n, label]) => (
            <div key={label}>
              <dt className="display text-[clamp(42px,4.4vw,60px)] text-mint">{n}</dt>
              <dd className="mt-1 text-[14px] text-fg-dim">{label}</dd>
            </div>
          ))}
        </dl>
        <p data-reveal className="display mt-10 text-[clamp(26px,2.7vw,38px)] leading-[1.05]">
          {w.statement}
        </p>
        <div data-reveal className="mt-10">
          <ArrowCta tone="ghost" href="#how">
            {w.cta}
          </ArrowCta>
        </div>
      </div>
    </section>
  );
}
