import { describe, expect, it } from 'vitest';
import { buildSeedSql, sqlLiteral, TEMPLATE_CLASS_ID } from './build-seed';

describe('sqlLiteral', () => {
  it('doubles single quotes', () => {
    expect(sqlLiteral("Jum'at")).toBe("'Jum''at'");
  });
});

describe('buildSeedSql', () => {
  const sql = buildSeedSql();
  it('creates the template class and keeps existing role edits', () => {
    expect(sql).toContain(`'${TEMPLATE_CLASS_ID}'`);
    expect(sql).toMatch(/insert into public\.practice_roles[\s\S]+on conflict \(id\) do nothing/);
  });
  it('seeds staff without passwords', () => {
    expect(sql).toContain('insert into public.staff_directory');
    expect(sql).not.toMatch(/"password"/);
  });
  it('seeds today registrations with placeholders', () => {
    expect(sql).toContain('__TODAY__');
    expect(sql).toContain('__TODAYCOMPACT__');
  });
  it('gives R03 the manajemenuser module and no praktikum', () => {
    const r03 = sql.split('\n').find(l => l.includes("'R03'"))!;
    expect(r03).toContain('manajemenuser');
    expect(r03).not.toContain('praktikum');
  });
});
