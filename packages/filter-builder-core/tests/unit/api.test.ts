import { describe, it, expect } from 'vitest';
import { createFilterApi } from '@/api';
import { createSchema } from '@/schema';
import type { FilterNode } from '@/types';

const schema = createSchema([
  { key: 'age', label: 'Age', type: 'number' },
  { key: 'role', label: 'Role', type: 'string' },
  { key: 'isActive', label: 'Active', type: 'boolean' },
]);

describe('api', () => {
  const api = createFilterApi(schema);
  const condition: FilterNode = { field: 'role', operator: '=', value: 'admin' };

  it('exposes schema and helpers', () => {
    expect(api.schema.fields.length).toBeGreaterThan(0);
    expect(typeof api.decode).toBe('function');
    expect(typeof api.encode).toBe('function');
    expect(typeof api.validate).toBe('function');
    expect(typeof api.toQueryParam).toBe('function');
    expect(typeof api.withFilterInUrl).toBe('function');
  });

  it('encodes and decodes filters correctly', () => {
    const target: FilterNode = {
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
    const decoded = api.decode(target);
    const encoded = api.encode(decoded);
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

  it('builds query param and URL (default param, base without query)', () => {
    const qp = api.toQueryParam(condition);
    expect(qp.startsWith('filter=')).toBe(true);
    const url = api.withFilterInUrl('/search', condition);
    expect(url).toMatch(/^\/search\?filter=/);
  });

  it('withFilterInUrl uses "&" when baseUrl already has a query', () => {
    const url = api.withFilterInUrl('/search?q=foo', condition);
    expect(url).toMatch(/^\/search\?q=foo&filter=/);
  });

  it('supports custom query parameter name', () => {
    const qp = api.toQueryParam(condition, 'f');
    expect(qp.startsWith('f=')).toBe(true);
    const url = api.withFilterInUrl('/search?q=1', condition, 'f');
    expect(url).toMatch(/^\/search\?q=1&f=/);
  });

  it('validates via schema', () => {
    const v = api.validate({ field: 'role', operator: 'eq', value: 'admin' });
    expect(v.valid).toBe(true);
  });
});
