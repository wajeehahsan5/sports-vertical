/** The reference's CTA: a pill with a separate round arrow button beside it. */
export function ArrowCta({ children, href = "#audit", tone = "ink" }: { children: React.ReactNode; href?: string; tone?: "ink" | "mint" }) {
  return (
    <a href={href} className="group inline-flex items-center gap-1">
      <span className={`btn ${tone === "ink" ? "btn-ink" : "btn-mint"}`}>{children}</span>
      <span
        aria-hidden="true"
        className={`btn-arrow transition-transform duration-150 group-hover:translate-x-1 ${tone === "mint" ? "!bg-mint !text-ink" : ""}`}
      >
        »
      </span>
    </a>
  );
}
