-- Kishkentai: семья = один аккаунт родителя, профили детей и прогресс хранятся вместе
create table if not exists public.families (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  kids       jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- подписка: родитель может только читать свою строку, записывает её только сервер оплаты
create table if not exists public.subscriptions (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  plan       text not null default 'free',
  paid_until timestamptz
);

alter table public.families enable row level security;
alter table public.subscriptions enable row level security;

drop policy if exists "own family read"   on public.families;
drop policy if exists "own family insert" on public.families;
drop policy if exists "own family update" on public.families;
drop policy if exists "own family delete" on public.families;
drop policy if exists "own subscription read" on public.subscriptions;

create policy "own family read"   on public.families for select using (auth.uid() = user_id);
create policy "own family insert" on public.families for insert with check (auth.uid() = user_id);
create policy "own family update" on public.families for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own family delete" on public.families for delete using (auth.uid() = user_id);
create policy "own subscription read" on public.subscriptions for select using (auth.uid() = user_id);
