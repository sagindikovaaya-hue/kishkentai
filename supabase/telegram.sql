-- Kishkentai: Telegram bot (run once in SQL Editor). Replace PASTE_CRON_SECRET with the CRON_SECRET you set for the function.
create table if not exists public.telegram_links (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  chat_id    bigint not null,
  created_at timestamptz not null default now()
);
alter table public.telegram_links enable row level security;
drop policy if exists "own telegram read" on public.telegram_links;
create policy "own telegram read" on public.telegram_links for select using (auth.uid() = user_id);  -- the site can show "connected"

create extension if not exists pg_cron;
create extension if not exists pg_net;
-- every Sunday 14:00 UTC = 19:00 in Almaty / Astana
select cron.unschedule('kishkentai-weekly') where exists (select 1 from cron.job where jobname = 'kishkentai-weekly');
select cron.schedule('kishkentai-weekly', '0 14 * * 0', $$
  select net.http_post(
    url     := 'https://ktrgvmuctcjyniptwvjl.supabase.co/functions/v1/telegram-bot?task=weekly',
    headers := jsonb_build_object('x-cron-secret', 'PASTE_CRON_SECRET', 'content-type', 'application/json'),
    body    := '{}'::jsonb);
$$);
