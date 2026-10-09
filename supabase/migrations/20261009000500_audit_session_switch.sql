create or replace function public.start_practice_session(p_class uuid, p_role text)
returns public.practice_sessions language plpgsql security definer set search_path = public as $$
declare
  v_type text := public.account_type();
  v_row public.practice_sessions;
  v_old_class uuid;
  v_old_role text;
begin
  if auth.uid() is null or v_type is null then
    raise exception 'Akun tidak aktif atau belum masuk' using errcode = '42501';
  end if;
  if not exists (select 1 from public.practice_roles where id = p_role) then
    raise exception 'Peran % tidak dikenal', p_role using errcode = '22023';
  end if;
  if p_role = 'R01' and v_type <> 'admin' then
    raise exception 'Peran Super Admin hanya untuk akun admin' using errcode = '42501';
  end if;
  if p_role = 'R03' and v_type not in ('dosen', 'admin') then
    raise exception 'Peran Dosen hanya untuk akun dosen' using errcode = '42501';
  end if;
  if p_class = private.template_class_id() then
    raise exception 'Kelas templat tidak dapat dipakai' using errcode = '42501';
  end if;
  if v_type <> 'admin' and not public.is_class_member(p_class) then
    raise exception 'Anda bukan anggota aktif kelas ini' using errcode = '42501';
  end if;
  select class_id, role_id into v_old_class, v_old_role
    from public.practice_sessions where user_id = auth.uid() and ended_at is null limit 1;
  if v_old_class is not null then
    perform private.write_event(v_old_class, 'LOGOUT', 'User', auth.uid()::text, jsonb_build_object('roleId', v_old_role));
  end if;
  update public.practice_sessions set ended_at = now() where user_id = auth.uid() and ended_at is null;
  insert into public.practice_sessions (user_id, class_id, role_id) values (auth.uid(), p_class, p_role)
  returning * into v_row;
  perform private.write_event(p_class, 'LOGIN', 'User', auth.uid()::text, jsonb_build_object('roleId', p_role));
  return v_row;
end $$;

revoke execute on function public.start_practice_session(uuid, text) from anon;
