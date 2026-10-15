/** The reference's CTA: a pill with a separate round arrow button beside it. */
type Tone = "primary" | "ghost" | "on-mint";

const LOOK: Record<Tone, { pill: string; arrow: string }> = {
  primary: { pill: "btn btn-mint", arrow: "bg-fg text-ink" },
  ghost: { pill: "btn btn-ghost", arrow: "bg-mint text-ink" },
  "on-mint": { pill: "btn bg-ink text-mint", arrow: "bg-ink text-mint" },
};

export function ArrowCta({ children, href = "#audit", tone = "primary" }: { children: React.ReactNode; href?: string; tone?: Tone }) {
  const l = LOOK[tone];
  return (
    <a href={href} className="group inline-flex items-center gap-1">
      <span className={l.pill}>{children}</span>
      <span aria-hidden="true" className={`grid h-12 w-12 place-items-center rounded-full text-[18px] transition-transform duration-150 group-hover:translate-x-1 ${l.arrow}`}>
        »
      </span>
    </a>
  );
}
