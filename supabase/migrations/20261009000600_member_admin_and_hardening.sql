-- Member administration (spec §7.4 "Deactivate a member") and function hardening.

create or replace function public.set_member_active(p_class uuid, p_user uuid, p_active boolean) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_is_admin boolean := coalesce(public.account_type() = 'admin', false);
  v_role text;
begin
  if auth.uid() is null then
    raise exception 'Akun tidak aktif atau belum masuk' using errcode = '42501';
  end if;
  if not (v_is_admin or public.is_class_dosen(p_class)) then
    raise exception 'Hanya dosen kelas ini atau admin yang dapat mengubah status anggota' using errcode = '42501';
  end if;
  if p_user = auth.uid() then
    raise exception 'Anda tidak dapat mengubah status keanggotaan Anda sendiri' using errcode = '42501';
  end if;
  select member_role into v_role from public.class_members where class_id = p_class and user_id = p_user;
  if v_role is null then
    raise exception 'Akun ini bukan anggota kelas' using errcode = '42501';
  end if;
  if v_role = 'dosen' and not v_is_admin then
    raise exception 'Hanya admin yang dapat mengubah status dosen' using errcode = '42501';
  end if;
  update public.class_members set active = p_active where class_id = p_class and user_id = p_user;
  perform private.write_event(p_class, 'UPDATE', 'ClassMember', p_user::text, jsonb_build_object('active', p_active));
  if not p_active then
    update public.practice_sessions set ended_at = now()
     where user_id = p_user and class_id = p_class and ended_at is null;
  end if;
end $$;

-- Integration tests create TEST-* classes in the shared project; never offer them in the class picker.
create or replace function public.my_classes() returns table (id uuid, name text)
language sql stable security definer set search_path = public as $$
  select c.id, c.name from public.classes c
  where not c.is_template
    and c.name not like 'TEST-%'
    and (coalesce(public.account_type() = 'admin', false) or public.is_class_member(c.id))
  order by c.created_at desc
$$;

-- Security definer functions: callable by signed-in users only (RLS helpers stay executable by authenticated).
do $$
declare f text;
begin
  foreach f in array array[
    'public.account_type()',
    'public.is_class_member(uuid)',
    'public.is_class_dosen(uuid)',
    'public.can_read_class(uuid)',
    'public.can_write(uuid, text)',
    'public.clinical_table_names()',
    'public.audit_actor()',
    'public.log_event(text, text, text, jsonb)',
    'public.start_practice_session(uuid, text)',
    'public.end_practice_session()',
    'public.my_practice_session()',
    'public.my_classes()',
    'public.clear_must_change_password()',
    'public.create_class(text)',
    'public.reset_class(uuid)',
    'public.set_member_active(uuid, uuid, boolean)'
  ] loop
    execute format('revoke execute on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end $$;

-- Pin search_path on private helpers that lacked it.
alter function private.clinical_tables() set search_path = public;
alter function private.apply_today(jsonb) set search_path = public;
alter function private.template_class_id() set search_path = public;
alter function private.audit_log_immutable() set search_path = public;
