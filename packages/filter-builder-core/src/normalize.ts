import { isCondition, isAndGroup } from './guards.js';
import type { FilterNode } from './types.js';

/**
 * Normalize a filter tree:
 * - AND/OR with 2+ children stays a group
 * - AND/OR with 1 child collapses to that child
 * - Empty group becomes a sentinel condition { field:'', operator:'eq', value:'' }
 */
export function normalize(node: FilterNode): FilterNode {
  if (isCondition(node)) return node;

  if (isAndGroup(node)) {
    const normalizedChildren = node.and.map(normalize);
    if (normalizedChildren.length >= 2) return { and: normalizedChildren };
    if (normalizedChildren.length === 1) return normalizedChildren[0]!; // length guards presence
    return { field: '', operator: 'eq', value: '' };
  }

  const normalizedChildren = node.or.map(normalize);
  if (normalizedChildren.length >= 2) return { or: normalizedChildren };
  if (normalizedChildren.length === 1) return normalizedChildren[0]!; // length guards presence
  return { field: '', operator: 'eq', value: '' };
}
