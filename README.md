# Janobi · pool builder landing page

One page, one action: a Texas pool builder finishes the quiz with photos of a build attached, then books a call.
Spec: `../build/claude-code-prompt.md`. Campaign context: `../README.md`.

```bash
npm install
cp .env.example .env.local   # optional for local dev — see "Running without keys"
npm run dev                  # http://localhost:3000
```

## Status

| Piece | State |
|---|---|
| Quiz (7 steps + booking), uploads, lead API | Built, works end to end |
| Hero | Built, with the load sequence (hand drops the photo, reel comes out) |
| Sections 2–9, descent background, depth gauge | Built. Copy is draft 2 from `../strategy/06-copy-options.md` (hero: "Send us photos of your best pool. Get a free video back in 48 hours.") |
| GSAP motion | Built (`components/motion/PageMotion.tsx`); reduced motion registers nothing |
| Privacy notice + cookie notice | Built (`/privacy`, `components/legal/`) — contact email still TODO in `config/site.ts` |
| Video | Live: 3 Higgsfield sequences in `public/media/reel-{1,2,3}.mp4` (silent H.264, ~1.5–2MB) + posters. Hero and before/after reuse reel 1 |
| "Before" phone photo | Live: `public/media/before.jpg` — Higgsfield edit of the reel-1 source pool (flat 2pm shot, hose, plastic chair) |
| Builder + filmmaker | Wajeeh's cutouts (`../assets/characters/builder2.png`, `filmmaker3.png`) colour-traced with vtracer → `public/art/characters/*.svg` |
| Doodle icons | Wajeeh's Illustrator exports (`../assets/SVG/Artboard 4–13.svg`) → `public/art/icons/*.svg`; heart-bubble not placed yet |
| Hero hand | Wajeeh's glove (`Artboard 14.svg`) inlined in `components/art/Hand.tsx`, bar arm cropped; photo pinched in the thumb loop |
| Wordmark | Placeholder SVG trace of the PNG logo |

## Running without keys

With `SUPABASE_*` and `RESEND_*` blank, `npm run dev` still runs the whole funnel:

- Applications are written to `.local-data/leads/<id>.json`, uploads to `.local-data/uploads/<id>/` (gitignored — it's real applicant data once you test with real people).
- The notification email is printed to the terminal instead of sent.
- Pixel events log to the browser console as `[pixel:dev]`.
- With no `NEXT_PUBLIC_CAL_LINK`, step 8 shows a TODO box with a **Simulate a booking** button (dev only).

In production the local fallback is disabled: the API returns 500 until Supabase is configured.

## How the funnel writes data

| When | What happens |
|---|---|
| Step 6 submitted (name, email, phone) | `POST /api/lead {action:"contact"}` creates the row, status `contact`. A drop at the upload step still leaves a lead with contact details. |
| Files chosen in step 7 | Each file is compressed (photos → ~2MB JPEG), then `{action:"sign"}` returns a signed upload URL and the browser PUTs straight to Supabase Storage with per-file progress. Three at a time; failures retry individually. |
| "Send my build" | `{action:"complete"}` → row updated with file paths, status `uploaded` → team emailed with answers + 14-day signed file links → Pixel `Lead`. All before the calendar loads. |
| Cal.com `bookingSuccessfulV2` | `{action:"booked"}` → booking uid/time on the row, status `booked` → Pixel custom `Booked`. |

Quiz answers, the application id and finished uploads survive a reload (sessionStorage), so going to the camera roll and back — or iOS reloading the tab — doesn't lose anything.

## Weekly capacity

The live "N of 6 left this week" counter was removed on 2026-09-30 (Wajeeh: "six builds a week" didn't read clearly). The hero's right card is now the risk reversal. If scarcity comes back, it must be a real count, never a hardcoded number.

## Swapping in real video

Every path lives in `config/media.ts`. Put files in `public/media/` (or use a CDN URL):

```ts
export const heroReel: Reel = {
  id: "hero",
  src: "/media/hero-reel.mp4",     // vertical 9:16, silent, H.264, ideally < 3MB
  poster: "/media/hero-reel.jpg",  // required — the poster is the LCP element, never the video
  label: "A Houston backyard pool as a cinematic reel",
};
```

`ReelFrame` renders every video `autoplay muted loop playsinline`. Don't remove `playsinline` — iOS goes fullscreen without it.

## Swapping in final art

All illustration is inline SVG in `components/art/`, one component per element:
`Hand`, `Builder`, `Filmmaker`, `Connector`, `CursorSticker`, `Ripple`, and doodle icons in `components/art/icons/`.

Rules for a drop-in replacement:

1. **Keep the component name and the viewBox.** Layout sizes against them (`Hand` is `0 0 200 860`, bottom edge = bottom of the photo).
2. **Keep the `data-part` attributes.** Motion targets `[data-part="arm"]`, `palm`, `finger-back`, `finger-front`, `photo` on the hand; `head`, `phone-arm` on the builder; `camera`, `fins`, `bubbles` on the filmmaker. Never target internal ids.
3. Colours as `var(--token)` only. Stroke `var(--ink)`, width 3 at a 200-unit viewBox, round caps and joins.
4. Delete the `// PLACEHOLDER ART` line.

Exporting from Illustrator: *File → Export → Export As → SVG*, Styling: *Presentation Attributes*, Decimal places: 1, then replace hex fills with `var(--mint)` etc. The doodle pack's licence must cover commercial web use.

`components/ui/Wordmark.tsx` is a trace of `Brand/LOGO/1x/ICON.png` with the name set in Poppins — swap for a real SVG export of the logo when one exists.

## Supabase

1. Create a project (or reuse one). US region is closest to Texas visitors.
2. SQL editor → run `supabase/schema.sql`. It creates `public.pool_applications` (RLS on, no public policies) and the private `builds` bucket.
3. Project Settings → API: copy the URL and the **service role** key into `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`. Optionally the publishable key into `SUPABASE_PUBLISHABLE_KEY`.
4. **File size:** capped at 50MB per file, the free plan's ceiling. `MAX_FILE_BYTES` in `config/quiz.ts` and `file_size_limit` in `schema.sql` match — change both together.

The service role key never reaches the browser — it's only read in `lib/server/`.

## Email (Resend)

Verify a sending domain in Resend, then set `RESEND_API_KEY`, `RESEND_FROM` (on that domain) and `LEAD_NOTIFY_EMAIL` (comma-separate several). Reply-to is set to the builder's email.

## Meta Pixel

Set `NEXT_PUBLIC_META_PIXEL_ID` (currently `1740370533710697`). The page loads the Pixel itself — **don't also add the GTM container to this page**, or PageView fires twice. Events: `PageView` on load, `Lead` when the upload step completes (optimise the campaign on this), custom `Booked` on a confirmed booking. Both carry an `eventID` (the application id) so a Conversions API integration can deduplicate later. Check with Meta's Pixel Helper and Events Manager → Test events before launch.

## Cal.com

1. Create an event type, 25 minutes.
2. **Limits → Minimum notice: 48 hours.** This is set on Cal.com, not in the page.
3. Availability must cover **US Central mornings** (evening in Karachi). If a Texas visitor sees no slots, the funnel dead-ends silently.
4. Set `NEXT_PUBLIC_CAL_LINK` to the part after `cal.com/`, e.g. `janobi/build-reel`.

The embed is inline, themed from `tokens.css` at runtime, prefilled with name and email, and passes the application id as `metadata[leadId]` so bookings can be matched to rows.

## Security

**Built in**

- Supabase: RLS on with no policies, `anon`/`authenticated` hold no privileges on `pool_applications`, private `builds` bucket (50MB, images/videos only). Only the server holds the secret key; it's never `NEXT_PUBLIC_`.
- Uploads go through one-path signed upload URLs (`x-upsert: false`, so nothing can be overwritten). The team gets 14-day signed download links, never public URLs.
- `/api/lead`: server-side validation of every field, UUID ids, storage paths locked to the application's own folder, 32KB JSON cap, per-IP rate limits and a 300-a-day cap on new applications (`lib/server/rate-limit.ts`). Before emailing, the server checks the uploaded files actually exist in storage.
- Security headers on every response (`next.config.ts`): a Content Security Policy that only allows Meta, Cal.com and Supabase, `frame-ancestors 'none'`, `nosniff`, strict referrer, HSTS in production.
- Secrets live in `.env.local` (gitignored) locally and in the host's environment settings in production. Test lead data in `.local-data/` is gitignored.

**Do yourself**

- Turn on 2FA for Supabase, Resend, Meta Business, Cal.com, Hostinger, SiteGround and GitHub.
- Rotate any key that has been pasted into a chat, email or doc. In Resend, give the production key **Sending access** only, restricted to `outreach.janobi.agency`.
- On the host, set the env vars in the panel — never upload `.env.local`.
- Keep Next.js patched (`npm outdated`, `npm audit`) — framework CVEs are the realistic way in.
- Decide how long you keep applicants' photos and details, and delete the rest. Meta's Business Tools terms also expect a privacy notice on a page that runs the Pixel and collects contact details.
- If spam applications ever show up, add Cloudflare Turnstile to the contact step. It's left out for now because every extra step costs real leads.

## Deploy (Hostinger)

Hostinger Business → Node.js app, imported from the private GitHub repo `wajeehahsan5/janobi-pool-site`, branch `main`. Node 24, build `npm run build`, start `npm start`. Every variable from `.env.example` goes in the app's environment settings (never `ALLOW_LOCAL_STORE`, never the `.env.local` file itself).

`npm run build` is `next build --webpack` on purpose: Hostinger's build sandbox kills the child process Turbopack spawns to run PostCSS (`node process exited before we could connect to it`), so the default Turbopack build fails there. Local `npm run dev` still uses Turbopack.

After deploying, run one real submission from a phone: photos from the camera roll, a booking, the email arriving, the row in Supabase, `Lead` and `Booked` in Events Manager.

Uploads go browser → Supabase directly, so the host's request body limits don't apply.
