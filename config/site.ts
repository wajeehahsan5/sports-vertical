/** Facts the page and the privacy notice rely on. Keep them true. */

export const PRIVACY_CONTACT_EMAIL = "privacy@outreach.janobi.agency";
export const PRIVACY_UPDATED = "16 October 2026";
/** Audit leads are kept this long, or until someone asks us to delete them. */
export const RETENTION_MONTHS = 12;

/** Founding-athlete spots still open. Update by hand when one signs. 0 hides the line. */
export const FOUNDING_SPOTS_LEFT = 5;
export const FOUNDING_SPOTS_TOTAL = 5;

/**
 * Where the browser sends audits and bookings. Live: the Supabase Edge Function `sports`
 * (the site is static files). In `npm run dev`: the dev-only routes under app/api.
 */
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  (process.env.NODE_ENV === "production" ? "https://eziqtmufajtciszxgazz.supabase.co/functions/v1/sports" : "/api");
