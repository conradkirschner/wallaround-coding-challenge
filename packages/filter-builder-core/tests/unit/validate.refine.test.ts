import { describe, it, expect } from 'vitest';
import { createSchema } from '@/schema';
import { validateNode } from '@/validate';
import type { FilterNode } from '@/types';

const schema = createSchema([{ key: 'n', label: 'Name', type: 'string' }]);

describe('validate – group refine predicate', () => {
  it('rejects a group that has neither and nor or', () => {
    // {} matches the group shape (all optional) but must fail refine()
    const invalid = {} as unknown as FilterNode;
    const res = validateNode(invalid, schema);
    expect(res.valid).toBe(false);
    expect(res.issues.some((m) => m.includes("either 'and' or 'or'"))).toBe(true);
  });
});
