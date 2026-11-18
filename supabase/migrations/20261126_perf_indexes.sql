-- Lookups that run on every share-link view, API call and webhook fan-out.
create index if not exists share_links_token_hash_idx on public.share_links(token_hash);
create index if not exists api_keys_key_hash_idx on public.api_keys(key_hash);
create index if not exists webhooks_org_idx on public.webhooks(organization_id);
create index if not exists memberships_user_idx on public.memberships(user_id);
create index if not exists invites_org_idx on public.invites(organization_id);
create index if not exists rate_limits_window_idx on public.rate_limits(window_start);

-- Clean old rate-limit rows on ~1 in 500 calls instead of 1 in 100: less write load per request.
create or replace function public.rate_limit_hit(p_key text, p_limit int, p_window_seconds int)
returns boolean language plpgsql security definer set search_path = public as $$
declare w timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
        n int;
begin
  insert into rate_limits (key, window_start, hits) values (p_key, w, 1)
    on conflict (key, window_start) do update set hits = rate_limits.hits + 1
    returning hits into n;
  if random() < 0.002 then
    delete from rate_limits where window_start < now() - interval '2 days';
  end if;
  return n <= p_limit;
end $$;
revoke all on function public.rate_limit_hit(text, int, int) from public, anon, authenticated;
