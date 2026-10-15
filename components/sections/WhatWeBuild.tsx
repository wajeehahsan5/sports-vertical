import Image from "next/image";
import { PILLARS } from "@/config/audit";
import { COPY } from "@/config/copy";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { IconAudit, IconContent, IconHome, IconIdentity, IconPin, IconTile } from "@/components/ui/Icons";

type Tone = "dark" | "mint";

function ServiceCard({ tone, icon, title, body, href }: { tone: Tone; icon: React.ReactNode; title: string; body: string; href?: string }) {
  const look = tone === "mint" ? "bg-mint text-ink" : "border border-line-dark text-on-dark";
  const inner = (
    <>
      <IconTile tone={tone === "mint" ? "on-mint" : "on-dark"}>{icon}</IconTile>
      <div>
        <h3 className={`display text-[28px] ${tone === "mint" ? "text-ink" : "text-mint"}`}>{title}</h3>
        <p className={`mt-2 max-w-[30ch] text-[15px] leading-snug ${tone === "mint" ? "text-ink/80" : "text-on-dark-dim"}`}>{body}</p>
      </div>
    </>
  );
  const cls = `flex min-h-[300px] flex-col justify-between rounded-[14px] p-6 ${look}`;
  return href ? (
    <a data-reveal href={href} className={`${cls} transition-colors hover:border-mint`}>
      {inner}
    </a>
  ) : (
    <div data-reveal className={cls}>
      {inner}
    </div>
  );
}

/** Dark band. The reference's 3×2 bento: a tall photo card in the middle, mint and dark cards in a checkerboard. */
export function WhatWeBuild() {
  const b = COPY.build;
  return (
    <section id="build" className="scroll-mt-4 bg-ink py-24 text-on-dark lg:py-32">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow dark>{b.eyebrow}</Eyebrow>
            <h2 className="display mt-4 max-w-[22ch] text-[clamp(34px,4vw,52px)]">{b.h2}</h2>
          </div>
          <a href="#audit" className="group inline-flex items-center gap-1">
            <span className="btn border border-line-dark bg-ink-2 text-mint">{b.cta}</span>
            <span aria-hidden="true" className="btn-arrow !bg-mint !text-ink transition-transform group-hover:translate-x-0.5">
              »
            </span>
          </a>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          <ServiceCard tone="dark" icon={<IconIdentity />} title={PILLARS.identity.label} body={`${PILLARS.identity.blurb} ${b.pillars.identity}`} />

          <div data-reveal className="relative flex min-h-[420px] flex-col justify-end overflow-hidden rounded-[14px] border border-line-dark md:row-span-2">
            <Image src={b.photo.src} alt={b.photo.alt} fill sizes="(min-width: 768px) 400px, 100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink/40 to-ink" aria-hidden="true" />
            <div className="relative p-6">
              <p className="flex items-center gap-1.5 text-[14px] text-on-dark">
                <IconPin className="h-4 w-4" /> {b.photo.place}
              </p>
              <h3 className="display mt-24 text-[28px] text-mint">{b.photo.title}</h3>
              <p className="mt-2 max-w-[30ch] text-[15px] leading-snug text-on-dark-dim">{b.photo.body}</p>
            </div>
          </div>

          <ServiceCard tone="mint" icon={<IconContent />} title={PILLARS.content.label} body={`${PILLARS.content.blurb} ${b.pillars.content}`} />
          <ServiceCard tone="mint" icon={<IconHome />} title={PILLARS.home.label} body={`${PILLARS.home.blurb} ${b.pillars.home}`} />
          <ServiceCard tone="dark" icon={<IconAudit />} title={b.audit.title} body={b.audit.body} href="#audit" />
        </div>
      </div>
    </section>
  );
}
