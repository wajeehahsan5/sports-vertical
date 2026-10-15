import Image from "next/image";
import { COPY } from "@/config/copy";
import { Eyebrow } from "@/components/ui/Eyebrow";

const PAIRS = [1, 2, 3].map((n) => ({ before: `/img/concept-before-${n}.jpg`, after: `/img/concept-after-${n}.jpg` }));

function Pill({ children, side }: { children: React.ReactNode; side: "left" | "right" }) {
  return (
    <span className={`absolute top-4 z-10 rounded-full bg-ink/90 px-3 py-1 text-[13px] text-mint ${side === "left" ? "left-4" : "right-4"}`}>
      {children}
    </span>
  );
}

/**
 * The reference's transformation strip: wide before | after photo cards that run off
 * the right edge and scroll sideways. One real fighter from a stock shoot; "before" is the
 * same photo made to look like a flat phone snap. Always labelled Concept.
 */
export function BeforeAfter() {
  const c = COPY.beforeAfter;
  return (
    <section className="cage overflow-hidden border-y border-line py-24 lg:py-32">
      <div className="mx-auto max-w-[1240px] px-4 text-center sm:px-6">
        <Eyebrow>{c.eyebrow}</Eyebrow>
        <h2 className="display mx-auto mt-4 max-w-[24ch] text-[clamp(36px,4.2vw,56px)]">{c.h2}</h2>
      </div>
      {/* Runs off the right edge like the reference; the left edge lines up with the page grid. */}
      <div className="mt-14">
        <div className="flex snap-x snap-mandatory scroll-pl-[max(16px,calc((100vw-1240px)/2+24px))] gap-4 overflow-x-auto pb-4 pl-[max(16px,calc((100vw-1240px)/2+24px))] pr-4 [scrollbar-width:none]">
          {PAIRS.map((p, n) => (
            <figure
              key={n}
              data-reveal
              className="relative grid w-[88%] shrink-0 snap-start grid-cols-2 overflow-hidden rounded-[14px] border border-line md:w-[62%] lg:w-[48%]"
            >
              <div className="relative aspect-[4/5]">
                <Pill side="left">Concept · Before</Pill>
                <Image src={p.before} alt="Concept: the fighter's photo as a flat phone snap" fill sizes="(min-width: 1024px) 300px, 45vw" className="object-cover" />
              </div>
              <div className="relative aspect-[4/5]">
                <Pill side="right">Concept · After</Pill>
                <Image src={p.after} alt="Concept: the same photo graded and cropped for a pro profile" fill sizes="(min-width: 1024px) 300px, 45vw" className="photo object-cover" />
              </div>
            </figure>
          ))}
        </div>
        <p className="mt-6 px-4 text-center text-[14px] text-fg-dim">
          <span className="label mr-2 rounded-full bg-magenta px-2 py-1 text-white">Concept</span>
          {c.note}
        </p>
      </div>
    </section>
  );
}
