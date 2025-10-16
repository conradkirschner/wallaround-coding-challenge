import { z } from 'zod';
import { normalizeOperator } from './aliases.js';
import { isCondition, isAndGroup } from './guards.js';
import { findField, findOperator } from './schema.js';
import type { FilterNode, Schema, ValidationResult, ConditionNode } from './types.js';

/**
 * Zod contract for a **condition** node.
 *
 * Scope:
 * - Structure-only validation: correct keys and types.
 * - Does **not** enforce operator/value semantics (that’s handled later against `Schema`).
 *
 * Why Zod here?
 * - We want fast, defensive checks on untyped input (from UI, deserialization, etc.)
 *   before performing schema-aware validation.
 */
const conditionZ = z.object({
  field: z.string(),
  operator: z.string(),
  value: z.unknown().optional(),
});

/**
 * Minimal structural type used solely for Zod parsing/recursion.
 * We keep all properties optional to allow the union/object discriminators to work properly
 * during parsing. Semantics are enforced later.
 */
type NodeZ = { field?: string; operator?: string; value?: unknown; and?: NodeZ[]; or?: NodeZ[] };

/**
 * Zod contract for **group** nodes with a refinement:
 * - Exactly **one** of `and` or `or` must be present.
 * - Children may be conditions or nested groups (recursive).
 */
const groupZ: z.ZodType<{ and?: NodeZ[]; or?: NodeZ[] }> = z.lazy(() =>
  z
    .object({
      and: z.array(z.union([conditionZ, groupZ])).optional(),
      or: z.array(z.union([conditionZ, groupZ])).optional(),
    })
    .refine(
      (v: { and?: NodeZ[]; or?: NodeZ[] }) =>
        (v.and !== undefined && v.or === undefined) || (v.or !== undefined && v.and === undefined),
      { message: "Group must have either 'and' or 'or' exclusively" },
    ),
);

/**
 * Union of condition/group for structural validation of **any** filter node.
 * This checks *shape only*; schema-aware rules (type/operator/arity) are handled below.
 */
const filterNodeZ: z.ZodType<NodeZ> = z.union([conditionZ, groupZ]);

/**
 * Validate a terminal **condition** node against the active `Schema`.
 *
 * Responsibilities:
 * - Field existence check (unknown fields → error).
 * - Operator resolution with alias normalization (e.g., `"="` → `eq`) and existence check.
 * - Type compatibility (`OperatorDef.supportedTypes` vs field `ValueType`).
 * - Value arity checks based on operator contract:
 *    - `'none'`  → value must be **absent** / empty.
 *    - `'one'`   → value must be a **scalar** (not array/undefined/null).
 *    - `'two'`   → value must be an **array of length 2**.
 *    - `'many'`  → value must be a **non-empty array**.
 *
 * Returns:
 * - An array of **human-readable** issue strings. Empty array means **valid**.
 *
 * @param node - Condition to validate (may contain symbolic operator spellings).
 * @param schema - Concrete schema produced by `createSchema`.
 * @param path - JSON path prefix (for precise error messages in nested trees).
 */
function validateCondition(node: ConditionNode, schema: Schema, path: string): string[] {
  const field = findField(schema, node.field);
  if (!field) return [`${path}.field: Unknown field '${node.field}'`];

  const operatorKey = normalizeOperator(node.operator);
  const operator = findOperator(schema, operatorKey);
  if (!operator) return [`${path}.operator: Unknown operator '${node.operator}'`];

  const typeIssue = operator.supportedTypes.includes(field.type)
    ? []
    : [`${path}.operator: Operator '${operator.key}' not supported for '${field.type}'`];

  // The value can be any runtime shape; operator arity dictates the expected structure.
  const value = (node as { value?: unknown }).value;
  const arityIssue =
    operator.valueArity === 'none'
      ? value !== undefined && value !== null && value !== ''
        ? [`${path}.value: '${operator.key}' expects no value`]
        : []
      : operator.valueArity === 'one'
        ? value === undefined || value === null || Array.isArray(value)
          ? [`${path}.value: '${operator.key}' expects a single value`]
          : []
        : operator.valueArity === 'two'
          ? !Array.isArray(value) || (value as unknown[]).length !== 2
            ? [`${path}.value: '${operator.key}' expects a two-value array`]
            : []
          : !Array.isArray(value) || (value as unknown[]).length === 0
            ? [`${path}.value: '${operator.key}' expects a non-empty array`]
            : [];

  return [...typeIssue, ...arityIssue];
}

/**
 * Validate a complete filter tree against a `Schema`.
 *
 * Two-phase strategy:
 *  1) **Shape validation** via Zod (`filterNodeZ`) to quickly reject malformed inputs.
 *  2) **Semantic validation**:
 *     - Recursively traverse the tree.
 *     - For conditions, delegate to {@link validateCondition}.
 *     - For groups, walk children and collect issues with precise `path` prefixes.
 *
 * Design notes:
 * - This function is **pure** and returns a stable `ValidationResult`.
 * - We do not attempt auto-fixes here; normalization/encoding is handled by separate utilities.
 *
 * @param node - Root node of the filter (canonical or target operator tokens are accepted).
 * @param schema - Concrete schema with fields/operators.
 * @returns `ValidationResult` with `valid` flag and a list of issues (if any).
 */
export function validateNode(node: FilterNode, schema: Schema): ValidationResult {
  // Phase 1: structural sanity check.
  const parsed = filterNodeZ.safeParse(node);
  if (!parsed.success) return { valid: false, issues: parsed.error.issues.map((i: { message: string; }) => i.message) };

  // Phase 2: semantics - recurse and aggregate issues with stable, user-friendly paths.
  const collect = (n: FilterNode, path: string): string[] =>
    isCondition(n)
      ? validateCondition(n, schema, path)
      : isAndGroup(n)
        ? n.and.flatMap((child: FilterNode, index: number) =>
            collect(child, `${path}.and[${index}]`),
          )
        : n.or.flatMap((child: FilterNode, index: number) =>
            collect(child, `${path}.or[${index}]`),
          );

  const issues = collect(node, '$');
  return { valid: issues.length === 0, issues };
}
