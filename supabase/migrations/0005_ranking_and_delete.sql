-- Ranking (só de quem tornou o perfil público) e exclusão da própria conta. Rode no SQL Editor depois do 0004.

-- Pontos = soma das melhores notas de cada caso (premia quem pratica mais casos). Só entra quem ligou o perfil público.
create or replace function public.get_leaderboard(p_limit int default 50)
returns jsonb language sql stable security definer set search_path = ''
as $$
  select coalesce(jsonb_agg(to_jsonb(r) order by r.points desc, r.done desc, r.handle), '[]'::jsonb)
  from (
    select p.handle, p.full_name as name, p.id as uid, p.avatar_v as "avatarV",
           round(sum(c.ovr))::int as points, round(avg(c.ovr))::int as overall,
           count(*) filter (where c.status = 'done')::int as done, count(*)::int as cases
    from public.profiles p
    join public.case_progress c on c.user_id = p.id and c.ovr is not null and c.ovr > 0
    where p.is_public and p.handle is not null
    group by p.id
    order by points desc, done desc, p.handle
    limit greatest(1, least(coalesce(p_limit, 50), 100))
  ) r
$$;
revoke all on function public.get_leaderboard(int) from public, anon;
grant execute on function public.get_leaderboard(int) to authenticated;

-- Posição de quem está logado (nulo se o perfil não é público ou ainda não há nota).
create or replace function public.get_my_rank()
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare res jsonb;
begin
  if auth.uid() is null then return null; end if;
  with pts as (
    select p.id, round(sum(c.ovr))::int as points, count(*) filter (where c.status = 'done')::int as done
    from public.profiles p
    join public.case_progress c on c.user_id = p.id and c.ovr is not null and c.ovr > 0
    where p.is_public and p.handle is not null
    group by p.id
  ), ranked as (
    select id, points, rank() over (order by points desc, done desc) as rk, count(*) over () as total from pts
  )
  select jsonb_build_object('rank', rk, 'total', total, 'points', points) into res from ranked where id = auth.uid();
  return res;
end $$;
revoke all on function public.get_my_rank() from public, anon;
grant execute on function public.get_my_rank() to authenticated;

-- Exclui a conta de quem chama: o `on delete cascade` apaga perfil, progresso, desenhos, links e dias praticados.
-- (A foto fica no Storage: o app a remove antes de chamar esta função.)
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
