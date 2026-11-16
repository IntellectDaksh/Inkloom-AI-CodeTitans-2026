-- Read-only, expiring share links for a review result. Only the SHA-256 of the token is stored;
-- snapshot is a frozen copy of the report so the public page never reads org data.
create table if not exists public.share_links (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  organization_id text not null references public.organizations(id) on delete cascade,
  submission_id text not null,
  created_by uuid references auth.users(id) on delete set null,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  snapshot jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists share_links_org_sub_idx on public.share_links(organization_id, submission_id);
alter table public.share_links enable row level security;
revoke all on public.share_links from anon, authenticated;
