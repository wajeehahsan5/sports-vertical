"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { COPY } from "@/config/copy";
import { IconArrowUpRight, IconInstagram, IconPin, IconTikTok, IconYouTube } from "@/components/ui/Icons";

/**
 * The reference's hero bento, under an arena spotlight. Left: a small colour card with a photo,
 * an avatar card, then the headline card with the mint CTA block. Right: the photo slider.
 */
export function Hero() {
  const h = COPY.hero;
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setI((x) => (x + 1) % h.images.length), 5000);
    return () => window.clearInterval(t);
  }, [h.images.length]);

  return (
    <section className="spotlight">
      <div className="mx-auto grid max-w-[1240px] gap-3 px-4 pb-24 sm:px-6 lg:grid-cols-2 lg:pb-36">
        <div className="grid grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] grid-rows-[auto_1fr] gap-3 sm:grid-cols-[200px_minmax(0,1fr)]">
          <div data-reveal className="relative flex aspect-square flex-col overflow-hidden rounded-[14px] bg-magenta p-4 text-white">
            <Image src={h.tag.image} alt="" fill sizes="200px" className="photo object-cover opacity-80 mix-blend-luminosity" />
            <div className="absolute inset-0 bg-gradient-to-b from-magenta via-magenta/40 to-transparent" aria-hidden="true" />
            <p className="relative flex items-center gap-1.5 text-[14px] font-medium">
              <IconPin className="h-4 w-4" /> {h.tag.place}
            </p>
          </div>

          <div data-reveal className="card flex flex-col items-start justify-center gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
            <div className="flex shrink-0 -space-x-3">
              {h.avatars.map((src) => (
                <span key={src} className="relative h-11 w-11 overflow-hidden rounded-full border-2 border-surface bg-surface-2">
                  <Image src={src} alt="" fill sizes="44px" className="object-cover" />
                </span>
              ))}
            </div>
            <p className="text-[13px] leading-snug text-fg-body sm:text-[14px]">{h.stat}</p>
          </div>

          <div data-reveal className="card col-span-2 flex flex-col justify-between gap-12 p-6 sm:p-10">
            <h1 className="display max-w-[16ch] text-[clamp(46px,5vw,76px)] [text-wrap:balance]">{h.h1}</h1>
            <a href="#audit" className="group flex w-full max-w-[340px] flex-col gap-6 rounded-[12px] bg-mint p-4 text-ink">
              <span className="flex gap-1.5" aria-hidden="true">
                {[IconInstagram, IconTikTok, IconYouTube].map((Icon, n) => (
                  <span key={n} className="grid h-7 w-9 place-items-center rounded-[6px] bg-ink text-mint">
                    <Icon />
                  </span>
                ))}
              </span>
              <span className="flex items-end justify-between gap-4">
                <span className="display text-[22px] leading-[1]">
                  {h.ctaLabel[0]}
                  <br />
                  {h.ctaLabel[1]}
                </span>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[8px] bg-ink text-mint transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                  <IconArrowUpRight />
                </span>
              </span>
            </a>
          </div>
        </div>

        <div data-reveal className="relative min-h-[480px] overflow-hidden rounded-[14px] border border-line bg-surface lg:min-h-[660px]">
          {h.images.map((img, n) => (
            <Image
              key={img.src}
              src={img.src}
              alt={img.alt}
              fill
              priority={n === 0}
              sizes="(min-width: 1024px) 620px, 100vw"
              className={`photo object-cover transition-opacity duration-700 ${n === i ? "opacity-100" : "opacity-0"}`}
            />
          ))}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg/80 to-transparent" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-6 flex justify-center gap-2">
            {h.images.map((img, n) => (
              <button
                key={img.src}
                type="button"
                aria-label={`Show photo ${n + 1}`}
                aria-current={n === i}
                onClick={() => setI(n)}
                className={`h-[5px] w-10 rounded-full transition-colors ${n === i ? "bg-mint" : "bg-white/70"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
