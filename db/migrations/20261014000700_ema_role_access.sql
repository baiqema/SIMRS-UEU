-- Ema's main (0dc720d) widened two practice roles in src/data/mockData.ts:
--   R07 Mahasiswa Pendaftaran gains the Kunjungan / IUP pages and read access to Rekam Medis.
--   R09 Mahasiswa Coding gains (UI read-only) access to the clinical pages.
-- The seed inserts roles with "on conflict do nothing" so existing databases keep lecturer
-- edits; this migration appends only the missing modules, preserving existing order.
update public.practice_roles r
set access = r.access || array(
  select m from unnest(n.extra) with ordinality as x(m, i)
  where not (m = any (r.access)) order by i)
from (values
  ('R07', array['kunjungan','indekspasien','rekammedis']::text[]),
  ('R09', array['rekammedis','cppt','resumemedis','informedconsent','generalconsent',
                'farmasi','laboratorium','radiologi','pelaporan']::text[])
) as n(id, extra)
where r.id = n.id;
