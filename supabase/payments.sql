-- Kishkentai: "I paid" requests from the payment screen. The parent can add and read only their own requests;
-- access itself opens when a row in public.subscriptions gets paid_until in the future (written by the owner or the payment server).
create table if not exists public.pay_requests (
  id         bigint generated always as identity primary key,
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  email      text,
  plan       text not null check (plan in ('month','year')),
  status     text not null default 'new' check (status in ('new','done','rejected')),
  created_at timestamptz not null default now()
);

alter table public.pay_requests enable row level security;

drop policy if exists "own request insert" on public.pay_requests;
drop policy if exists "own request read"   on public.pay_requests;
create policy "own request insert" on public.pay_requests for insert with check (auth.uid() = user_id and status = 'new');
create policy "own request read"   on public.pay_requests for select using (auth.uid() = user_id);

-- Opening access by hand (SQL editor), e.g. one month for a parent:
--   insert into public.subscriptions (user_id, plan, paid_until)
--   select id, 'month', now() + interval '1 month' from auth.users where email = 'mama@mail.kz'
--   on conflict (user_id) do update set plan = excluded.plan, paid_until = excluded.paid_until;
--   update public.pay_requests set status = 'done' where email = 'mama@mail.kz' and status = 'new';

-- Step 2: the Telegram bot announces every new request to the owner (with "1 month / 1 year / reject" buttons)
-- and reminds parents 3 days before their access ends. Needs pg_net and pg_cron (see telegram.sql).
alter table public.pay_requests add column if not exists notified_at timestamptz;

create or replace function public.pay_request_notify() returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform net.http_post(
    url     := 'https://ktrgvmuctcjyniptwvjl.supabase.co/functions/v1/telegram-bot?task=payreq',
    headers := '{"content-type":"application/json"}'::jsonb,
    body    := jsonb_build_object('id', new.id));
  return new;
end $$;
drop trigger if exists pay_request_notify on public.pay_requests;
create trigger pay_request_notify after insert on public.pay_requests for each row execute function public.pay_request_notify();

-- every day 04:00 UTC = 09:00 in Almaty; the same call as the weekly job (and its secret), only with task=daily
select cron.unschedule('kishkentai-daily') where exists (select 1 from cron.job where jobname = 'kishkentai-daily');
select cron.schedule('kishkentai-daily', '0 4 * * *',
  (select replace(command, 'task=weekly', 'task=daily') from cron.job where jobname = 'kishkentai-weekly'));
