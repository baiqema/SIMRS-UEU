-- Ema's Master Data module (main 3b12402): rooms, beds, doctors, polyclinics and the
-- doctor-to-poli mapping. Each class hospital has its own copy, copied from the template
-- like the clinical tables. Only admin accounts may change them, matching the
-- "Master Data SIMRS (Superadmin)" screen; every class member can read them.

create or replace function private.master_tables() returns text[]
language sql immutable set search_path = public as $$
  select array['master_ruangan','master_bed','master_dokter','master_poli','doctor_poli_mappings']
$$;

-- Class data tables = clinical tables + master tables. copy_template, reset_class and the
-- audit trigger set below iterate this list, so new classes get master data too.
create or replace function private.clinical_tables() returns text[]
language sql immutable set search_path = public as $$
  select array['patients','registrations','general_consents','informed_consents','medical_records','cppt',
               'asuhan_keperawatan','resume_medis','coding','claims','billing','beds','dokumen_berkas','staff_directory']
         || private.master_tables()
$$;

insert into public.table_modules (table_name, modules) values
  ('master_ruangan',       '{masterdata}'),
  ('master_bed',           '{masterdata}'),
  ('master_dokter',        '{masterdata}'),
  ('master_poli',          '{masterdata}'),
  ('doctor_poli_mappings', '{masterdata}');

do $$
declare t text;
begin
  foreach t in array private.master_tables() loop
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
      create trigger audit_row_change after insert or update or delete on public.%1$I
        for each row execute function private.audit_row_change();
      create policy %1$s_select on public.%1$I for select to simrs_user
        using (public.can_read_class(class_id));
      create policy %1$s_insert on public.%1$I for insert to simrs_user
        with check (coalesce(public.account_type() = 'admin', false));
      create policy %1$s_update on public.%1$I for update to simrs_user
        using (coalesce(public.account_type() = 'admin', false))
        with check (coalesce(public.account_type() = 'admin', false));
      create policy %1$s_delete on public.%1$I for delete to simrs_user
        using (coalesce(public.account_type() = 'admin', false));
      revoke all on public.%1$I from public;
    $f$, t);
  end loop;
end $$;
