create extension if not exists pgcrypto;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  is_template boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create unique index classes_single_template on public.classes (is_template) where is_template;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9._-]+$'),
  full_name text not null check (length(trim(full_name)) > 0),
  account_type text not null check (account_type in ('admin', 'dosen', 'mahasiswa')),
  must_change_password boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.class_members (
  class_id uuid not null references public.classes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  member_role text not null check (member_role in ('dosen', 'mahasiswa')),
  active boolean not null default true,
  primary key (class_id, user_id)
);

create table public.practice_roles (
  id text primary key,
  name text not null,
  access text[] not null default '{}'
);

create table public.table_modules (
  table_name text primary key,
  modules text[] not null
);

insert into public.table_modules (table_name, modules) values
  ('patients',           '{pendaftaran}'),
  ('registrations',      '{pendaftaran,bedmanagement}'),
  ('beds',               '{pendaftaran,bedmanagement}'),
  ('general_consents',   '{pendaftaran,generalconsent}'),
  ('medical_records',    '{rekammedis,pemeriksaan}'),
  ('billing',            '{rekammedis,pemeriksaan,billing,pembayaran}'),
  ('cppt',               '{rekammedis,cppt}'),
  ('informed_consents',  '{informedconsent}'),
  ('coding',             '{coding,rekammedis,pemeriksaan}'),
  ('claims',             '{klaim}'),
  ('resume_medis',       '{resumemedis}'),
  ('asuhan_keperawatan', '{keperawatan}'),
  ('dokumen_berkas',     '{pendaftaran,rekammedis,cppt,keperawatan,resumemedis,laboratorium,radiologi,coding}'),
  ('staff_directory',    '{manajemenuser}');

create table public.practice_sessions (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  role_id text not null references public.practice_roles(id),
  started_at timestamptz not null default now(),
  ended_at timestamptz
);
create unique index practice_sessions_one_open on public.practice_sessions (user_id) where ended_at is null;

-- Helper predicates (security definer so RLS policies can call them without recursion)
create or replace function public.account_type() returns text
language sql stable security definer set search_path = public as $$
  select account_type from public.profiles where id = auth.uid() and active
$$;

create or replace function public.is_class_member(p_class uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.class_members m join public.profiles p on p.id = m.user_id
    where m.class_id = p_class and m.user_id = auth.uid() and m.active and p.active
  )
$$;

create or replace function public.is_class_dosen(p_class uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.class_members m join public.profiles p on p.id = m.user_id
    where m.class_id = p_class and m.user_id = auth.uid() and m.active and p.active and m.member_role = 'dosen'
  )
$$;

create or replace function public.can_read_class(p_class uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.account_type() = 'admin', false) or public.is_class_member(p_class)
$$;

create or replace function public.can_write(p_class uuid, p_table text) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.account_type() = 'admin', false)
      or public.is_class_dosen(p_class)
      or (public.is_class_member(p_class) and exists (
            select 1
            from public.practice_sessions s
            join public.practice_roles r on r.id = s.role_id
            join public.table_modules t on t.table_name = p_table
            where s.user_id = auth.uid() and s.ended_at is null and s.class_id = p_class
              and ('all' = any (r.access) or r.access && t.modules)))
$$;

-- Row-level security
alter table public.classes enable row level security;
alter table public.profiles enable row level security;
alter table public.class_members enable row level security;
alter table public.practice_roles enable row level security;
alter table public.table_modules enable row level security;
alter table public.practice_sessions enable row level security;

create policy classes_select on public.classes for select to authenticated using (public.can_read_class(id));

create policy profiles_select on public.profiles for select to authenticated using (
  id = auth.uid()
  or coalesce(public.account_type() = 'admin', false)
  or exists (select 1 from public.class_members m where m.user_id = profiles.id and public.is_class_member(m.class_id))
);

create policy class_members_select on public.class_members for select to authenticated
  using (public.can_read_class(class_id));

create policy practice_roles_select on public.practice_roles for select to authenticated using (true);
create policy practice_roles_update on public.practice_roles for update to authenticated
  using (coalesce(public.account_type() = 'admin', false))
  with check (coalesce(public.account_type() = 'admin', false));

create policy table_modules_select on public.table_modules for select to authenticated using (true);

create policy practice_sessions_select on public.practice_sessions for select to authenticated using (
  user_id = auth.uid() or coalesce(public.account_type() = 'admin', false) or public.is_class_dosen(class_id)
);

revoke all on all tables in schema public from anon;
