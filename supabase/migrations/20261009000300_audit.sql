create table public.audit_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  class_id uuid references public.classes(id),
  actor_id uuid,
  actor_name text,
  practice_role_id text,
  action text not null check (action in ('CREATE','UPDATE','DELETE','LOGIN','LOGOUT','NAVIGATE','RESET')),
  entity text not null,
  entity_id text,
  module text,
  old_data jsonb,
  new_data jsonb,
  details jsonb
);
create index audit_log_class_at on public.audit_log (class_id, at desc);

create or replace function public.audit_actor()
returns table (actor_id uuid, actor_name text, role_id text)
language sql stable security definer set search_path = public as $$
  select auth.uid(),
         (select full_name from public.profiles where id = auth.uid()),
         (select role_id from public.practice_sessions where user_id = auth.uid() and ended_at is null)
$$;

create or replace function private.audit_row_change() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  a record;
  v_row jsonb := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
begin
  if coalesce(current_setting('simrs.skip_audit', true), '') = 'on' then
    return null;
  end if;
  select * into a from public.audit_actor();
  insert into public.audit_log (class_id, actor_id, actor_name, practice_role_id, action, entity, entity_id, module, old_data, new_data)
  values (
    (v_row->>'class_id')::uuid, a.actor_id, a.actor_name, a.role_id,
    case tg_op when 'INSERT' then 'CREATE' when 'UPDATE' then 'UPDATE' else 'DELETE' end,
    tg_table_name, v_row->>'id', tg_table_name,
    case when tg_op <> 'INSERT' then coalesce(to_jsonb(old)->'data', to_jsonb(old)) end,
    case when tg_op <> 'DELETE' then coalesce(to_jsonb(new)->'data', to_jsonb(new)) end
  );
  return null;
end $$;

do $$
declare t text;
begin
  foreach t in array private.clinical_tables() || array['practice_roles'] loop
    execute format('create trigger audit_row_change after insert or update or delete on public.%I
                    for each row execute function private.audit_row_change()', t);
  end loop;
end $$;

create or replace function private.audit_log_immutable() returns trigger
language plpgsql as $$
begin
  raise exception 'audit_log is append-only' using errcode = '42501';
end $$;
create trigger audit_log_no_update before update or delete on public.audit_log
  for each row execute function private.audit_log_immutable();
create trigger audit_log_no_truncate before truncate on public.audit_log
  for each statement execute function private.audit_log_immutable();

create or replace function private.write_event(p_class uuid, p_action text, p_entity text, p_entity_id text, p_details jsonb)
returns void language sql security definer set search_path = public as $$
  insert into public.audit_log (class_id, actor_id, actor_name, practice_role_id, action, entity, entity_id, module, details)
  select p_class, a.actor_id, a.actor_name, a.role_id, p_action, p_entity, p_entity_id, p_details->>'module', p_details
  from public.audit_actor() a
$$;

create or replace function public.log_event(p_action text, p_entity text, p_entity_id text, p_details jsonb default null)
returns void language plpgsql security definer set search_path = public as $$
declare v_class uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated' using errcode = '42501'; end if;
  if p_action <> 'NAVIGATE' then raise exception 'event % not allowed from client', p_action using errcode = '42501'; end if;
  select class_id into v_class from public.practice_sessions where user_id = auth.uid() and ended_at is null;
  perform private.write_event(v_class, p_action, p_entity, p_entity_id, p_details);
end $$;

alter table public.audit_log enable row level security;
revoke insert, update, delete, truncate on public.audit_log from anon, authenticated;
create policy audit_select on public.audit_log for select to authenticated using (
  coalesce(public.account_type() = 'admin', false) or (class_id is not null and public.can_read_class(class_id))
);
alter publication supabase_realtime add table public.audit_log;
revoke execute on function public.log_event(text, text, text, jsonb) from anon;
