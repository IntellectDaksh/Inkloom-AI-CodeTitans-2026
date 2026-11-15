-- First-run profile setup: new accounts (email or Google) complete a profile before anything else.
alter table public.profiles add column if not exists job_title text not null default '';
alter table public.profiles add column if not exists terms_accepted_at timestamptz;
alter table public.profiles add column if not exists profile_completed_at timestamptz;
-- Everyone who existed before this step counts as set up.
update public.profiles set profile_completed_at = coalesce(profile_completed_at, created_at), terms_accepted_at = coalesce(terms_accepted_at, created_at);
