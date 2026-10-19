# Janobi Sports · sports.janobi.agency

Landing page for athletes and fighters: a free Personal Brand Audit (9 questions → score → profile handles → a 20-minute Cal.com call).
Spec: `../SPEC.md`. Copy, emails and call script: `../strategy/`.

```bash
npm install
npm run dev -- -p 3230   # http://localhost:3230
```

## How it's hosted

| Piece | Where |
|---|---|
| The site | Plain static files. `npm run build` writes `out/`; `.github/workflows/deploy.yml` uploads it to Hostinger over FTPS on every push to `main`. No Node app on Hostinger. |
| Security headers, HTTPS redirect, 404 | `public/.htaccess` (copied into `out/`) |
| Backend: save the audit, lead alert, score email, Resend events, Cal.com webhook | Supabase Edge Function `sports` in project `eziqtmufajtciszxgazz`. Code: `lib/server/handlers.ts`, entry `edge/sports.ts`. |
| Leads | Supabase table `sports_audits` (`supabase/schema.sql`) |

The browser posts to `https://eziqtmufajtciszxgazz.supabase.co/functions/v1/sports/lead` (`config/site.ts`, `API_BASE`). In `npm run dev` it posts to `/api/lead` instead: the same handlers behind the dev-only `app/api/*/route.dev.ts`, writing leads to `.local-data/` when Supabase keys are blank.

## Changing the backend

1. Edit `lib/server/*`, run `npm test`.
2. `npm run build:edge` → regenerates `supabase/functions/sports/index.ts`. Commit it (CI fails if it's stale).
3. Redeploy the function: Supabase dashboard, `supabase functions deploy sports --no-verify-jwt`, or ask Claude (Supabase MCP).

JWT verification is off on purpose: the audit form is public, the Cal webhook is HMAC-signed, the call page is HMAC-token gated.

## Function secrets (Supabase → Edge Functions → Secrets)

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` come built in. Set these three (same values as `.env.local`):

- `RESEND_API_KEY`
- `OUTCOME_SECRET` (signs the "log the call" link in lead alerts)
- `CAL_WEBHOOK_SECRET`

Sender, alert inbox and Cal link default in `scripts/build-edge.mjs`; a secret with the same name overrides them.

## Cal.com webhook

Cal.com → Settings → Developer → Webhooks → URL `https://eziqtmufajtciszxgazz.supabase.co/functions/v1/sports/cal`, triggers BOOKING_CREATED and BOOKING_RESCHEDULED, secret = `CAL_WEBHOOK_SECRET`.

## Checks

```bash
npm run typecheck && npm test && npm run lint && npm run build
```
