import { normalizeOperator, denormalizeOperator } from './aliases';
import { isCondition, isAndGroup } from './guards';
import { normalize } from './normalize';
import type { FilterNode, ConditionNode } from './types';

/**
 * Normalize a *target-format* filter tree into our **canonical** in-memory representation.
 *
 * Why this exists:
 * - The target format (wire format) may contain symbolic operators (e.g. `"="`, `"!="`) and
 *   arbitrarily nested groups. The UI/core logic prefers canonical operators (`eq`, `neq`, …)
 *   and a normalized shape (e.g., no degenerate 1-child groups).
 *
 * Guarantees:
 * - Operator aliases are converted to canonical via {@link normalizeOperator}.
 * - Node shape is normalized by {@link normalize} so subsequent consumers can rely on
 *   consistent invariants (e.g., groups only when the child count is ≥ 2).
 *
 * Non-goals:
 * - No validation here; use `validateNode` if you need schema/type/arity checks.
 *
 * @param input - Filter in the **target** JSON format.
 * @returns Canonical, normalized filter tree.
 */
export function decodeTarget(input: FilterNode): FilterNode {
  // Depth-first mapping that canonicalizes each node while preserving structure.
  const map = (n: FilterNode): FilterNode => {
    if (isCondition(n)) {
      // Convert operator spellings to canonical keys, preserve value when present.
      const mapped: ConditionNode = { field: n.field, operator: normalizeOperator(n.operator) };
      if ('value' in n) mapped.value = n.value;
      return mapped;
    }
    // Recurse into groups without collapsing here; `normalize` handles group normalization.
    return isAndGroup(n) ? { and: n.and.map(map) } : { or: n.or.map(map) };
  };

  // Final pass to eliminate degenerate groups and enforce shape invariants.
  return normalize(map(input));
}

/**
 * Convert a **canonical** filter tree back to the *target* JSON format.
 *
 * Responsibilities:
 * - Denormalize equality operator keys back to symbolic form (`eq` → `"="`, `neq` → `"!="`)
 *   to match the requested wire format.
 * - **No redundant group collapsing here.** We call {@link normalize} first, which already
 *   guarantees the “groups only exist when array length ≥ 2” invariant. This keeps the
 *   encoder lean and avoids dead/duplicated logic.
 *
 * Design notes:
 * - This function is intentionally side-effect free; it does not mutate the input nodes.
 *
 * @param node - Canonical filter node (already using `eq`, `neq`, etc.).
 * @returns Filter in the **target** JSON format, ready for GET/POST transport.
 */
export function encodeTarget(node: FilterNode): FilterNode {
  // Depth-first transformation that emits target operators.
  const map = (n: FilterNode): FilterNode => {
    if (isCondition(n)) {
      // Convert canonical keys to symbolic (eq/neq) where applicable; preserve value when present.
      const out: ConditionNode = { field: n.field, operator: denormalizeOperator(n.operator) };
      if ('value' in n) out.value = n.value;
      return out;
    }

    if (isAndGroup(n)) {
      const children: ReadonlyArray<FilterNode> = n.and.map(map);
      return { and: children };
    }

    const children: ReadonlyArray<FilterNode> = n.or.map(map);
    return { or: children };
  };

  // Normalize first to ensure we start from a canonical, stable shape; then emit target form.
  return map(normalize(node));
}
