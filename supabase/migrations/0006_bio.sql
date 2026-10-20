-- "Sobre você": frase curta do perfil (até 160 caracteres), mostrada também no perfil público. Rode no SQL Editor depois do 0005.
alter table public.profiles add column if not exists bio text;
alter table public.profiles drop constraint if exists profiles_bio_len;
alter table public.profiles add constraint profiles_bio_len check (bio is null or char_length(bio) <= 160);

-- Mesma função do 0004, agora devolvendo também a frase (continua sem e-mail, nascimento ou desenhos).
create or replace function public.get_public_profile(p_handle text)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare p public.profiles;
begin
  select * into p from public.profiles where handle = lower(p_handle) and is_public;
  if not found then return null; end if;
  return jsonb_build_object(
    'handle', p.handle, 'name', p.full_name, 'bio', p.bio, 'uid', p.id, 'avatarV', p.avatar_v, 'since', p.created_at,
    'progress', coalesce((select jsonb_agg(jsonb_build_object('case', c.case_id, 'met', c.met, 'total', c.total, 'status', c.status, 'ovr', c.ovr))
                          from public.case_progress c where c.user_id = p.id), '[]'::jsonb),
    'days', coalesce((select jsonb_agg(d.day order by d.day desc) from (select a.day from public.activity_days a where a.user_id = p.id order by a.day desc limit 400) d), '[]'::jsonb)
  );
end $$;
revoke all on function public.get_public_profile(text) from public;
grant execute on function public.get_public_profile(text) to anon, authenticated;
