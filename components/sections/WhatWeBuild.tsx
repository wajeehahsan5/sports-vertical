import Image from "next/image";
import { PILLARS } from "@/config/audit";
import { COPY } from "@/config/copy";
import { ArrowCta } from "@/components/ui/ArrowCta";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { IconAudit, IconContent, IconHome, IconIdentity, IconPin, IconTile } from "@/components/ui/Icons";

type Tone = "dark" | "mint";

function ServiceCard({ tone, icon, title, body }: { tone: Tone; icon: React.ReactNode; title: string; body: string }) {
  const look = tone === "mint" ? "bg-mint text-ink" : "border border-line bg-surface text-fg";
  return (
    <div data-reveal className={`flex min-h-[300px] flex-col justify-between rounded-[14px] p-6 ${look}`}>
      <IconTile tone={tone === "mint" ? "on-mint" : "on-dark"}>{icon}</IconTile>
      <div>
        <h3 className={`display text-[30px] ${tone === "mint" ? "text-ink" : "text-mint"}`}>{title}</h3>
        <p className={`mt-2 max-w-[30ch] text-[15px] leading-snug ${tone === "mint" ? "text-ink/80" : "text-fg-body"}`}>{body}</p>
      </div>
    </div>
  );
}

/** The one card in the bento that is a button: mint border, round arrow, a solid pill, fills on hover. */
function AuditCard({ title, body, cta }: { title: string; body: string; cta: string }) {
  return (
    <a
      data-reveal
      href="#audit"
      className="group relative flex min-h-[300px] flex-col justify-between overflow-hidden rounded-[14px] border-2 border-mint bg-surface p-6 text-fg shadow-[0_0_40px_-12px_rgba(155,234,202,0.5)] transition-colors duration-200 hover:bg-mint hover:text-ink"
    >
      <div className="flex items-start justify-between">
        <span className="grid h-[52px] w-[52px] place-items-center rounded-[12px] bg-mint text-ink transition-colors group-hover:bg-ink group-hover:text-mint">
          <IconAudit />
        </span>
        <span aria-hidden="true" className="grid h-12 w-12 place-items-center rounded-full border border-mint text-[18px] text-mint transition-all group-hover:translate-x-1 group-hover:border-ink group-hover:text-ink">
          »
        </span>
      </div>
      <div>
        <h3 className="display text-[30px] text-mint transition-colors group-hover:text-ink">{title}</h3>
        <p className="mt-2 max-w-[30ch] text-[15px] leading-snug text-fg-body transition-colors group-hover:text-ink/80">{body}</p>
        <span className="btn btn-mint mt-5 transition-colors group-hover:bg-ink group-hover:text-mint">
          {cta} <span aria-hidden="true">»</span>
        </span>
      </div>
    </a>
  );
}

/** Cage band. The reference's 3×2 bento: a tall photo card in the middle, mint and dark cards in a checkerboard. */
export function WhatWeBuild() {
  const b = COPY.build;
  return (
    <section id="build" className="cage scroll-mt-4 border-y border-line py-24 lg:py-32">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>{b.eyebrow}</Eyebrow>
            <h2 className="display mt-4 max-w-[22ch] text-[clamp(36px,4.2vw,56px)]">{b.h2}</h2>
          </div>
          <ArrowCta tone="ghost">{b.cta}</ArrowCta>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          <ServiceCard tone="dark" icon={<IconIdentity />} title={PILLARS.identity.label} body={`${PILLARS.identity.blurb} ${b.pillars.identity}`} />

          <div data-reveal className="relative flex min-h-[440px] flex-col justify-end overflow-hidden rounded-[14px] border border-line md:row-span-2">
            <Image src={b.photo.src} alt={b.photo.alt} fill sizes="(min-width: 768px) 400px, 100vw" className="photo object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg/50 to-bg" aria-hidden="true" />
            <div className="relative p-6">
              <p className="flex items-center gap-1.5 text-[14px] text-fg">
                <IconPin className="h-4 w-4" /> {b.photo.place}
              </p>
              <h3 className="display mt-24 text-[30px] text-mint">{b.photo.title}</h3>
              <p className="mt-2 max-w-[30ch] text-[15px] leading-snug text-fg-body">{b.photo.body}</p>
            </div>
          </div>

          <ServiceCard tone="mint" icon={<IconContent />} title={PILLARS.content.label} body={`${PILLARS.content.blurb} ${b.pillars.content}`} />
          <ServiceCard tone="mint" icon={<IconHome />} title={PILLARS.home.label} body={`${PILLARS.home.blurb} ${b.pillars.home}`} />
          <AuditCard title={b.audit.title} body={b.audit.body} cta={b.audit.cta} />
        </div>
      </div>
    </section>
  );
}
