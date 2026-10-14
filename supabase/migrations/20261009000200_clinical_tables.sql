create or replace function private.clinical_tables() returns text[]
language sql immutable as $$
  select array['patients','registrations','general_consents','informed_consents','medical_records','cppt',
               'asuhan_keperawatan','resume_medis','coding','claims','billing','beds','dokumen_berkas','staff_directory']
$$;

-- Exposed read-only so tests and tooling can enumerate tables.
create or replace function public.clinical_table_names() returns text[]
language sql immutable security definer set search_path = public as $$
  select private.clinical_tables()
$$;

create or replace function private.stamp_row() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    new.created_by := auth.uid();
    new.created_at := now();
  else
    if new.class_id is distinct from old.class_id or new.id is distinct from old.id then
      raise exception 'class_id and id cannot change' using errcode = '42501';
    end if;
    new.created_by := old.created_by;
    new.created_at := old.created_at;
  end if;
  new.updated_by := auth.uid();
  new.updated_at := now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array private.clinical_tables() loop
    execute format($f$
      create table public.%1$I (
        class_id uuid not null references public.classes(id) on delete cascade,
        id text not null check (length(id) between 1 and 200),
        data jsonb not null check (jsonb_typeof(data) = 'object' and data->>'id' = id),
        seq bigint generated always as identity,
        created_by uuid,
        updated_by uuid,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now(),
        primary key (class_id, id)
      );
      create index %1$s_class_order on public.%1$I (class_id, created_at desc, seq);
      alter table public.%1$I enable row level security;
      create trigger stamp_row before insert or update on public.%1$I
        for each row execute function private.stamp_row();
      create policy %1$s_select on public.%1$I for select to authenticated
        using (public.can_read_class(class_id));
      create policy %1$s_insert on public.%1$I for insert to authenticated
        with check (public.can_write(class_id, %1$L));
      create policy %1$s_update on public.%1$I for update to authenticated
        using (public.can_write(class_id, %1$L)) with check (public.can_write(class_id, %1$L));
      create policy %1$s_delete on public.%1$I for delete to authenticated
        using (public.can_write(class_id, %1$L));
      alter publication supabase_realtime add table public.%1$I;
      revoke all on public.%1$I from anon;
    $f$, t);
  end loop;
end $$;
