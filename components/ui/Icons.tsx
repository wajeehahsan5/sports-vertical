/** Small line icons for the card tiles and chips. 24px grid, stroke follows currentColor. */
type P = { className?: string };
const base = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const IconIdentity = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden="true">
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c1.2-3.5 4-5 7-5s5.8 1.5 7 5" />
  </svg>
);
export const IconContent = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden="true">
    <rect x="3" y="6" width="13" height="12" rx="2.5" />
    <path d="M16 10.5 21 8v8l-5-2.5" />
  </svg>
);
export const IconHome = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.3 2.4 3.4 5.2 3.4 8.5s-1.1 6.1-3.4 8.5c-2.3-2.4-3.4-5.2-3.4-8.5S9.7 5.9 12 3.5Z" />
  </svg>
);
export const IconAudit = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden="true">
    <path d="M9 4h6M9 4a1 1 0 0 0-1 1v1h8V5a1 1 0 0 0-1-1M8 6H6.5A1.5 1.5 0 0 0 5 7.5v12A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5v-12A1.5 1.5 0 0 0 17.5 6H16" />
    <path d="m9 13.5 2 2 4-4" />
  </svg>
);
export const IconPin = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden="true">
    <path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11Z" />
    <circle cx="12" cy="10" r="2.3" />
  </svg>
);
export const IconArrowUpRight = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden="true">
    <path d="M7 17 17 7M9 7h8v8" />
  </svg>
);
export const IconInstagram = ({ className }: P) => (
  <svg {...base} width={14} height={14} className={className} aria-hidden="true">
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" />
  </svg>
);
export const IconTikTok = ({ className }: P) => (
  <svg {...base} width={14} height={14} className={className} aria-hidden="true">
    <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.5 2.6 2.3 4.3 5 4.5" />
  </svg>
);
export const IconYouTube = ({ className }: P) => (
  <svg {...base} width={14} height={14} className={className} aria-hidden="true">
    <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
    <path d="m10.5 9.5 4 2.5-4 2.5Z" fill="currentColor" />
  </svg>
);

/** The reference's square icon tile, top-left of every service card. */
export function IconTile({ children, tone }: { children: React.ReactNode; tone: "on-dark" | "on-mint" }) {
  const look = tone === "on-mint" ? "bg-ink text-mint" : "border border-line-strong bg-surface-2 text-mint";
  return <span className={`grid h-[52px] w-[52px] place-items-center rounded-[12px] ${look}`}>{children}</span>;
}
