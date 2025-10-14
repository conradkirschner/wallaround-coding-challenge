import { describe, it, expect } from 'vitest';
import { createSchema, createFilterApi } from '@/index';
import type { FilterNode } from '@/index';

describe('index (barrel exports)', () => {
  it('re-exports createSchema and createFilterApi', () => {
    const schema = createSchema([{ key: 'k', label: 'K', type: 'string' }]);
    const api = createFilterApi(schema);
    const out = api.encode({ field: 'k', operator: 'eq', value: 'v' } as FilterNode);
    expect(out).toEqual({ field: 'k', operator: '=', value: 'v' });
  });
});
