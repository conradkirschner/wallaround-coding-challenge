import { describe, it, expect } from 'vitest';
import { createSchema } from '@/schema';
import { validateNode } from '@/validate';
import type { FilterNode } from '@/types';

const schema = createSchema(
  [
    { key: 'price', label: 'Price', type: 'number' },
    { key: 'name', label: 'Name', type: 'string' },
    { key: 'active', label: 'Active', type: 'boolean' },
    { key: 'published', label: 'Published', type: 'date' },
  ],
  {
    string: ['eq', 'neq', 'contains', 'starts_with', 'ends_with', 'in', 'is_null', 'is_not_null'],
    number: ['eq', 'neq', 'gt', 'lt', 'between', 'in', 'is_null', 'is_not_null'],
    boolean: ['eq', 'neq', 'is_null', 'is_not_null'],
    date: ['eq', 'neq', 'before', 'after', 'between', 'is_null', 'is_not_null'],
  },
);

describe('validate (extra coverage)', () => {
  it('accepts none-arity operators without values', () => {
    const a: FilterNode = { field: 'name', operator: 'is_null' };
    const b: FilterNode = { field: 'active', operator: 'is_not_null' };
    expect(validateNode(a, schema).valid).toBe(true);
    expect(validateNode(b, schema).valid).toBe(true);
  });

  it('rejects one-arity operator when value is null', () => {
    const bad: FilterNode = { field: 'name', operator: 'eq', value: null as unknown };
    const res = validateNode(bad, schema);
    expect(res.valid).toBe(false);
    expect(res.issues.some((m) => m.includes("expects a single value"))).toBe(true);
  });

  it('rejects two-arity operator when value is not an array', () => {
    const bad: FilterNode = { field: 'price', operator: 'between', value: 7 as unknown };
    const res = validateNode(bad, schema);
    expect(res.valid).toBe(false);
    expect(res.issues.some((m) => m.includes("expects a two-value array"))).toBe(true);
  });

  it('rejects many-arity operator when value is not an array', () => {
    const bad: FilterNode = { field: 'name', operator: 'in', value: 'A' as unknown };
    const res = validateNode(bad, schema);
    expect(res.valid).toBe(false);
    expect(res.issues.some((m) => m.includes("expects a non-empty array"))).toBe(true);
  });

  it('traverses AND branch and validates children (alias "=" accepted)', () => {
    // Top-level AND to exercise isAndGroup branch in `collect`
    const tree: FilterNode = {
      and: [{ field: 'name', operator: '=', value: 'A' }], // "=" → eq
    };
    const res = validateNode(tree, schema);
    expect(res.valid).toBe(true);
  });

  it('traverses OR branch and reports indexed path for the second child', () => {
    const tree: FilterNode = {
      or: [
        { field: 'name', operator: '=', value: 'A' },
        { field: 'name', operator: 'nope', value: 'B' }, // unknown operator → error at $.or[1]
      ],
    };
    const res = validateNode(tree, schema);
    expect(res.valid).toBe(false);
    expect(
      res.issues.some((m) => m.startsWith("$.or[1].operator: Unknown operator 'nope'")),
    ).toBe(true);
  });
  it('two-arity accepts array of exactly two values', () => {
    const node: FilterNode = { field: 'price', operator: 'between', value: [10, 20] };
    const res = validateNode(node, schema);
    expect(res.valid).toBe(true);
  });
  it("rejects 'contains' for number fields (string-only operator)", () => {
    const node: FilterNode = { field: 'price', operator: 'contains', value: 'x' };
    const res = validateNode(node, schema);
    expect(res.valid).toBe(false);
    expect(
      res.issues.some((m) => m.includes("Operator 'contains' not supported for 'number'")),
    ).toBe(true);
  });
// ✅ covers the "two-arity valid" branch (the else [] inside the 'two' ternary)
  it('accepts a nested tree where a two-arity operator is valid (between with exactly two values)', () => {
    const tree: FilterNode = {
      and: [
        // two-arity: exactly two values → should be valid and hit the success branch
        { field: 'price', operator: 'between', value: [10, 20] },

        // include an OR sibling so both collect branches run in the same test
        {
          or: [
            { field: 'name', operator: 'eq', value: 'A' },   // one-arity valid
            { field: 'active', operator: 'eq', value: true }, // one-arity valid
          ],
        },
      ],
    };

    const res = validateNode(tree, schema);
    expect(res.valid).toBe(true);
    expect(res.issues).toEqual([]);
  });
  it('many-arity accepts a non-empty array', () => {
    const node: FilterNode = { field: 'name', operator: 'in', value: ['A', 'B'] };
    const res = validateNode(node, schema);
    expect(res.valid).toBe(true);
    expect(res.issues).toEqual([]);
  });

  it("none-arity treats empty string as 'no value'", () => {
    const node: FilterNode = { field: 'name', operator: 'is_null', value: '' };
    const res = validateNode(node, schema);
    expect(res.valid).toBe(true);
    expect(res.issues).toEqual([]);
  });
  it("none-arity treats null as 'no value' (valid)", () => {
    // Hits the success arm of:
    // operator.valueArity === 'none'
    //   ? value !== undefined && value !== null && value !== '' ? [error] : []
    const node: FilterNode = { field: 'name', operator: 'is_null', value: null };
    const res = validateNode(node, schema);
    expect(res.valid).toBe(true);
    expect(res.issues).toEqual([]);
  });

  it('fails fast on structural shape errors (Zod union), not just refine()', () => {
    // `or` must be an array; this triggers filterNodeZ.safeParse → !parsed.success path
    const malformed = { or: 123 } as unknown as FilterNode;
    const res = validateNode(malformed, schema);
    expect(res.valid).toBe(false);
    expect(res.issues.length).toBeGreaterThan(0); // message text can vary by zod version
  });
  it('none-arity rejects any present value', () => {
    const node: FilterNode = { field: 'name', operator: 'is_null', value: 'x' };
    const res = validateNode(node, schema);
    expect(res.valid).toBe(false);
    expect(res.issues.some((m) => m.includes("expects no value"))).toBe(true);
  });
  it('rejects unknown field at root with precise message', () => {
    const node: FilterNode = { field: 'doesNotExist', operator: 'eq', value: 'x' };
    const res = validateNode(node, schema);
    expect(res.valid).toBe(false);
    expect(
      res.issues.some((m) => m === "$.field: Unknown field 'doesNotExist'")
    ).toBe(true);
  });

  it('rejects unknown field inside a group and includes indexed path', () => {
    const tree: FilterNode = {
      and: [{ field: 'missingField', operator: 'eq', value: 'x' }],
    };
    const res = validateNode(tree, schema);
    expect(res.valid).toBe(false);
    expect(
      res.issues.some((m) => m === "$.and[0].field: Unknown field 'missingField'")
    ).toBe(true);
  });

});
