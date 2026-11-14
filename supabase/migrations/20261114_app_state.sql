-- Single-document app state used by src/lib/db/store.ts (server-side only).
create table if not exists public.app_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
-- RLS on with no policies: only the service role (server) can read or write.
alter table public.app_state enable row level security;
