-- Vitrine: só cópias publicadas pelo autor ficam visíveis em um perfil público.
create table public.profile_solutions (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  case_id text not null check (char_length(case_id) <= 80),
  title text not null check (char_length(title) <= 120),
  snap jsonb not null check (pg_column_size(snap) <= 2000000),
  published_at timestamptz not null default now(),
  primary key (user_id, case_id),
  check (jsonb_typeof(snap->'n') = 'array' and jsonb_typeof(snap->'e') = 'array' and jsonb_typeof(snap->'f') = 'array')
);
alter table public.profile_solutions enable row level security;
create policy "solutions: owner" on public.profile_solutions for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
grant select, insert, update, delete on public.profile_solutions to authenticated;

-- Registra a classificação geral observada em cada trimestre (não reinicia as notas).
-- A chave usa o calendário de São Paulo. Trimestres passados ficam preservados.
create table public.profile_seasons (
  user_id uuid not null references auth.users(id) on delete cascade,
  season text not null check (season ~ '^[0-9]{4}-Q[1-4]$'),
  overall int not null check (overall between 0 and 100),
  cases int not null check (cases > 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, season)
);
alter table public.profile_seasons enable row level security;
create policy "seasons: owner reads" on public.profile_seasons for select to authenticated using (user_id = (select auth.uid()));
grant select on public.profile_seasons to authenticated;

create function public.record_profile_season()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profile_seasons(user_id, season, overall, cases)
  select new.user_id, to_char(now() at time zone 'America/Sao_Paulo', 'YYYY-"Q"Q'),
         least(100, greatest(0, round(avg(ovr))::int)), count(*)::int
  from public.case_progress where user_id = new.user_id and ovr > 0
  having count(*) > 0
  on conflict (user_id, season) do update set overall = excluded.overall, cases = excluded.cases, updated_at = now();
  return new;
end $$;
revoke all on function public.record_profile_season() from public;
create trigger profile_season_after_progress after insert or update on public.case_progress
  for each row execute function public.record_profile_season();

-- Começa pelo trimestre atual; não cria resultados de temporadas anteriores.
insert into public.profile_seasons(user_id, season, overall, cases)
select user_id, to_char(now() at time zone 'America/Sao_Paulo', 'YYYY-"Q"Q'),
       least(100, greatest(0, round(avg(ovr))::int)), count(*)::int
from public.case_progress where ovr > 0 group by user_id;

-- Sem handle: o próprio perfil. Com handle: apenas perfil público.
create function public.get_profile_showcase(p_handle text default null)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare uid uuid;
begin
  if p_handle is null then uid := auth.uid();
  else select id into uid from public.profiles where handle = lower(p_handle) and is_public;
  end if;
  if uid is null then return null; end if;
  return jsonb_build_object(
    'solutions', coalesce((select jsonb_agg(jsonb_build_object('caseId', s.case_id, 'title', s.title, 'snap', s.snap, 'publishedAt', s.published_at) order by s.published_at desc) from public.profile_solutions s where s.user_id = uid), '[]'::jsonb),
    'seasons', coalesce((select jsonb_agg(jsonb_build_object('season', s.season, 'overall', s.overall, 'cases', s.cases, 'updatedAt', s.updated_at) order by s.season desc) from public.profile_seasons s where s.user_id = uid), '[]'::jsonb)
  );
end $$;
revoke all on function public.get_profile_showcase(text) from public;
grant execute on function public.get_profile_showcase(text) to anon, authenticated;
