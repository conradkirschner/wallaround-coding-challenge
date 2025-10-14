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
      string: ['eq', 'contains'],   // string-only
      number: ['eq', 'between'],    // eq across string+number; between only for number
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

  it('treats undefined entries as empty and drops defaults when operatorMap is provided', () => {
    // Providing operatorMap disables defaults globally; `date: undefined` => no date operators.
    const schemaWithUndefinedDate = createSchema(
      [{ key: 'created', label: 'Created', type: 'date' }],
      { date: undefined }
    );

    // Since "date" operators were explicitly undefined, date-only ops like "before" are absent.
    expect(findOperator(schemaWithUndefinedDate, 'before')).toBeUndefined();

    // And since an operatorMap was provided, *no defaults* are applied for other types.
    // So even a common operator like "eq" is absent unless explicitly requested.
    expect(findOperator(schemaWithUndefinedDate, 'eq')).toBeUndefined();

    // Sanity: enabling an operator explicitly makes it appear
    const schemaWithStringEq = createSchema(
      [{ key: 'name', label: 'Name', type: 'string' }],
      { string: ['eq'] }
    );
    const eq = findOperator(schemaWithStringEq, 'eq');
    expect(eq).toBeTruthy();
    expect(eq?.supportedTypes).toEqual(['string']);
  });

  it('findField returns undefined for unknown field key', () => {
    expect(findField(schema, 'missing')).toBeUndefined();
  });
});
