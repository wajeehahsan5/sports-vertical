import Image from "next/image";
import { COPY } from "@/config/copy";

/** The reference's "about" block: a photo left; stats, a big statement and a light pill right. */
export function WhyItMatters() {
  const w = COPY.why;
  return (
    <section className="mx-auto grid max-w-[1240px] items-center gap-12 px-4 py-24 sm:px-6 md:grid-cols-2 lg:gap-20 lg:py-40">
      <div data-reveal className="relative aspect-[6/7] overflow-hidden rounded-[14px] bg-ink">
        <Image src={w.photo.src} alt={w.photo.alt} fill sizes="(min-width: 768px) 600px, 100vw" className="object-cover" />
      </div>
      <div>
        <dl data-reveal className="grid grid-cols-3 gap-6 border-b border-line pb-10">
          {w.stats.map(([n, label]) => (
            <div key={label}>
              <dt className="display text-[clamp(38px,4vw,52px)]">{n}</dt>
              <dd className="mt-1 text-[14px] text-dim">{label}</dd>
            </div>
          ))}
        </dl>
        <p data-reveal className="display mt-10 text-[clamp(24px,2.5vw,34px)] leading-[1.12]">
          {w.statement}
        </p>
        <a data-reveal href="#how" className="group mt-10 inline-flex items-center gap-1">
          <span className="btn btn-light">{w.cta}</span>
          <span aria-hidden="true" className="btn-arrow transition-transform group-hover:translate-x-0.5">
            »
          </span>
        </a>
      </div>
    </section>
  );
}
