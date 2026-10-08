export interface SliceDiff<T> { upserts: T[]; deletes: string[] }

export function diffById<T extends { id: string }>(prev: T[], next: T[]): SliceDiff<T> {
  const prevById = new Map(prev.map(r => [r.id, r]));
  const nextIds = new Set<string>();
  const upserts: T[] = [];
  for (const row of next) {
    nextIds.add(row.id);
    const old = prevById.get(row.id);
    if (old === undefined || (old !== row && JSON.stringify(old) !== JSON.stringify(row))) upserts.push(row);
  }
  const deletes = prev.filter(r => !nextIds.has(r.id)).map(r => r.id);
  return { upserts, deletes };
}
