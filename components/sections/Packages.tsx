import { PACKAGES, type PackageId } from "@/config/audit";
import { COPY } from "@/config/copy";
import { FOUNDING_SPOTS_LEFT, FOUNDING_SPOTS_TOTAL } from "@/config/site";
import { ArrowCta } from "@/components/ui/ArrowCta";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { IconContent, IconHome, IconIdentity, IconTile } from "@/components/ui/Icons";

const ORDER: { id: PackageId; icon: React.ReactNode }[] = [
  { id: "weigh-in", icon: <IconIdentity /> },
  { id: "camp", icon: <IconContent /> },
  { id: "title-run", icon: <IconHome /> },
];

export function Packages() {
  const p = COPY.packages;
  return (
    <section id="packages" className="mx-auto max-w-[1240px] scroll-mt-4 px-4 py-24 sm:px-6 lg:py-32">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <Eyebrow>{p.eyebrow}</Eyebrow>
          <h2 className="display mt-4 text-[clamp(34px,4vw,52px)]">{p.h2}</h2>
          <p className="mt-3 max-w-[56ch] text-[16px] text-body">{p.sub}</p>
        </div>
        <ArrowCta>{COPY.hero.cta}</ArrowCta>
      </div>
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {ORDER.map(({ id, icon }, n) => {
          const k = PACKAGES[id];
          const loud = n === 1;
          return (
            <article key={id} data-reveal className={`flex min-h-[340px] flex-col justify-between rounded-[14px] p-6 ${loud ? "bg-mint" : "card"}`}>
              <div className="flex items-start justify-between gap-4">
                <IconTile tone={loud ? "on-mint" : "on-cream"}>{icon}</IconTile>
                <span className="label text-dim">{k.kind}</span>
              </div>
              <div>
                <h3 className="display text-[32px]">{k.name}</h3>
                <p className="mt-1 text-[15px] text-body">{k.line}</p>
                <ul className="mt-5 flex flex-col gap-1.5 text-[15px]">
                  {k.includes.map((x) => (
                    <li key={x} className="flex gap-2">
                      <span aria-hidden="true">»</span>
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          );
        })}
      </div>
      {FOUNDING_SPOTS_LEFT > 0 ? (
        <div data-reveal className="mt-4 flex flex-col gap-4 rounded-[14px] bg-ink p-6 text-on-dark md:flex-row md:items-center md:justify-between">
          <p className="text-[16px]">
            <span className="mr-2 rounded-full bg-magenta px-2 py-0.5 text-[13px] text-white">Founding</span>
            {p.founding(FOUNDING_SPOTS_LEFT, FOUNDING_SPOTS_TOTAL)}
          </p>
          <ArrowCta tone="mint">{COPY.hero.cta}</ArrowCta>
        </div>
      ) : null}
    </section>
  );
}
