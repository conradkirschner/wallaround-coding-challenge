import type { FilterNode } from 'filter-builder-core';

const cmp = (a: unknown, b: unknown): number => (a === b ? 0 : (a as any) < (b as any) ? -1 : 1);

const evalCond = (row: Record<string, unknown>, c: Extract<FilterNode, { field: string; operator: string; value?: unknown }>): boolean => {
  const v = row[c.field];
  switch (c.operator) {
    case 'eq': return v === (c as any).value;
    case 'neq': return v !== (c as any).value;
    case 'gt': return typeof v === 'number' && typeof (c as any).value === 'number' && v > (c as any).value;
    case 'lt': return typeof v === 'number' && typeof (c as any).value === 'number' && v < (c as any).value;
    case 'contains': return typeof v === 'string' && typeof (c as any).value === 'string' && v.includes((c as any).value);
    case 'starts_with': return typeof v === 'string' && typeof (c as any).value === 'string' && v.startsWith((c as any).value);
    case 'ends_with': return typeof v === 'string' && typeof (c as any).value === 'string' && v.endsWith((c as any).value);
    case 'in': return Array.isArray((c as any).value) && (c as any).value.includes(v as any);
    case 'between': {
      const arr = (c as any).value as unknown[];
      if (!Array.isArray(arr) || arr.length !== 2) return false;
      const [a, b] = arr;
      return (v as any) >= (a as any) && (v as any) <= (b as any);
    }
    case 'is_null': return v === undefined || v === null || v === '';
    case 'is_not_null': return !(v === undefined || v === null || v === '');
    case 'before': return typeof v === 'string' && typeof (c as any).value === 'string' && new Date(v) < new Date((c as any).value);
    case 'after': return typeof v === 'string' && typeof (c as any).value === 'string' && new Date(v) > new Date((c as any).value);
    default: return true;
  }
};

export const evaluateTree = (row: Record<string, unknown>, node: FilterNode): boolean => {
  if ('field' in node) return evalCond(row, node);
  if ('and' in node) return node.and.every((n) => evaluateTree(row, n));
  return node.or.some((n) => evaluateTree(row, n));
};
