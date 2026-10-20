-- Janobi Sports · Personal Brand Audit leads
-- Run once in the Supabase SQL editor. The site talks to Supabase only from the
-- server with the service-role key, so RLS is on with NO policies.

create table if not exists public.sports_audits (
  id            uuid primary key,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  status        text not null default 'audited'
                check (status in ('audited', 'booked', 'no_show', 'client', 'lost')),

  name          text not null,
  email         text not null,
  instagram     text not null,
  tiktok        text,
  youtube       text,
  website       text,
  whatsapp      text,
  based_in      text not null check (based_in in ('uk', 'us', 'elsewhere')),

  sport         text not null,
  level         text not null,
  answers       jsonb not null,
  scores        jsonb not null,   -- { overall, pillars, findings, pkg } as computed on the server
  pkg           text not null,

  ref           text,
  attribution   jsonb not null default '{}'::jsonb,
  user_agent    text,

  alerted_at    timestamptz,
  booking_uid   text,
  booking_start timestamptz,
  booked_at     timestamptz
);

-- Since 30 Oct 2026 Supabase no longer grants Data API access to new public tables.
-- The server (service role) needs an explicit grant or every write fails with "permission denied".
grant select, insert, update, delete on public.sports_audits to service_role;

create index if not exists sports_audits_status_idx on public.sports_audits (status, created_at desc);
create index if not exists sports_audits_ref_idx on public.sports_audits (ref);
create index if not exists sports_audits_email_idx on public.sports_audits (email);

alter table public.sports_audits enable row level security;
revoke all on table public.sports_audits from anon, authenticated;
