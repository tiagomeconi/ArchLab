-- Sequência de dias, perfil público opt-in e foto no perfil público. Rode no SQL Editor depois do 0003.

-- Um registro por dia praticado (para a sequência de dias seguidos).
create table if not exists public.activity_days (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day     date not null check (day >= date '2020-01-01' and day <= current_date + 1),
  primary key (user_id, day)
);
alter table public.activity_days enable row level security;
drop policy if exists "atividade: dono lê" on public.activity_days;
create policy "atividade: dono lê"     on public.activity_days for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "atividade: dono insere" on public.activity_days;
create policy "atividade: dono insere" on public.activity_days for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "atividade: dono apaga" on public.activity_days;
create policy "atividade: dono apaga"  on public.activity_days for delete to authenticated using (user_id = (select auth.uid()));

-- Perfil público: desligado por padrão; a pessoa escolhe o @usuário e liga.
alter table public.profiles add column if not exists handle    text;
alter table public.profiles add column if not exists is_public boolean not null default false;
alter table public.profiles add column if not exists avatar_v  bigint;
alter table public.profiles drop constraint if exists profiles_handle_format;
alter table public.profiles add constraint profiles_handle_format check (handle is null or handle ~ '^[a-z0-9_]{3,20}$');
alter table public.profiles drop constraint if exists profiles_handle_reserved;
alter table public.profiles add constraint profiles_handle_reserved check (handle is null or handle not in
  ('admin','api','app','login','cadastro','start','perfil','desenhos','u','www','archlab','suporte','support','root','null','undefined'));
alter table public.profiles drop constraint if exists profiles_public_needs_handle;
alter table public.profiles add constraint profiles_public_needs_handle check (not is_public or handle is not null);
create unique index if not exists profiles_handle_key on public.profiles (handle) where handle is not null;

-- Leitura pública SÓ do que a pessoa liberou: nome, foto, progresso por caso e dias praticados.
-- Não expõe e-mail, nascimento, desenhos nem notas de entrevista.
create or replace function public.get_public_profile(p_handle text)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare p public.profiles;
begin
  select * into p from public.profiles where handle = lower(p_handle) and is_public;
  if not found then return null; end if;
  return jsonb_build_object(
    'handle', p.handle, 'name', p.full_name, 'uid', p.id, 'avatarV', p.avatar_v, 'since', p.created_at,
    'progress', coalesce((select jsonb_agg(jsonb_build_object('case', c.case_id, 'met', c.met, 'total', c.total, 'status', c.status, 'ovr', c.ovr))
                          from public.case_progress c where c.user_id = p.id), '[]'::jsonb),
    'days', coalesce((select jsonb_agg(d.day order by d.day desc) from (select a.day from public.activity_days a where a.user_id = p.id order by a.day desc limit 400) d), '[]'::jsonb)
  );
end $$;
revoke all on function public.get_public_profile(text) from public;
grant execute on function public.get_public_profile(text) to anon, authenticated;
