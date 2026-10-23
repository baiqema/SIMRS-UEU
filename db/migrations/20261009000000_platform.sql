-- Platform layer for plain PostgreSQL (no Supabase).
--
-- The API server connects as the database owner and runs every request inside a
-- transaction with `set local role simrs_user` and `set local simrs.user_id = <uuid>`.
-- Row-level security policies and security definer functions then see the caller
-- through auth.uid(), exactly as they would for a signed-in user.
--
-- Creating the simrs_user role needs CREATEROLE (or a DBA can create it beforehand:
-- `create role simrs_user nologin;` and `grant simrs_user to <owner>;`).

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'simrs_user') then
    create role simrs_user nologin;
  end if;
end $$;

-- The owner must be able to switch to simrs_user. Fails harmlessly if the DBA already granted it.
do $$
begin
  execute format('grant simrs_user to %I', current_user);
exception when others then
  raise notice 'grant simrs_user to %: %', current_user, sqlerrm;
end $$;

create schema if not exists auth;
revoke all on schema auth from public;

-- Login credentials. Profile data (username, name, account type) lives in public.profiles.
create table auth.users (
  id uuid primary key default gen_random_uuid(),
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
revoke all on auth.users from public;

-- The signed-in user of the current transaction, set by the API server.
create or replace function auth.uid() returns uuid
language sql stable as $$
  select nullif(current_setting('simrs.user_id', true), '')::uuid
$$;
grant usage on schema auth to simrs_user;
grant execute on function auth.uid() to simrs_user;

-- Tables and sequences created later in public are usable by simrs_user, filtered by RLS.
grant usage on schema public to simrs_user;
alter default privileges in schema public grant select, insert, update, delete on tables to simrs_user;
alter default privileges in schema public grant usage, select on sequences to simrs_user;
