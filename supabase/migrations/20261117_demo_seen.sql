-- First-run product demo: shown once per account, stamped when finished or skipped.
alter table public.profiles add column if not exists demo_seen_at timestamptz;
grant update (demo_seen_at) on public.profiles to authenticated;
