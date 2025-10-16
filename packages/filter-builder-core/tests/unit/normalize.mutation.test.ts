import { describe, it, expect } from 'vitest';
import { normalize } from '@/normalize';
import type { FilterNode } from '@/types';
import { isAndGroup, isOrGroup, isCondition } from '@/guards';

describe('normalize – boundary conditions', () => {
  it('AND: 0 children → sentinel condition', () => {
    const input: FilterNode = { and: [] };
    const out = normalize(input);
    expect(isCondition(out)).toBe(true);
    if (isCondition(out)) {
      expect(out).toEqual({ field: '', operator: 'eq', value: '' });
    }
  });

  it('OR: 0 children → sentinel condition', () => {
    const input: FilterNode = { or: [] };
    const out = normalize(input);
    expect(isCondition(out)).toBe(true);
    if (isCondition(out)) {
      expect(out).toEqual({ field: '', operator: 'eq', value: '' });
    }
  });

  it('AND: 1 child → collapse to the child', () => {
    const child: FilterNode = { field: 'name', operator: 'eq', value: 'A' };
    const out = normalize({ and: [child] });
    expect(out).toEqual(child);
  });

  it('OR: 1 child → collapse to the child', () => {
    const child: FilterNode = { field: 'age', operator: 'gt', value: 10 };
    const out = normalize({ or: [child] });
    expect(out).toEqual(child);
  });

  it('AND: exactly 2 children → keep group', () => {
    const out = normalize({
      and: [
        { field: 'age', operator: 'gt', value: 10 },
        { field: 'age', operator: 'lt', value: 20 },
      ],
    });
    expect(isAndGroup(out)).toBe(true);
    if (isAndGroup(out)) expect(out.and).toHaveLength(2);
  });

  it('OR: exactly 2 children → keep group', () => {
    const out = normalize({
      or: [
        { field: 'x', operator: 'eq', value: 1 },
        { field: 'y', operator: 'neq', value: 2 },
      ],
    });
    expect(isOrGroup(out)).toBe(true);
    if (isOrGroup(out)) expect(out.or).toHaveLength(2);
  });

  it('deep mix of AND/OR normalizes consistently', () => {
    const out = normalize({
      and: [
        { or: [{ field: 'a', operator: 'eq', value: 1 }] }, // OR(1) collapses
        { and: [] }, // AND(0) → sentinel condition
      ],
    });
    // After normalization, left branch collapses to condition, right becomes sentinel → AND(2)
    expect(isAndGroup(out)).toBe(true);
    if (isAndGroup(out)) {
      expect(out.and).toHaveLength(2);
      expect(isCondition(out.and[0])).toBe(true);
      expect(isCondition(out.and[1])).toBe(true);
    }
  });
});
