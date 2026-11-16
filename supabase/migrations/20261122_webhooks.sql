-- Outgoing webhooks (Slack incoming webhook or generic JSON endpoint), one row per URL per organisation.
create table if not exists public.webhooks (
  id uuid primary key default gen_random_uuid(),
  organization_id text not null,
  url text not null check (url like 'https://%' and length(url) <= 500),
  events text[] not null default '{}',
  secret text not null,
  created_at timestamptz not null default now()
);
create index if not exists webhooks_org_idx on public.webhooks(organization_id);
alter table public.webhooks enable row level security; -- service role only, no policies
