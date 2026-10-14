create or replace function private.apply_today(p_data jsonb) returns jsonb
language sql stable as $$
  select replace(replace(p_data::text, '__TODAYCOMPACT__', to_char(current_date, 'YYYYMMDD')),
                 '__TODAY__', to_char(current_date, 'YYYY-MM-DD'))::jsonb
$$;

create or replace function private.copy_template(p_src uuid, p_dst uuid) returns void
language plpgsql security definer set search_path = public as $$
declare t text;
begin
  perform set_config('simrs.skip_audit', 'on', true);
  foreach t in array private.clinical_tables() loop
    execute format('insert into public.%1$I (class_id, id, data)
                    select $2, id, private.apply_today(data) from public.%1$I where class_id = $1 order by seq', t)
      using p_src, p_dst;
  end loop;
  perform set_config('simrs.skip_audit', 'off', true);
end $$;

create or replace function private.template_class_id() returns uuid
language sql stable as $$ select id from public.classes where is_template $$;

create or replace function public.start_practice_session(p_class uuid, p_role text)
returns public.practice_sessions language plpgsql security definer set search_path = public as $$
declare
  v_type text := public.account_type();
  v_row public.practice_sessions;
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
  update public.practice_sessions set ended_at = now() where user_id = auth.uid() and ended_at is null;
  insert into public.practice_sessions (user_id, class_id, role_id) values (auth.uid(), p_class, p_role)
  returning * into v_row;
  perform private.write_event(p_class, 'LOGIN', 'User', auth.uid()::text, jsonb_build_object('roleId', p_role));
  return v_row;
end $$;

create or replace function public.end_practice_session() returns void
language plpgsql security definer set search_path = public as $$
declare v_class uuid;
begin
  select class_id into v_class from public.practice_sessions where user_id = auth.uid() and ended_at is null;
  if v_class is null then return; end if;
  perform private.write_event(v_class, 'LOGOUT', 'User', auth.uid()::text, null);
  update public.practice_sessions set ended_at = now() where user_id = auth.uid() and ended_at is null;
end $$;

create or replace function public.my_practice_session() returns setof public.practice_sessions
language sql stable security definer set search_path = public as $$
  select * from public.practice_sessions where user_id = auth.uid() and ended_at is null
$$;

create or replace function public.my_classes() returns table (id uuid, name text)
language sql stable security definer set search_path = public as $$
  select c.id, c.name from public.classes c
  where not c.is_template
    and (coalesce(public.account_type() = 'admin', false) or public.is_class_member(c.id))
  order by c.created_at desc
$$;

create or replace function public.clear_must_change_password() returns void
language sql security definer set search_path = public as $$
  update public.profiles set must_change_password = false where id = auth.uid()
$$;

create or replace function public.create_class(p_name text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_type text := public.account_type();
  v_template uuid := private.template_class_id();
  v_id uuid;
begin
  if v_type is null or v_type not in ('dosen', 'admin') then
    raise exception 'Hanya dosen atau admin yang dapat membuat kelas' using errcode = '42501';
  end if;
  if v_template is null then
    raise exception 'Templat kelas belum di-seed (jalankan supabase/seed.sql)' using errcode = '55000';
  end if;
  insert into public.classes (name, created_by) values (trim(p_name), auth.uid()) returning id into v_id;
  if v_type = 'dosen' then
    insert into public.class_members (class_id, user_id, member_role) values (v_id, auth.uid(), 'dosen');
  end if;
  perform private.copy_template(v_template, v_id);
  perform private.write_event(v_id, 'CREATE', 'Class', v_id::text, jsonb_build_object('name', trim(p_name)));
  return v_id;
end $$;

create or replace function public.reset_class(p_class uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_template uuid := private.template_class_id();
  t text;
begin
  if not (coalesce(public.account_type() = 'admin', false) or public.is_class_dosen(p_class)) then
    raise exception 'Hanya dosen kelas ini atau admin yang dapat mereset kelas' using errcode = '42501';
  end if;
  if p_class = v_template then
    raise exception 'Kelas templat tidak dapat direset' using errcode = '42501';
  end if;
  perform set_config('simrs.skip_audit', 'on', true);
  foreach t in array private.clinical_tables() loop
    execute format('delete from public.%I where class_id = $1', t) using p_class;
  end loop;
  perform private.copy_template(v_template, p_class);
  perform private.write_event(p_class, 'RESET', 'Class', p_class::text, null);
end $$;

revoke execute on function public.start_practice_session(uuid, text), public.end_practice_session(),
  public.my_practice_session(), public.my_classes(), public.clear_must_change_password(),
  public.create_class(text), public.reset_class(uuid) from anon;
