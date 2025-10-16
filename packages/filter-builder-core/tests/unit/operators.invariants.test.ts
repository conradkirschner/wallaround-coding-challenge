import { describe, it, expect } from 'vitest';
import { OPERATOR_CATALOG } from '@/operators';

const sorted = <T>(xs: readonly T[]) => [...xs].sort();

describe('operators catalog – critical invariants', () => {
  it('eq and neq support all scalar types and have valueArity=one', () => {
    expect(OPERATOR_CATALOG.eq.valueArity).toBe('one');
    expect(sorted(OPERATOR_CATALOG.eq.supportedTypes)).toEqual([
      'boolean',
      'date',
      'number',
      'string',
    ]);
    expect(OPERATOR_CATALOG.neq.valueArity).toBe('one');
    expect(sorted(OPERATOR_CATALOG.neq.supportedTypes)).toEqual([
      'boolean',
      'date',
      'number',
      'string',
    ]);
  });

  it('between has valueArity=two and supports number/date only', () => {
    expect(OPERATOR_CATALOG.between.valueArity).toBe('two');
    expect(sorted(OPERATOR_CATALOG.between.supportedTypes)).toEqual(['date', 'number']);
  });

  it('contains/starts_with/ends_with are string-only with valueArity=one', () => {
    for (const k of ['contains', 'starts_with', 'ends_with'] as const) {
      expect(OPERATOR_CATALOG[k].valueArity).toBe('one');
      expect(OPERATOR_CATALOG[k].supportedTypes).toEqual(['string']);
    }
  });

  it('is_null / is_not_null have valueArity=none and are universal', () => {
    for (const k of ['is_null', 'is_not_null'] as const) {
      expect(OPERATOR_CATALOG[k].valueArity).toBe('none');
      expect(sorted(OPERATOR_CATALOG[k].supportedTypes)).toEqual([
        'boolean',
        'date',
        'number',
        'string',
      ]);
    }
  });

  it('before/after are date-only with valueArity=one', () => {
    for (const k of ['before', 'after'] as const) {
      expect(OPERATOR_CATALOG[k].valueArity).toBe('one');
      expect(OPERATOR_CATALOG[k].supportedTypes).toEqual(['date']);
    }
  });
});
