-- Ops hardening: error log, append-only audit log, account-saved preferences, upload limits.

-- 1. Server and browser errors land here (service role only), so production failures are visible.
create table if not exists public.error_events (
  id bigserial primary key,
  occurred_at timestamptz not null default now(),
  source text not null check (source in ('server', 'client')),
  route text,
  message text not null,
  digest text,
  stack text,
  user_id uuid,
  organization_id text,
  user_agent text
);
create index if not exists error_events_time_idx on public.error_events(occurred_at desc);
alter table public.error_events enable row level security;

-- 2. Audit log: append-only copy of every audit event. Inserts only; updates and deletes are refused
--    by a trigger even for the service role, so the record can't be quietly rewritten.
create table if not exists public.audit_log (
  id text primary key,
  organization_id text not null,
  brand_id text,
  user_id text,
  entity_type text not null,
  entity_id text not null,
  action text not null,
  metadata jsonb not null default '{}',
  hash text,
  prev_hash text,
  created_at timestamptz not null
);
create index if not exists audit_log_org_time_idx on public.audit_log(organization_id, created_at desc);
alter table public.audit_log enable row level security;
drop policy if exists "audit read own org" on public.audit_log;
create policy "audit read own org" on public.audit_log for select to authenticated
  using (organization_id = public.my_org());
grant select on public.audit_log to authenticated;

create or replace function public.audit_log_immutable() returns trigger
language plpgsql as $$
begin
  raise exception 'audit_log is append-only';
end $$;
drop trigger if exists audit_log_no_update on public.audit_log;
create trigger audit_log_no_update before update or delete on public.audit_log
  for each row execute function public.audit_log_immutable();

-- 3. Preferences (selected brand, strictness, onboarding state) follow the account, not the browser.
alter table public.profiles add column if not exists prefs jsonb not null default '{}';
grant update (prefs) on public.profiles to authenticated;

-- 4. Evidence uploads: enforce type and size in Storage itself, not just the browser.
update storage.buckets
  set file_size_limit = 15728640,
      allowed_mime_types = array[
        'application/pdf', 'image/png', 'image/jpeg', 'image/webp',
        'text/plain', 'text/markdown', 'text/csv', 'application/json',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'video/mp4', 'text/html', 'application/rtf'
      ]
  where id = 'evidence';
