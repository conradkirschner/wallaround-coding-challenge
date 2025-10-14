import { describe, it, expect } from 'vitest';
import { normalizeOperator, denormalizeOperator } from '@/aliases';

describe('aliases', () => {
  it('normalizes symbolic operators to canonical', () => {
    expect(normalizeOperator('=')).toBe('eq');
    expect(normalizeOperator('!=')).toBe('neq');
    expect(normalizeOperator(' before ')).toBe('before');
    expect(normalizeOperator('after')).toBe('after');
  });

  it('passes through unknown keys unchanged', () => {
    expect(normalizeOperator('contains')).toBe('contains');
  });

  it('denormalizes eq/neq back to symbols', () => {
    expect(denormalizeOperator('eq')).toBe('=');
    expect(denormalizeOperator('neq')).toBe('!=');
    expect(denormalizeOperator('contains')).toBe('contains');
  });
});
