import { describe, it, expect } from 'vitest';
import { createSchema } from '@/schema';
import { createFilterApi } from '@/api';
import type { FilterNode } from '@/types';

const schema = createSchema(
  [
    { key: 'age', label: 'Age', type: 'number' },
    { key: 'role', label: 'Role', type: 'string' },
    { key: 'isActive', label: 'Active', type: 'boolean' },
    { key: 'joined', label: 'Joined', type: 'date' },
  ],
  {
    string: ['eq', 'neq', 'contains', 'starts_with', 'ends_with', 'in', 'is_null', 'is_not_null'],
    number: ['eq', 'neq', 'gt', 'lt', 'between', 'in'],
    boolean: ['eq', 'neq', 'is_null', 'is_not_null'],
    date: ['eq', 'neq', 'before', 'after', 'between'],
  },
);
const api = createFilterApi(schema);

describe('API coverage', () => {
  it('decode/encode round-trip and equals/neq mapping', () => {
    const input: FilterNode = {
      and: [
        { field: 'age', operator: 'gt', value: 30 },
        {
          or: [
            { field: 'role', operator: 'eq', value: 'admin' },
            { field: 'isActive', operator: '=', value: true },
          ],
        },
      ],
    };
    const decoded = api.decode(input);
    const encoded = api.encode(decoded);
    // eq mapped to '='
    expect(encoded).toEqual({
      and: [
        { field: 'age', operator: 'gt', value: 30 },
        {
          or: [
            { field: 'role', operator: '=', value: 'admin' },
            { field: 'isActive', operator: '=', value: true },
          ],
        },
      ],
    });
  });

  it('collapses single-child groups', () => {
    const collapsed = api.encode(
      api.decode({ and: [{ field: 'joined', operator: 'before', value: '2020-01-01' }] }),
    );
    expect('field' in collapsed).toBe(true);
  });

  it('normalizes empty groups to placeholder', () => {
    const normalized = api.encode({ and: [] });
    expect('field' in normalized).toBe(true);
  });

  it('query helpers', () => {
    const qp = api.toQueryParam({ field: 'role', operator: '=', value: 'admin' });
    expect(qp.startsWith('filter=')).toBe(true);
    const url = api.withFilterInUrl('/search', { field: 'role', operator: '=', value: 'admin' });
    expect(url.startsWith('/search?filter=')).toBe(true);
  });

  it('validation: type support & arity branches', () => {
    // unsupported operator for type
    const badType = api.validate({
      field: 'isActive',
      operator: 'gt',
      value: 1,
    } as unknown as FilterNode);
    expect(badType.valid).toBe(false);

    // none: value not allowed
    const noneVal = api.validate({ field: 'role', operator: 'is_null', value: 'x' });
    expect(noneVal.valid).toBe(false);

    // one: missing value
    const oneMissing = api.validate({ field: 'role', operator: 'eq' });
    expect(oneMissing.valid).toBe(false);

    // two: wrong length
    const twoWrong = api.validate({ field: 'age', operator: 'between', value: [1] });
    expect(twoWrong.valid).toBe(false);

    // many: empty array
    const manyEmpty = api.validate({ field: 'role', operator: 'in', value: [] });
    expect(manyEmpty.valid).toBe(false);

    // valid case
    const ok = api.validate({ field: 'age', operator: 'between', value: [18, 65] });
    expect(ok.valid).toBe(true);
  });

  it('schema duplicate field throws', () => {
    expect(() =>
      createSchema([
        { key: 'k', label: 'K', type: 'string' },
        { key: 'k', label: 'K2', type: 'string' },
      ]),
    ).toThrow();
  });

  //
  // ── Static string ⇄ object tests ───────────────────────────────────────────────
  //

  it('toQueryParam produces deterministic output for a known JSON string', () => {
    const s = '{"field":"role","operator":"=","value":"admin"}';
    const node = JSON.parse(s) as FilterNode;
    const qp = api.toQueryParam(node);
    expect(qp).toBe(`filter=${encodeURIComponent(s)}`);
  });

  it('withFilterInUrl appends encoded filter deterministically (base without / with query)', () => {
    const s = '{"field":"role","operator":"=","value":"admin"}';
    const node = JSON.parse(s) as FilterNode;

    const url1 = api.withFilterInUrl('/search', node);
    expect(url1).toBe(`/search?filter=${encodeURIComponent(s)}`);

    const url2 = api.withFilterInUrl('/search?page=1', node);
    expect(url2).toBe(`/search?page=1&filter=${encodeURIComponent(s)}`);
  });

  it('decode→encode is stable for a known target JSON string (deep tree)', () => {
    const s =
      '{"and":[{"field":"age","operator":"gt","value":30},{"or":[{"field":"role","operator":"=","value":"admin"},{"field":"isActive","operator":"=","value":true}]}]}';
    const decoded = api.decode(JSON.parse(s) as FilterNode);
    const reencoded = api.encode(decoded);
    const out = JSON.stringify(reencoded);
    expect(out).toBe(s); // stable canonicalization for this input
  });

  it('validate accepts a valid known-good JSON string', () => {
    const s = '{"field":"age","operator":"between","value":[18,65]}';
    const res = api.validate(JSON.parse(s) as FilterNode);
    expect(res.valid).toBe(true);
    expect(res.issues).toEqual([]);
  });

  it('validate rejects a known-bad JSON string with stable message', () => {
    const s = '{"field":"unknownField","operator":"=","value":"x"}';
    const res = api.validate(JSON.parse(s) as FilterNode);
    expect(res.valid).toBe(false);
    expect(res.issues[0]).toBe("$.field: Unknown field 'unknownField'");
  });
});
