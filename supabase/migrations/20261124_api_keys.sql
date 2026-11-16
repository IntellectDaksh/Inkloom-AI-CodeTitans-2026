-- API keys for programmatic checks. Only the sha256 of the key is stored; the key is shown once.
create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  organization_id text not null references public.organizations(id) on delete cascade,
  name text not null,
  prefix text not null,
  key_hash text not null unique,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);
create index if not exists api_keys_org_idx on public.api_keys(organization_id);
alter table public.api_keys enable row level security;
-- No policies: service role only.
revoke all on public.api_keys from anon, authenticated;
