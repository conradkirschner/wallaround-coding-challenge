import { describe, it, expect } from 'vitest';
import { OPERATOR_CATALOG } from '@/operators';

describe('operators', () => {
  it('has expected keys and shapes', () => {
    const keys = Object.keys(OPERATOR_CATALOG);
    expect(keys).toContain('eq');
    expect(keys).toContain('neq');
    expect(keys).toContain('between');
    expect(OPERATOR_CATALOG.eq.valueArity).toBe('one');
    expect(OPERATOR_CATALOG.between.supportedTypes).toContain('number');
  });
});
