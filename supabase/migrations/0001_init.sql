-- ArchLab: tabelas por usuário, com RLS. Rode no SQL Editor do Supabase (ou `supabase db push`).

-- Melhor progresso por caso (nunca regride: o app grava o máximo).
create table if not exists public.case_progress (
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  case_id    text not null check (char_length(case_id) <= 80),
  met        int  not null default 0 check (met >= 0),
  total      int  not null default 0 check (total >= 0),
  stages     int  not null default 0 check (stages >= 0),
  status     text not null default 'started' check (status in ('started', 'done')),
  ovr        numeric,
  updated_at timestamptz not null default now(),
  primary key (user_id, case_id)
);

-- Um desenho por usuário e caso ('free' = canvas livre).
create table if not exists public.designs (
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  case_key   text not null check (char_length(case_key) <= 80),
  title      text not null default '' check (char_length(title) <= 120),
  snap       jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, case_key),
  check (pg_column_size(snap) <= 2000000)
);

-- Desenhos compartilhados por link curto (somente leitura para quem tem o id).
create table if not exists public.shared_designs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  case_id    text check (char_length(case_id) <= 80),
  title      text not null default '' check (char_length(title) <= 120),
  snap       jsonb not null,
  created_at timestamptz not null default now(),
  check (pg_column_size(snap) <= 2000000)
);
create index if not exists shared_designs_user_idx on public.shared_designs (user_id);

alter table public.case_progress  enable row level security;
alter table public.designs        enable row level security;
alter table public.shared_designs enable row level security;

drop policy if exists "progresso: dono lê" on public.case_progress;
create policy "progresso: dono lê"      on public.case_progress for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "progresso: dono insere" on public.case_progress;
create policy "progresso: dono insere"  on public.case_progress for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "progresso: dono altera" on public.case_progress;
create policy "progresso: dono altera"  on public.case_progress for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "progresso: dono apaga" on public.case_progress;
create policy "progresso: dono apaga"   on public.case_progress for delete to authenticated using (user_id = (select auth.uid()));

drop policy if exists "desenhos: dono lê" on public.designs;
create policy "desenhos: dono lê"       on public.designs for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "desenhos: dono insere" on public.designs;
create policy "desenhos: dono insere"   on public.designs for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "desenhos: dono altera" on public.designs;
create policy "desenhos: dono altera"   on public.designs for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "desenhos: dono apaga" on public.designs;
create policy "desenhos: dono apaga"    on public.designs for delete to authenticated using (user_id = (select auth.uid()));

-- Compartilhados: o dono gerencia; leitura por id só pela função abaixo (não dá para listar os de outros).
drop policy if exists "links: dono lê" on public.shared_designs;
create policy "links: dono lê"          on public.shared_designs for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "links: dono insere" on public.shared_designs;
create policy "links: dono insere"      on public.shared_designs for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "links: dono apaga" on public.shared_designs;
create policy "links: dono apaga"       on public.shared_designs for delete to authenticated using (user_id = (select auth.uid()));

create or replace function public.get_shared_design(p_id uuid)
returns table (title text, case_id text, snap jsonb)
language sql stable security definer set search_path = ''
as $$ select s.title, s.case_id, s.snap from public.shared_designs s where s.id = p_id $$;
revoke all on function public.get_shared_design(uuid) from public, anon;
grant execute on function public.get_shared_design(uuid) to authenticated;
