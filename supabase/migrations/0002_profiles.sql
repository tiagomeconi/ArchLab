-- Perfil do usuário (nome completo e data de nascimento). Rode no SQL Editor depois do 0001.
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text not null default '' check (char_length(full_name) <= 120),
  birth_date date check (birth_date is null or (birth_date >= date '1900-01-01' and birth_date <= current_date)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

drop policy if exists "perfil: dono lê" on public.profiles;
create policy "perfil: dono lê"     on public.profiles for select to authenticated using (id = (select auth.uid()));
drop policy if exists "perfil: dono insere" on public.profiles;
create policy "perfil: dono insere" on public.profiles for insert to authenticated with check (id = (select auth.uid()));
drop policy if exists "perfil: dono altera" on public.profiles;
create policy "perfil: dono altera" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Cria o perfil quando a conta nasce, a partir dos dados enviados no cadastro (name, birth_date).
-- Dado inválido nunca derruba o cadastro: o campo só fica vazio.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare b date;
begin
  begin b := nullif(new.raw_user_meta_data ->> 'birth_date', '')::date; exception when others then b := null; end;
  if b is not null and (b < date '1900-01-01' or b > current_date) then b := null; end if;
  insert into public.profiles (id, full_name, birth_date)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'name', ''), 120), b)
  on conflict (id) do nothing;
  return new;
end $$;
revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Contas que já existiam antes desta migração ganham o perfil (só com o nome, se houver).
insert into public.profiles (id, full_name)
select id, left(coalesce(raw_user_meta_data ->> 'name', ''), 120) from auth.users
on conflict (id) do nothing;
