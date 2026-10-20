-- Turmas: quem ensina cria a turma e passa o código; quem estuda entra pelo código e vê os casos atribuídos.
-- Entrar numa turma significa compartilhar com quem a criou o progresso nos casos atribuídos (o app avisa antes).
-- Rode no SQL Editor depois do 0006. Idempotente.

create table if not exists public.classes (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name       text not null check (char_length(name) between 1 and 80),
  join_code  text not null unique default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  created_at timestamptz not null default now()
);
create table if not exists public.class_members (
  class_id  uuid not null references public.classes (id) on delete cascade,
  user_id   uuid not null default auth.uid() references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (class_id, user_id)
);
create table if not exists public.class_assignments (
  id         uuid primary key default gen_random_uuid(),
  class_id   uuid not null references public.classes (id) on delete cascade,
  case_id    text not null check (char_length(case_id) <= 80),
  due_at     timestamptz,
  created_at timestamptz not null default now(),
  unique (class_id, case_id)
);
create index if not exists class_members_user_idx on public.class_members (user_id);

alter table public.classes           enable row level security;
alter table public.class_members     enable row level security;
alter table public.class_assignments enable row level security;

-- Auxiliares das policies. São security definer para evitar recursão entre as tabelas; só devolvem verdadeiro/falso.
create or replace function public.is_class_owner(cid uuid, uid uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.classes c where c.id = cid and c.owner_id = uid) $$;
create or replace function public.is_class_member(cid uuid, uid uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.class_members m where m.class_id = cid and m.user_id = uid) $$;
revoke all on function public.is_class_owner(uuid, uuid) from public, anon;
revoke all on function public.is_class_member(uuid, uuid) from public, anon;
grant execute on function public.is_class_owner(uuid, uuid) to authenticated;
grant execute on function public.is_class_member(uuid, uuid) to authenticated;

drop policy if exists "turma: dono ou aluno lê" on public.classes;
create policy "turma: dono ou aluno lê" on public.classes for select to authenticated
  using (owner_id = (select auth.uid()) or public.is_class_member(id, (select auth.uid())));
drop policy if exists "turma: dono cria" on public.classes;
create policy "turma: dono cria" on public.classes for insert to authenticated with check (owner_id = (select auth.uid()));
drop policy if exists "turma: dono altera" on public.classes;
create policy "turma: dono altera" on public.classes for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
drop policy if exists "turma: dono apaga" on public.classes;
create policy "turma: dono apaga" on public.classes for delete to authenticated using (owner_id = (select auth.uid()));

-- Alunos só entram pela função join_class (sem policy de insert): não dá para se pôr em turma alheia.
drop policy if exists "membro: próprio ou dono da turma lê" on public.class_members;
create policy "membro: próprio ou dono da turma lê" on public.class_members for select to authenticated
  using (user_id = (select auth.uid()) or public.is_class_owner(class_id, (select auth.uid())));
drop policy if exists "membro: sai ou é removido" on public.class_members;
create policy "membro: sai ou é removido" on public.class_members for delete to authenticated
  using (user_id = (select auth.uid()) or public.is_class_owner(class_id, (select auth.uid())));

drop policy if exists "atribuição: dono ou aluno lê" on public.class_assignments;
create policy "atribuição: dono ou aluno lê" on public.class_assignments for select to authenticated
  using (public.is_class_owner(class_id, (select auth.uid())) or public.is_class_member(class_id, (select auth.uid())));
drop policy if exists "atribuição: dono cria" on public.class_assignments;
create policy "atribuição: dono cria" on public.class_assignments for insert to authenticated with check (public.is_class_owner(class_id, (select auth.uid())));
drop policy if exists "atribuição: dono altera" on public.class_assignments;
create policy "atribuição: dono altera" on public.class_assignments for update to authenticated
  using (public.is_class_owner(class_id, (select auth.uid()))) with check (public.is_class_owner(class_id, (select auth.uid())));
drop policy if exists "atribuição: dono apaga" on public.class_assignments;
create policy "atribuição: dono apaga" on public.class_assignments for delete to authenticated using (public.is_class_owner(class_id, (select auth.uid())));

-- Entra numa turma pelo código. Devolve o id da turma; erro se o código não existir.
create or replace function public.join_class(code text)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare cid uuid; own uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select id, owner_id into cid, own from public.classes where join_code = upper(btrim(code));
  if cid is null then raise exception 'invalid code'; end if;
  if own <> auth.uid() then
    insert into public.class_members (class_id, user_id) values (cid, auth.uid()) on conflict do nothing;
  end if;
  return cid;
end $$;
revoke all on function public.join_class(text) from public, anon;
grant execute on function public.join_class(text) to authenticated;

-- Progresso dos alunos nos casos atribuídos: só quem criou a turma, só dos alunos que entraram e só dos casos atribuídos.
create or replace function public.class_progress(cid uuid)
returns table (user_id uuid, full_name text, case_id text, met int, total int, status text, ovr numeric, updated_at timestamptz)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if auth.uid() is null or not public.is_class_owner(cid, auth.uid()) then raise exception 'not allowed'; end if;
  return query
    select m.user_id, coalesce(p.full_name, ''), a.case_id, coalesce(cp.met, 0), coalesce(cp.total, 0), coalesce(cp.status, 'none'), cp.ovr, cp.updated_at
    from public.class_members m
    cross join public.class_assignments a
    left join public.profiles p on p.id = m.user_id
    left join public.case_progress cp on cp.user_id = m.user_id and cp.case_id = a.case_id
    where m.class_id = cid and a.class_id = cid
    order by p.full_name, a.created_at;
end $$;
revoke all on function public.class_progress(uuid) from public, anon;
grant execute on function public.class_progress(uuid) to authenticated;
