-- Uma única prova por caso de empresa. Depois da entrega, a pessoa só corrige o mesmo fluxo: vale sempre a ÚLTIMA versão
-- (a nota pode subir ou cair). A tentativa continua sendo uma linha só; a correção usa `draft` até ser entregue de novo.
alter table public.assessment_attempts add column if not exists revision int not null default 0 check (revision >= 0);
alter table public.assessment_attempts add column if not exists first_submitted_at timestamptz;
update public.assessment_attempts set first_submitted_at=submitted_at where status='submitted' and first_submitted_at is null;
create unique index if not exists assessment_one_per_case on public.assessment_attempts(user_id,case_id) where status in ('active','submitted');

create or replace function public.start_assessment(p_case text,p_country text) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); a public.assessment_attempts; c public.assessment_companies;
begin
  if uid is null then raise exception 'Entre para fazer uma avaliação.'; end if;
  if not exists(select 1 from public.assessment_countries where code=p_country) then raise exception 'Escolha um país válido.'; end if;
  select * into c from public.assessment_companies where case_id=p_case;
  if not found then raise exception 'Somente casos de empresas podem ser avaliados.'; end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
  perform public.finalize_assessment_seasons();
  select * into a from public.assessment_attempts where user_id=uid and case_id=p_case and status in ('active','submitted');
  if found and a.status='submitted' then raise exception 'Você já fez esta avaliação. Agora só dá para corrigir a sua entrega.'; end if;
  if not found then
    insert into public.assessment_attempts(user_id,case_id,case_version,country) values(uid,p_case,c.case_version,p_country) returning * into a;
  end if;
  update public.profiles set country=p_country where id=uid;
  return to_jsonb(a);
end $$;

-- Rascunho da prova ou da correção em andamento (entrega sem correção aberta continua imutável).
create or replace function public.save_assessment_draft(p_id uuid,p_snap jsonb) returns boolean language plpgsql security definer set search_path='' as $$
begin
  if pg_column_size(p_snap)>2000000 then raise exception 'Desenho grande demais.'; end if;
  update public.assessment_attempts set draft=p_snap,draft_updated_at=now()
    where id=p_id and user_id=auth.uid() and (status='active' or (status='submitted' and draft is not null));
  return found;
end $$;

-- Abre a correção: o rascunho nasce da versão entregue. Chamar de novo retoma a correção já aberta.
create function public.start_assessment_correction(p_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare a public.assessment_attempts;
begin
  update public.assessment_attempts set draft_updated_at=case when draft is null then now() else draft_updated_at end,draft=coalesce(draft,snap)
    where id=p_id and user_id=auth.uid() and status='submitted' and snap is not null returning * into a;
  if not found then raise exception 'Entrega não encontrada.'; end if;
  return to_jsonb(a);
end $$;
create function public.cancel_assessment_correction(p_id uuid) returns boolean language plpgsql security definer set search_path='' as $$
begin
  update public.assessment_attempts set draft=null,draft_updated_at=null where id=p_id and user_id=auth.uid() and status='submitted';
  return found;
end $$;

-- Service-role only. Primeira entrega ou correção: a linha é sobrescrita e os pontos da temporada são recalculados do zero.
create or replace function public.finish_assessment(p_id uuid,p_result jsonb,p_hash text) returns jsonb language plpgsql security definer set search_path='' as $$
declare a public.assessment_attempts; sid text; total_points int; company_count int; fixed_country text; closed boolean; passed_now boolean;
begin
  select * into a from public.assessment_attempts where id=p_id for update;
  if not found then raise exception 'Avaliação não encontrada.'; end if;
  if a.status='submitted' and a.draft is null then return to_jsonb(a); end if;
  if a.status not in ('active','submitted') then raise exception 'Esta tentativa foi encerrada.'; end if;
  if p_result->>'rulesVersion' <> a.rules_version or p_result->>'caseVersion' <> a.case_version then raise exception 'Versão de avaliação incompatível.'; end if;
  if (p_result->>'score')::int not between 0 and 100 then raise exception 'Nota inválida.'; end if;
  passed_now := (p_result->>'passed')::boolean;
  if (p_result->>'points')::int <> (case when passed_now then (p_result->>'score')::int else 0 end) then raise exception 'Pontos inválidos.'; end if;
  perform pg_advisory_xact_lock(hashtextextended(a.user_id::text,0));
  perform public.finalize_assessment_seasons();
  sid := public.assessment_season_now();
  select closed_at is not null into closed from public.assessment_seasons where id=sid for update;
  if closed then raise exception 'Temporada encerrada; tente registrar novamente.'; end if;
  select country into fixed_country from public.assessment_members where season=sid and user_id=a.user_id;
  fixed_country := coalesce(fixed_country,a.country);
  update public.assessment_attempts set status='submitted',submitted_at=now(),first_submitted_at=coalesce(first_submitted_at,now()),
    revision=case when a.status='submitted' then revision+1 else revision end,season=sid,country=fixed_country,
    score=(p_result->>'score')::int,points=(p_result->>'points')::int,passed=passed_now,published=(published and passed_now),
    snap=p_result->'snap',draft=null,draft_updated_at=null,report=p_result-'snap',snapshot_hash=p_hash
    where id=p_id returning * into a;
  select coalesce(sum(points),0),count(*) filter (where passed) into total_points,company_count
    from public.assessment_attempts where user_id=a.user_id and season=sid and status='submitted' and passed;
  if total_points>0 or exists(select 1 from public.assessment_members where season=sid and user_id=a.user_id) then
    insert into public.assessment_members(season,user_id,country,points,companies) values(sid,a.user_id,fixed_country,total_points,company_count)
    on conflict(season,user_id) do update set points=excluded.points,companies=excluded.companies;
  end if;
  return to_jsonb(a);
end $$;

revoke all on function public.start_assessment_correction(uuid),public.cancel_assessment_correction(uuid) from public,anon;
grant execute on function public.start_assessment_correction(uuid),public.cancel_assessment_correction(uuid) to authenticated;
