import { describe, expect, it } from 'vitest';
import { diffById } from './diff';

type Row = { id: string; v: number };

describe('diffById', () => {
  it('reports added and changed rows as upserts and missing rows as deletes', () => {
    const a = { id: 'a', v: 1 }, b = { id: 'b', v: 1 }, c = { id: 'c', v: 1 };
    const d = diffById<Row>([a, b, c], [a, { id: 'b', v: 2 }, { id: 'd', v: 1 }]);
    expect(d.upserts.map(r => r.id)).toEqual(['b', 'd']);
    expect(d.deletes).toEqual(['c']);
  });

  it('treats a structurally equal copy as unchanged', () => {
    const d = diffById<Row>([{ id: 'a', v: 1 }], [{ id: 'a', v: 1 }]);
    expect(d).toEqual({ upserts: [], deletes: [] });
  });

  it('rows unknown to this client are never deleted', () => {
    // Student B added "b2" on the server; student A's list never contained it.
    const prevA: Row[] = [{ id: 'a1', v: 1 }];
    const nextA: Row[] = [{ id: 'a1', v: 1 }, { id: 'a2', v: 1 }];
    const d = diffById(prevA, nextA);
    expect(d.deletes).toEqual([]);
    expect(d.upserts.map(r => r.id)).toEqual(['a2']);
  });
});
