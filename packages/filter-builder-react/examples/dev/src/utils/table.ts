export function unionKeys(rows: Array<Record<string, unknown>>): string[] {
    const keys = new Set<string>();
    for (const r of rows) for (const k of Object.keys(r)) keys.add(k);
    return Array.from(keys);
}
