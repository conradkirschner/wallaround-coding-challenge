import { describe, it, expect } from 'vitest';
import { isCondition, isAndGroup, isOrGroup } from '@/guards';
import type { FilterNode } from '@/types';

describe('guards', () => {
  it('detects condition', () => {
    const n: FilterNode = { field: 'age', operator: 'gt', value: 30 };
    expect(isCondition(n)).toBe(true);
    expect(isAndGroup(n)).toBe(false);
    expect(isOrGroup(n)).toBe(false);
  });

  it('detects and/or groups', () => {
    const a: FilterNode = { and: [{ field: 'age', operator: 'gt', value: 30 }] };
    const o: FilterNode = { or: [{ field: 'name', operator: 'eq', value: 'Ada' }] };
    expect(isAndGroup(a)).toBe(true);
    expect(isOrGroup(a)).toBe(false);
    expect(isAndGroup(o)).toBe(false);
    expect(isOrGroup(o)).toBe(true);
  });
});
