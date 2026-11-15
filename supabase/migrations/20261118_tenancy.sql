-- Tenancy: every account belongs to one organisation; app data is one document per organisation.
-- Fixes: cross-company data visibility, last-write-wins overwrites, global profile reads,
-- hardcoded owner admin, unlimited public AI calls.

create table if not exists public.organizations (
  id text primary key,
  name text not null default 'My company',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.organizations enable row level security;

-- The original single document becomes the owner's organisation.
insert into public.organizations (id, name) values ('main', 'Uideas') on conflict (id) do nothing;

alter table public.profiles add column if not exists organization_id text references public.organizations(id) on delete cascade;
update public.profiles set organization_id = 'main' where organization_id is null;
alter table public.profiles alter column organization_id set not null;
create index if not exists profiles_org_idx on public.profiles(organization_id);

-- Optimistic concurrency for the per-organisation document.
alter table public.app_state add column if not exists version bigint not null default 0;
alter table public.app_state add column if not exists organization_id text references public.organizations(id) on delete cascade;
update public.app_state set organization_id = id where organization_id is null and id in (select id from public.organizations);

-- Compare-and-swap write: succeeds only if nobody else wrote since we read.
create or replace function public.app_state_cas(p_id text, p_version bigint, p_data jsonb)
returns bigint language plpgsql security definer set search_path = public as $$
declare v bigint;
begin
  if p_version = 0 then
    insert into app_state (id, organization_id, data, version, updated_at)
      values (p_id, p_id, p_data, 1, now())
      on conflict (id) do nothing
      returning version into v;
  else
    update app_state set data = p_data, version = version + 1, updated_at = now()
      where id = p_id and version = p_version
      returning version into v;
  end if;
  return v; -- null = conflict
end $$;
revoke all on function public.app_state_cas(text, bigint, jsonb) from public, anon, authenticated;

-- Profiles: only see people in your own organisation.
create or replace function public.my_org() returns text
language sql stable security definer set search_path = public as $$
  select organization_id from profiles where id = auth.uid()
$$;
drop policy if exists "profiles read" on public.profiles;
create policy "profiles read" on public.profiles for select to authenticated
  using (organization_id = public.my_org());

drop policy if exists "orgs read own" on public.organizations;
create policy "orgs read own" on public.organizations for select to authenticated
  using (id = public.my_org());
grant select on public.organizations to authenticated;

-- New signups: join the organisation they were invited to, otherwise get their own and be its admin.
create table if not exists public.invites (
  email text primary key,
  organization_id text not null references public.organizations(id) on delete cascade,
  role text not null default 'creator' check (role in ('admin','brand_manager','reviewer','creator')),
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.invites enable row level security;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare inv invites%rowtype; org text; r text;
begin
  select * into inv from invites where lower(email) = lower(new.email);
  if found then
    org := inv.organization_id; r := inv.role;
    delete from invites where lower(email) = lower(new.email);
  else
    org := 'org_' || replace(new.id::text, '-', '');
    insert into organizations (id, name, created_by)
      values (org, coalesce(nullif(new.raw_user_meta_data->>'company', ''), split_part(new.email, '@', 1) || '''s company'), new.id)
      on conflict (id) do nothing;
    r := 'admin';
  end if;
  insert into profiles (id, email, full_name, avatar_url, role, organization_id)
  values (
    new.id, new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), ''),
    new.raw_user_meta_data->>'avatar_url', r, org
  )
  on conflict (id) do nothing;
  return new;
end $$;

-- Rate limiting for AI endpoints (fixed window, keyed by user id or IP).
create table if not exists public.rate_limits (
  key text not null,
  window_start timestamptz not null,
  hits int not null default 0,
  primary key (key, window_start)
);
alter table public.rate_limits enable row level security;

create or replace function public.rate_limit_hit(p_key text, p_limit int, p_window_seconds int)
returns boolean language plpgsql security definer set search_path = public as $$
declare w timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
        n int;
begin
  insert into rate_limits (key, window_start, hits) values (p_key, w, 1)
    on conflict (key, window_start) do update set hits = rate_limits.hits + 1
    returning hits into n;
  delete from rate_limits where window_start < now() - interval '2 days' and random() < 0.01;
  return n <= p_limit;
end $$;
revoke all on function public.rate_limit_hit(text, int, int) from public, anon, authenticated;
