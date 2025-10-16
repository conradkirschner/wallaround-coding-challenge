import type { OperatorDef, OperatorKey } from './types.js';

/**
 * Central catalog of **canonical operators** with their runtime semantics.
 *
 * Design goals:
 * - **Single source of truth** for operator capabilities. Validation, UI affordances,
 *   and serialization should consult this table rather than duplicate knowledge.
 * - **Minimal but expressive**: every operator declares the arity of its value input and
 *   the field types it supports. This drives both validation and editor widgets.
 *
 * Conventions:
 * - `valueArity`:
 *    - `'none'`  → operator expects **no** `value` property (e.g. `is_null`).
 *    - `'one'`   → single scalar (string/number/boolean/date).
 *    - `'two'`   → fixed-length tuple of 2 values (e.g. `between`).
 *    - `'many'`  → non-empty array (e.g. `in`).
 * - `supportedTypes` is **additive** with schema-level operator maps; this table defines the
 *   *maximum* capability, while a consumer schema can further restrict per dataset.
 *
 * Notes for maintainers:
 * - If you add a new operator, also consider:
 *   1) Aliases (see `aliases.ts`) if end users might supply symbolic/alt spellings.
 *   2) UI controls for the operator’s arity in the React package.
 *   3) Tests (validation + encode/decode) to lock behavior.
 */
export const OPERATOR_CATALOG: Record<OperatorKey, OperatorDef> = {
  // Equality / inequality - broadly applicable across primitive types.
  eq: {
    key: 'eq',
    label: 'Equals',
    valueArity: 'one',
    supportedTypes: ['string', 'number', 'boolean', 'date'],
  },
  neq: {
    key: 'neq',
    label: 'Not equals',
    valueArity: 'one',
    supportedTypes: ['string', 'number', 'boolean', 'date'],
  },

  // Ordering - meaningful for numbers and dates only.
  gt: { key: 'gt', label: 'Greater than', valueArity: 'one', supportedTypes: ['number', 'date'] },
  lt: { key: 'lt', label: 'Less than', valueArity: 'one', supportedTypes: ['number', 'date'] },

  // String matching - intentionally string-only to avoid ambiguous coercions.
  contains: { key: 'contains', label: 'Contains', valueArity: 'one', supportedTypes: ['string'] },
  starts_with: {
    key: 'starts_with',
    label: 'Starts with',
    valueArity: 'one',
    supportedTypes: ['string'],
  },
  ends_with: {
    key: 'ends_with',
    label: 'Ends with',
    valueArity: 'one',
    supportedTypes: ['string'],
  },

  // Membership - accepts a non-empty list; supports strings and numbers by default.
  in: { key: 'in', label: 'In list', valueArity: 'many', supportedTypes: ['string', 'number'] },

  // Range - requires exactly two endpoints; caller interprets inclusivity as needed.
  between: {
    key: 'between',
    label: 'Between',
    valueArity: 'two',
    supportedTypes: ['number', 'date'],
  },

  // Nullability - consumes no value; works across all primitives.
  is_null: {
    key: 'is_null',
    label: 'Is null / empty',
    valueArity: 'none',
    supportedTypes: ['string', 'number', 'boolean', 'date'],
  },
  is_not_null: {
    key: 'is_not_null',
    label: 'Is not null / empty',
    valueArity: 'none',
    supportedTypes: ['string', 'number', 'boolean', 'date'],
  },

  // Temporal relations - explicit date-only operators for clearer UX vs numeric comparisons.
  before: { key: 'before', label: 'Before', valueArity: 'one', supportedTypes: ['date'] },
  after: { key: 'after', label: 'After', valueArity: 'one', supportedTypes: ['date'] },
};
