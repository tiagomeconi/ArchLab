-- Competitive assessments are independent from editable practice progress.
alter table public.profiles add column if not exists country text check (country is null or country ~ '^[A-Z]{2}$');
create table public.assessment_countries(code text primary key check (code ~ '^[A-Z]{2}$'));
create table public.assessment_companies(case_id text primary key, title text not null, case_version text not null);
create table public.assessment_seasons (
  id text primary key, starts_at timestamptz not null, ends_at timestamptz not null,
  rules_version text not null default 'assessment-v1', closed_at timestamptz,
  check (ends_at > starts_at)
);
create table public.assessment_attempts (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  case_id text not null references public.assessment_companies, case_version text not null,
  rules_version text not null default 'assessment-v1', country text not null references public.assessment_countries,
  status text not null default 'active' check (status in ('active','submitted','abandoned')),
  started_at timestamptz not null default now(), submitted_at timestamptz, draft jsonb, draft_updated_at timestamptz,
  season text references public.assessment_seasons, score int check (score between 0 and 100),
  points int not null default 0 check (points between 0 and 100), passed boolean not null default false,
  snap jsonb, report jsonb, snapshot_hash text, published boolean not null default false,
  check (draft is null or pg_column_size(draft) <= 2000000),
  check (snap is null or pg_column_size(snap) <= 2000000),
  check (not published or status='submitted' and passed),
  check (points = 0 or passed)
);
create unique index assessment_one_active on public.assessment_attempts(user_id,case_id) where status='active';
create index assessment_scores on public.assessment_attempts(user_id,season,case_id,points desc) where passed;
create table public.assessment_members (
  season text not null references public.assessment_seasons, user_id uuid not null references auth.users(id) on delete cascade,
  country text not null references public.assessment_countries, points int not null default 0, companies int not null default 0,
  world_rank bigint, country_rank bigint, primary key(season,user_id)
);
-- Only RPCs and the trusted submit function may mutate competitive records.
alter table public.assessment_countries enable row level security;
alter table public.assessment_companies enable row level security;
alter table public.assessment_seasons enable row level security;
alter table public.assessment_attempts enable row level security;
alter table public.assessment_members enable row level security;
create policy "assessment countries read" on public.assessment_countries for select using (true);
create policy "assessment companies read" on public.assessment_companies for select using (true);
create policy "assessment seasons read" on public.assessment_seasons for select using (true);
create policy "assessment owner reads" on public.assessment_attempts for select to authenticated using(user_id=(select auth.uid()));
grant select on public.assessment_countries,public.assessment_companies,public.assessment_seasons to anon,authenticated;
grant select on public.assessment_attempts to authenticated;
revoke insert,update,delete on public.assessment_attempts,public.assessment_members,public.assessment_seasons,public.assessment_companies,public.assessment_countries from anon,authenticated;
grant all on public.assessment_attempts,public.assessment_members,public.assessment_seasons,public.assessment_companies,public.assessment_countries to service_role;

-- Remove practice-based season accumulation; historical rows remain legacy data, never competitive points.
drop trigger if exists profile_season_after_progress on public.case_progress;

create function public.assessment_season_now() returns text language plpgsql security definer set search_path='' as $$
declare local_start timestamp; sid text;
begin
  local_start := date_trunc('quarter',now() at time zone 'America/Sao_Paulo');
  sid := to_char(local_start,'YYYY-"Q"Q');
  insert into public.assessment_seasons(id,starts_at,ends_at) values(sid,local_start at time zone 'America/Sao_Paulo',(local_start+interval '3 months') at time zone 'America/Sao_Paulo') on conflict do nothing;
  return sid;
end $$;

create function public.finalize_assessment_seasons() returns void language plpgsql security definer set search_path='' as $$
declare season_row public.assessment_seasons;
begin
  for season_row in select * from public.assessment_seasons where ends_at<=now() and closed_at is null for update loop
    with ranked as (
      select m.user_id, rank() over(order by m.points desc,m.companies desc) as wr,
             rank() over(partition by m.country order by m.points desc,m.companies desc) as cr
      from public.assessment_members m join public.profiles p on p.id=m.user_id
      where m.season=season_row.id and m.points>0 and p.is_public and p.handle is not null
    ) update public.assessment_members m set world_rank=r.wr,country_rank=r.cr from ranked r where m.season=season_row.id and m.user_id=r.user_id;
    update public.assessment_seasons set closed_at=now() where id=season_row.id;
  end loop;
end $$;

-- Freeze ended seasons before a visibility change or account deletion can change their cohort.
create function public.assessment_before_profile_change() returns trigger language plpgsql security definer set search_path='' as $$
begin
  perform public.finalize_assessment_seasons();
  if TG_OP='DELETE' then return OLD; end if;
  return NEW;
end $$;
create trigger assessment_profile_visibility before update of is_public,handle or delete on public.profiles
  for each row execute function public.assessment_before_profile_change();
revoke all on function public.assessment_before_profile_change() from public,anon,authenticated;

create function public.start_assessment(p_case text,p_country text) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); a public.assessment_attempts; c public.assessment_companies;
begin
  if uid is null then raise exception 'Entre para fazer uma avaliação.'; end if;
  if not exists(select 1 from public.assessment_countries where code=p_country) then raise exception 'Escolha um país válido.'; end if;
  select * into c from public.assessment_companies where case_id=p_case;
  if not found then raise exception 'Somente casos de empresas podem ser avaliados.'; end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
  perform public.finalize_assessment_seasons();
  select * into a from public.assessment_attempts where user_id=uid and case_id=p_case and status='active';
  if not found then
    insert into public.assessment_attempts(user_id,case_id,case_version,country) values(uid,p_case,c.case_version,p_country) returning * into a;
  end if;
  update public.profiles set country=p_country where id=uid;
  return to_jsonb(a);
end $$;

create function public.save_assessment_draft(p_id uuid,p_snap jsonb) returns boolean language plpgsql security definer set search_path='' as $$
begin
  if pg_column_size(p_snap)>2000000 then raise exception 'Desenho grande demais.'; end if;
  update public.assessment_attempts set draft=p_snap,draft_updated_at=now() where id=p_id and user_id=auth.uid() and status='active';
  return found;
end $$;
create function public.abandon_assessment(p_id uuid) returns boolean language plpgsql security definer set search_path='' as $$
begin
  update public.assessment_attempts set status='abandoned',draft=null where id=p_id and user_id=auth.uid() and status='active';
  return found;
end $$;
create function public.get_assessment_attempt(p_id uuid) returns jsonb language sql security definer set search_path='' as $$
  select to_jsonb(a) from public.assessment_attempts a where a.id=p_id and a.user_id=auth.uid()
$$;

-- Service-role only. Serializes deliveries of one person; retries never award points twice.
create function public.finish_assessment(p_id uuid,p_result jsonb,p_hash text) returns jsonb language plpgsql security definer set search_path='' as $$
declare a public.assessment_attempts; sid text; total_points int; company_count int; fixed_country text; closed boolean;
begin
  select * into a from public.assessment_attempts where id=p_id for update;
  if not found then raise exception 'Avaliação não encontrada.'; end if;
  if a.status='submitted' then return to_jsonb(a); end if;
  if a.status<>'active' then raise exception 'Esta tentativa foi encerrada.'; end if;
  if p_result->>'rulesVersion' <> a.rules_version or p_result->>'caseVersion' <> a.case_version then raise exception 'Versão de avaliação incompatível.'; end if;
  if (p_result->>'score')::int not between 0 and 100 then raise exception 'Nota inválida.'; end if;
  if (p_result->>'points')::int <> (case when (p_result->>'passed')::boolean then (p_result->>'score')::int else 0 end) then raise exception 'Pontos inválidos.'; end if;
  perform pg_advisory_xact_lock(hashtextextended(a.user_id::text,0));
  perform public.finalize_assessment_seasons();
  sid := public.assessment_season_now();
  select closed_at is not null into closed from public.assessment_seasons where id=sid for update;
  if closed then raise exception 'Temporada encerrada; tente registrar novamente.'; end if;
  select country into fixed_country from public.assessment_members where season=sid and user_id=a.user_id;
  fixed_country := coalesce(fixed_country,a.country);
  update public.assessment_attempts set status='submitted',submitted_at=now(),season=sid,country=fixed_country,
    score=(p_result->>'score')::int,points=(p_result->>'points')::int,passed=(p_result->>'passed')::boolean,
    snap=p_result->'snap',draft=null,report=p_result-'snap',snapshot_hash=p_hash
    where id=p_id returning * into a;
  if a.passed then
    select coalesce(sum(best),0),count(*) into total_points,company_count from (
      select max(points) best from public.assessment_attempts where user_id=a.user_id and season=sid and passed group by case_id
    ) r;
    insert into public.assessment_members(season,user_id,country,points,companies) values(sid,a.user_id,fixed_country,total_points,company_count)
    on conflict(season,user_id) do update set points=excluded.points,companies=excluded.companies;
  end if;
  return to_jsonb(a);
end $$;

create function public.publish_assessment(p_id uuid,p_public boolean) returns boolean language plpgsql security definer set search_path='' as $$
begin
  update public.assessment_attempts set published=p_public where id=p_id and user_id=auth.uid() and status='submitted' and passed;
  return found;
end $$;

create function public.assessment_record(a public.assessment_attempts,owner_access boolean) returns jsonb language sql immutable set search_path='' as $$
  select jsonb_build_object('id',a.id,'caseId',a.case_id,'score',a.score,'points',a.points,'passed',a.passed,'season',a.season,'country',a.country,
    'submittedAt',a.submitted_at,'rulesVersion',a.rules_version,'caseVersion',a.case_version,'published',a.published,
    'snap',case when owner_access or a.published then a.snap else null end)
$$;

create function public.get_assessment_profile(p_handle text default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid; own boolean; sid text; general_points int; company_count int; best_rows jsonb; delivered jsonb; history_rows jsonb; active_rows jsonb;
begin
  if p_handle is null then uid:=auth.uid();
  else select id into uid from public.profiles where handle=lower(p_handle) and is_public; end if;
  if uid is null then return null; end if;
  own:=uid=auth.uid();
  perform public.finalize_assessment_seasons(); sid:=public.assessment_season_now();
  select coalesce(sum(best),0),count(*) into general_points,company_count from(select max(points) best from public.assessment_attempts where user_id=uid and passed group by case_id) r;
  select coalesce(jsonb_agg(public.assessment_record(a,own) order by a.points desc,a.submitted_at), '[]'::jsonb) into best_rows
    from(select distinct on(case_id) * from public.assessment_attempts where user_id=uid and passed order by case_id,points desc,submitted_at) a;
  select coalesce(jsonb_agg(public.assessment_record(a,own) order by a.season desc,a.points desc), '[]'::jsonb) into delivered
    from(select distinct on(season,case_id) * from public.assessment_attempts where user_id=uid and passed order by season,case_id,points desc,submitted_at) a;
  with live_ranks as (
    select m.*,rank() over(order by m.points desc,m.companies desc) wr,rank() over(partition by m.country order by m.points desc,m.companies desc) cr
    from public.assessment_members m join public.profiles p on p.id=m.user_id where m.season=sid and m.points>0 and p.is_public and p.handle is not null
  ) select coalesce(jsonb_agg(jsonb_build_object('season',m.season,'points',m.points,'companies',m.companies,'country',m.country,
      'worldRank',case when s.closed_at is not null then m.world_rank else l.wr end,'countryRank',case when s.closed_at is not null then m.country_rank else l.cr end,
      'closed',s.closed_at is not null,'startsAt',s.starts_at,'endsAt',s.ends_at) order by m.season desc),'[]'::jsonb) into history_rows
    from public.assessment_members m join public.assessment_seasons s on s.id=m.season left join live_ranks l on l.user_id=m.user_id and l.season=m.season where m.user_id=uid;
  select coalesce(jsonb_agg(jsonb_build_object('id',id,'caseId',case_id,'startedAt',started_at)),'[]'::jsonb) into active_rows from public.assessment_attempts where user_id=uid and status='active' and own;
  return jsonb_build_object('points',general_points,'companies',company_count,'best',best_rows,'deliveries',delivered,'seasons',history_rows,'active',active_rows,'currentSeason',sid);
end $$;

create function public.get_assessment_board(p_season text default null,p_country text default null,p_limit int default 50) returns jsonb language plpgsql security definer set search_path='' as $$
declare sid text; closed boolean; result jsonb;
begin
  perform public.finalize_assessment_seasons(); sid:=coalesce(p_season,public.assessment_season_now());
  select closed_at is not null into closed from public.assessment_seasons where id=sid;
  with ranked as (
    select m.*,p.handle,p.full_name as name,p.avatar_v,
      case when closed then m.world_rank else rank() over(order by m.points desc,m.companies desc) end wr,
      case when closed then m.country_rank else rank() over(partition by m.country order by m.points desc,m.companies desc) end cr
    from public.assessment_members m join public.profiles p on p.id=m.user_id
    where m.season=sid and m.points>0 and p.is_public and p.handle is not null
  ), selected as(select * from ranked where (p_country is null or country=p_country) and (not closed or wr is not null) order by points desc,companies desc,handle limit greatest(1,least(p_limit,100)))
  select coalesce(jsonb_agg(jsonb_build_object('uid',user_id,'handle',handle,'name',name,'avatarV',avatar_v,'points',points,'companies',companies,'country',country,'worldRank',wr,'countryRank',cr) order by points desc,companies desc,handle),'[]'::jsonb) into result from selected;
  return result;
end $$;

-- Legacy callers must never continue ranking practice scores.
create or replace function public.get_leaderboard(p_limit int default 50) returns jsonb language sql security definer set search_path='' as $$ select public.get_assessment_board(null,null,p_limit) $$;
create or replace function public.get_my_rank() returns jsonb language plpgsql security definer set search_path='' as $$
declare summary jsonb; current_result jsonb; participants int;
begin
  if auth.uid() is null then return null; end if;
  summary := public.get_assessment_profile(null);
  select v into current_result from jsonb_array_elements(summary->'seasons') v where v->>'season'=summary->>'currentSeason';
  if current_result is null or current_result->>'worldRank' is null then return null; end if;
  select count(*) into participants from public.assessment_members m join public.profiles p on p.id=m.user_id where m.season=summary->>'currentSeason' and m.points>0 and p.is_public and p.handle is not null;
  return jsonb_build_object('rank',(current_result->>'worldRank')::bigint,'points',(current_result->>'points')::int,'total',participants);
end $$;

-- All definer functions have an explicit, narrow caller set.
revoke all on function public.assessment_season_now(),public.finalize_assessment_seasons(),public.start_assessment(text,text),public.save_assessment_draft(uuid,jsonb),public.abandon_assessment(uuid),public.get_assessment_attempt(uuid),public.finish_assessment(uuid,jsonb,text),public.publish_assessment(uuid,boolean),public.assessment_record(public.assessment_attempts,boolean),public.get_assessment_profile(text),public.get_assessment_board(text,text,int) from public,anon,authenticated;
grant execute on function public.start_assessment(text,text),public.save_assessment_draft(uuid,jsonb),public.abandon_assessment(uuid),public.get_assessment_attempt(uuid),public.publish_assessment(uuid,boolean) to authenticated;
grant execute on function public.get_assessment_profile(text),public.get_assessment_board(text,text,int) to anon,authenticated;
grant execute on function public.finish_assessment(uuid,jsonb,text),public.finalize_assessment_seasons() to service_role;
