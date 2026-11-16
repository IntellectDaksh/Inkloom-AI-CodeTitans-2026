-- Help requests, suggestions and bug reports sent from the in-app "Help & feedback" button.
create table if not exists public.feedback (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  kind text not null check (kind in ('help', 'suggestion', 'bug', 'other')),
  message text not null check (length(message) between 5 and 5000),
  email text,
  page text,
  user_id uuid,
  organization_id text,
  user_agent text,
  status text not null default 'new' check (status in ('new', 'read', 'done'))
);
create index if not exists feedback_time_idx on public.feedback(created_at desc);
alter table public.feedback enable row level security; -- service role only
