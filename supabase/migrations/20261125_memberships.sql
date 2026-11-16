-- A user can belong to several organisations. profiles.organization_id/role stay the *current* one.
create table if not exists public.memberships (
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id text not null references public.organizations(id) on delete cascade,
  role text not null default 'creator' check (role in ('admin','brand_manager','reviewer','creator')),
  created_at timestamptz not null default now(),
  primary key (user_id, organization_id)
);
create index if not exists memberships_org_idx on public.memberships(organization_id);
alter table public.memberships enable row level security;
revoke all on public.memberships from anon, authenticated;

insert into public.memberships (user_id, organization_id, role)
  select id, organization_id, role from public.profiles where organization_id is not null
  on conflict do nothing;

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
  insert into memberships (user_id, organization_id, role) values (new.id, org, r) on conflict do nothing;
  return new;
end $$;
