import { describe, it, expect } from 'vitest';
import { normalize } from '@/normalize';
import type { FilterNode } from '@/types';

describe('normalize', () => {
  it('returns condition unchanged', () => {
    const inNode: FilterNode = { field: 'age', operator: 'gt', value: 30 };
    expect(normalize(inNode)).toEqual(inNode);
  });

  it('collapses single-child AND and OR groups', () => {
    const a: FilterNode = { and: [{ field: 'age', operator: 'gt', value: 30 }] };
    const o: FilterNode = { or: [{ field: 'name', operator: 'eq', value: 'Ada' }] };
    expect('field' in normalize(a)).toBe(true);
    expect('field' in normalize(o)).toBe(true);
  });

  it('keeps groups with 2+ children', () => {
    const a: FilterNode = {
      and: [
        { field: 'age', operator: 'gt', value: 30 },
        { field: 'age', operator: 'lt', value: 40 },
      ],
    };
    expect('and' in normalize(a)).toBe(true);
  });

  it('replaces empty groups with placeholder condition', () => {
    const a: FilterNode = { and: [] };
    const o: FilterNode = { or: [] };
    const na = normalize(a);
    const no = normalize(o);
    expect('field' in na && na.field === '').toBe(true);
    expect('field' in no && no.field === '').toBe(true);
  });
});
