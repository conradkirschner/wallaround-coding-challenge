import { describe, it, expect } from 'vitest';
import { createSchema, findField, findOperator } from '@/schema';

describe('schema', () => {
  const schema = createSchema(
    [
      { key: 'age', label: 'Age', type: 'number' },
      { key: 'role', label: 'Role', type: 'string' },
      { key: 'createdAt', label: 'Created', type: 'date' },
    ],
    {
      // purposefully exclude some operators to exercise both seed+merge branches
      string: ['eq', 'contains'],   // seed path (string-only)
      number: ['eq', 'between'],    // merge path (eq across string+number)
      boolean: ['eq', 'neq'],
      date: ['eq', 'before'],
    },
  );

  it('creates merged operator definitions', () => {
    const eq = findOperator(schema, 'eq');
    expect(eq).toBeTruthy();
    expect(eq?.supportedTypes).toEqual(expect.arrayContaining(['string', 'number']));

    const contains = findOperator(schema, 'contains'); // seeded only from string
    expect(contains?.supportedTypes).toEqual(['string']);
  });

  it('findField works and duplicates are rejected', () => {
    expect(findField(schema, 'age')?.label).toBe('Age');
    expect(() =>
      createSchema([
        { key: 'x', label: 'X', type: 'string' },
        { key: 'x', label: 'Duplicate', type: 'string' },
      ]),
    ).toThrow();
  });

  it('findOperator returns undefined when operator is not included by the schema', () => {
    // 'after' is not included for date in the base schema above
    expect(findOperator(schema, 'after')).toBeUndefined();
  });

  it('handles nullish operator arrays via (keys ?? []) path', () => {
    // Override "date" with an explicit undefined to trigger the nullish coalescing branch.
    // This ensures Object.entries(resolved) yields ["date", undefined] and (keys ?? [])
    // evaluates to [], covering the previously untested branch.
    const schemaWithUndefinedDate = createSchema(
      [{ key: 'created', label: 'Created', type: 'date' }],
      { date: undefined } // override defaults with undefined
    );

    // Since "date" operators were overridden to undefined, date-only ops like "before" are absent.
    expect(findOperator(schemaWithUndefinedDate, 'before')).toBeUndefined();

    // Sanity check: other types still work from defaults (e.g., string eq exists even without fields).
    const eq = findOperator(schemaWithUndefinedDate, 'eq');
    expect(eq).toBeTruthy();
  });

  it('findField returns undefined for unknown field key', () => {
    expect(findField(schema, 'missing')).toBeUndefined();
  });
});
