import { describe, it, expect } from 'vitest';
import { createSchema, findOperator } from '@/schema';

const sorted = <T>(xs: readonly T[]) => [...xs].sort();

describe('schema – defaults when no operatorMap is provided', () => {
  it('applies sensible defaults per type', () => {
    const schema = createSchema([
      { key: 'n', label: 'Name', type: 'string' },
      { key: 'p', label: 'Price', type: 'number' },
      { key: 'b', label: 'Flag', type: 'boolean' },
      { key: 'd', label: 'Date', type: 'date' },
    ]);

    // number & date defaults include 'between'
    expect(sorted(findOperator(schema, 'between')!.supportedTypes)).toEqual(['date', 'number']);

    // boolean defaults include eq/neq; eq spans all scalar types by default
    expect(sorted(findOperator(schema, 'eq')!.supportedTypes)).toEqual([
      'boolean',
      'date',
      'number',
      'string',
    ]);
    expect(sorted(findOperator(schema, 'neq')!.supportedTypes)).toEqual([
      'boolean',
      'date',
      'number',
      'string',
    ]);

    // date defaults include before/after
    expect(findOperator(schema, 'before')!.supportedTypes).toEqual(['date']);
    expect(findOperator(schema, 'after')!.supportedTypes).toEqual(['date']);

    // string defaults include string-only ops
    expect(findOperator(schema, 'contains')!.supportedTypes).toEqual(['string']);
    expect(findOperator(schema, 'starts_with')!.supportedTypes).toEqual(['string']);
    expect(findOperator(schema, 'ends_with')!.supportedTypes).toEqual(['string']);
  });
});
