import { describe, it, expect } from 'vitest';
import { decodeTarget, encodeTarget } from '@/convert';
import type { FilterNode, ConditionNode, OrGroupNode, AndGroupNode } from '@/types';
import { isCondition, isOrGroup, isAndGroup } from '@/guards';

describe('convert', () => {
  it('decode normalizes operator aliases for conditions', () => {
    const input: FilterNode = { field: 'role', operator: '=', value: 'admin' };
    const decoded = decodeTarget(input);
    expect(isCondition(decoded)).toBe(true);
    if (isCondition(decoded)) {
      expect(decoded.operator).toBe('eq');
    }
  });

  it('decode traverses both AND and OR branches and normalizes nested operators', () => {
    // AND with a single OR child; normalize collapses the AND but both branches are executed.
    const input: FilterNode = {
      and: [
        {
          or: [
            { field: 'role', operator: '!=', value: 'guest' },
            { field: 'isActive', operator: '=', value: true },
          ],
        },
      ],
    };
    const decoded = decodeTarget(input);
    expect(isOrGroup(decoded)).toBe(true);
    if (isOrGroup(decoded)) {
      const children: ReadonlyArray<FilterNode> = (decoded as OrGroupNode).or;
      expect(children).toHaveLength(2);
      const first = children[0];
      const second = children[1];
      expect(isCondition(first)).toBe(true);
      expect(isCondition(second)).toBe(true);
      if (isCondition(first) && isCondition(second)) {
        expect(first.operator).toBe('neq'); // '!=' → 'neq'
        expect(second.operator).toBe('eq'); // '='  → 'eq'
      }
    }
  });

  it('encode denormalizes eq/neq and collapses single-child AND group', () => {
    const input: FilterNode = { and: [{ field: 'role', operator: 'eq', value: 'admin' }] };
    const encoded = encodeTarget(input);
    expect(isCondition(encoded)).toBe(true);
    if (isCondition(encoded)) {
      expect(encoded).toEqual<ConditionNode>({ field: 'role', operator: '=', value: 'admin' });
    }
  });

  it('encode collapses single-child OR group', () => {
    const input: FilterNode = { or: [{ field: 'role', operator: 'eq', value: 'admin' }] };
    const encoded = encodeTarget(input);
    expect(isCondition(encoded)).toBe(true);
    if (isCondition(encoded)) {
      expect(encoded).toEqual<ConditionNode>({ field: 'role', operator: '=', value: 'admin' });
    }
  });

  it('keeps groups with 2+ children (AND/OR)', () => {
    const andInput: FilterNode = {
      and: [
        { field: 'age', operator: 'gt', value: 30 },
        { field: 'age', operator: 'lt', value: 40 },
      ],
    };
    const orInput: FilterNode = {
      or: [
        { field: 'x', operator: 'neq', value: 1 },
        { field: 'y', operator: 'eq', value: 2 },
      ],
    };

    const andEncoded = encodeTarget(andInput);
    const orEncoded = encodeTarget(orInput);

    expect(isAndGroup(andEncoded)).toBe(true);
    expect(isOrGroup(orEncoded)).toBe(true);

    if (isAndGroup(andEncoded)) {
      const children: ReadonlyArray<FilterNode> = (andEncoded as AndGroupNode).and;
      expect(children.length).toBe(2);
    }
    if (isOrGroup(orEncoded)) {
      const children: ReadonlyArray<FilterNode> = (orEncoded as OrGroupNode).or;
      expect(children.length).toBe(2);
    }
  });

  it('decode does not introduce value for no-value operators (e.g., is_null)', () => {
    const input: FilterNode = { field: 'name', operator: 'is_null' }; // no value
    const decoded = decodeTarget(input);
    expect(isCondition(decoded)).toBe(true);
    if (isCondition(decoded)) {
      expect(decoded.operator).toBe('is_null');
      // ensure no value key was added
      expect('value' in decoded).toBe(false);
    }
  });

  it('encode does not add value for no-value operators (e.g., is_null)', () => {
    const input: FilterNode = { field: 'name', operator: 'is_null' };
    const encoded = encodeTarget(input);
    expect(isCondition(encoded)).toBe(true);
    if (isCondition(encoded)) {
      expect(encoded.operator).toBe('is_null');
      expect('value' in encoded).toBe(false);
    }
  });
});
