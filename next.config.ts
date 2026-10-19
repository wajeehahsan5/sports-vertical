import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/**
 * The live site is plain static files (`next build` → out/), uploaded to Hostinger's
 * public_html by .github/workflows/deploy.yml. No Node app on the server.
 *
 * The backend (save the audit, emails, Cal.com webhook) is the Supabase Edge Function
 * `sports` (edge/sports.ts). In `npm run dev` the same code runs behind the dev-only
 * app/api/{lead,cal}/route.dev.ts, so the funnel can be clicked through locally.
 *
 * Live security headers (CSP etc.) are in public/.htaccess; the ones here are for dev only.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://app.cal.com 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://app.cal.com",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://app.cal.com https://*.supabase.co ws: wss:",
  "frame-src https://app.cal.com https://cal.com",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = isDev
  ? {
      // `route.dev.ts` files are routes only in dev; the static build ignores them.
      pageExtensions: ["tsx", "ts", "dev.ts"],
      // Lets a phone on the same Wi-Fi load the dev server (http://192.168.100.243:3230).
      allowedDevOrigins: ["192.168.100.243"],
      images: { unoptimized: true },
      async headers() {
        return [{ source: "/:path*", headers: [{ key: "Content-Security-Policy", value: csp }] }];
      },
    }
  : {
      output: "export",
      // /book/ and /call/ become folders with an index.html, which Apache serves as-is.
      trailingSlash: true,
      // Photos in public/img are already sized and compressed; there is no image server.
      images: { unoptimized: true },
      poweredByHeader: false,
    };

export default nextConfig;
