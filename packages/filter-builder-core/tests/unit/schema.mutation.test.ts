import { describe, it, expect } from 'vitest';
import { createSchema, findOperator } from '@/schema';
import type { Schema } from '@/types';

const sorted = <T>(xs: readonly T[]) => [...xs].sort();

describe('schema – operator merge and overrides (no defaults when operatorMap is provided)', () => {
  it('merges only the overridden types when others are undefined (true narrowing)', () => {
    const s = createSchema(
      [
        { key: 'p', label: 'Price', type: 'number' },
        { key: 'n', label: 'Name', type: 'string' },
      ],
      {
        number: ['eq', 'between'],
        string: ['eq'],
        boolean: undefined, // explicitly no operators for this type
        date: undefined, // explicitly no operators for this type
      },
    );
    const eq = findOperator(s, 'eq')!;
    expect(sorted(eq.supportedTypes)).toEqual(['number', 'string']);
    // "between" should only be allowed for number (per catalog), not string
    const between = findOperator(s, 'between')!;
    expect(between.supportedTypes).toEqual(['number']);
  });

  it('allows narrowing for a single type; defaults are dropped for unspecified types', () => {
    const s: Schema = createSchema([{ key: 'd', label: 'Date', type: 'date' }], { date: ['eq'] });
    // Date-only ops not listed are absent
    expect(findOperator(s, 'before')).toBeUndefined();
    expect(findOperator(s, 'after')).toBeUndefined();
    // Only eq remains for date
    const eq = findOperator(s, 'eq');
    expect(eq).toBeTruthy();
    expect(eq?.supportedTypes).toEqual(['date']);
    // Since operatorMap is provided, no other types get defaults
    // (if we didn’t list string/number/boolean at all, they contribute nothing)
    expect(findOperator(s, 'contains')).toBeUndefined();
  });

  it('treats undefined entries as empty and drops defaults when operatorMap is provided', () => {
    const s: Schema = createSchema(
      [{ key: 'created', label: 'Created', type: 'date' }],
      { date: undefined }, // provide a map → defaults disabled; date explicitly empty
    );
    // Date-only operators are absent
    expect(findOperator(s, 'before')).toBeUndefined();
    expect(findOperator(s, 'after')).toBeUndefined();
    // Even common operators like eq are absent (no defaults applied)
    expect(findOperator(s, 'eq')).toBeUndefined();

    // Sanity: enabling an operator explicitly makes it appear
    const s2 = createSchema([{ key: 'name', label: 'Name', type: 'string' }], { string: ['eq'] });
    const eq2 = findOperator(s2, 'eq')!;
    expect(eq2).toBeTruthy();
    expect(eq2.supportedTypes).toEqual(['string']);
  });

  it('ignores unsupported (type → operator) pairs via catalog intersection', () => {
    // "contains" is string-only in the catalog; mapping it to number should be ignored.
    const s = createSchema([{ key: 'p', label: 'Price', type: 'number' }], {
      number: ['eq', 'contains'],
      string: [],
      boolean: [],
      date: [],
    });
    // contains dropped for number
    expect(findOperator(s, 'contains')).toBeUndefined();
    // eq kept for number only
    const eq = findOperator(s, 'eq')!;
    expect(eq.supportedTypes).toEqual(['number']);
  });

  it('deduplicates supportedTypes if the same type is listed twice', () => {
    const s: Schema = createSchema(
      [{ key: 'n', label: 'Name', type: 'string' }],
      { string: ['eq', 'eq', 'contains'] }, // duplicate eq on purpose
    );
    const op = findOperator(s, 'eq')!;
    expect(op.supportedTypes).toEqual(['string']); // no duplicates
  });
});
describe('schema – robustness', () => {
  it('ignores unknown operator keys without throwing', () => {
    const schema = createSchema([{ key: 'n', label: 'Name', type: 'string' }], {
      string: ['eq', 'totally_unknown' as never],
      number: [],
      boolean: [],
      date: [],
    });
    // unknown operator is not present
    expect(findOperator(schema, 'totally_unknown' as never)).toBeUndefined();
    // known operator still present
    expect(findOperator(schema, 'eq')).toBeTruthy();
  });

  it('throws with stable duplicate-field message', () => {
    expect(() =>
      createSchema([
        { key: 'x', label: 'X', type: 'string' },
        { key: 'x', label: 'Dup', type: 'string' },
      ]),
    ).toThrowError('Duplicate field keys are not allowed.');
  });
});
