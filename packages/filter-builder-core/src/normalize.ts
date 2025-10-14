import { isCondition, isAndGroup } from './guards';
import type { FilterNode } from './types';

/**
 * Normalize a filter tree so downstream code can rely on **shape invariants**.
 *
 * Invariants enforced:
 *  - **Groups only exist when they have ≥ 2 children.**
 *    • A single-child group is **collapsed** to its only child.
 *  - **Empty groups** are replaced with a minimal **placeholder condition**
 *    `{ field: '', operator: 'eq', value: '' }`.
 *
 * Why a placeholder instead of `null`/`undefined`?
 *  - Keeps the tree structurally valid for editing UIs without sprinkling null checks.
 *  - Preserves a place in the tree the user can immediately edit into a real condition.
 *
 * Purity & complexity:
 *  - Pure, non-mutating transformation (safe to reuse input nodes if desired).
 *  - Runs in O(n) over the number of nodes in the tree.
 *
 * @param node - Any filter node (condition or group) in canonical shape.
 * @returns A normalized node that satisfies the invariants above.
 */
export function normalize(node: FilterNode): FilterNode {
  // Base case: terminal condition nodes are already normalized.
  if (isCondition(node)) return node;

  // AND-group branch
  if (isAndGroup(node)) {
    // Normalize all children first (depth-first).
    const normalizedChildren: FilterNode[] = node.and.map(normalize);

    // Keep the group only if it has ≥ 2 children.
    if (normalizedChildren.length >= 2) return { and: normalizedChildren };

    // Collapse a single-child group to the child itself.
    if (normalizedChildren.length === 1) {
      const onlyChild = normalizedChildren[0];
      if (onlyChild !== undefined) return onlyChild;
    }

    // Empty group → placeholder condition for a stable, editable node.
    return { field: '', operator: 'eq', value: '' };
  }

  // OR-group branch (mirrors the AND logic above).
  const normalizedChildren: FilterNode[] = node.or.map(normalize);

  if (normalizedChildren.length >= 2) return { or: normalizedChildren };

  if (normalizedChildren.length === 1) {
    const onlyChild = normalizedChildren[0];
    if (onlyChild !== undefined) return onlyChild;
  }

  // Empty group → placeholder condition.
  return { field: '', operator: 'eq', value: '' };
}
