/**
 * Finite domain of field **value types** supported by the library.
 *
 * Rationale:
 * - We keep the primitive set intentionally small and explicit to avoid ambiguous coercions.
 * - If you need to extend this (e.g. "enum"), prefer modeling that as a `string` with
 *   `Field.options` so UI controls remain deterministic and validation stays simple.
 */
export type ValueType = 'string' | 'number' | 'boolean' | 'date';

/**
 * Option for fields that render as a discrete choice (e.g., select).
 *
 * Contract:
 * - `value` is the raw value serialized into the filter `value` property.
 * - `label` is the human-readable string presented in the UI.
 */
export interface FieldOption {
  value: string;
  label: string;
}

/**
 * Declarative description of a dataset field.
 *
 * Invariants:
 * - `key` must be **unique** across the schema. We enforce this at `createSchema` time.
 * - `type` determines which operators are eligible for this field (via `OperatorDef.supportedTypes`).
 * - `options` is optional and primarily used for `string` fields with finite domains.
 */
export interface Field {
  key: string;
  label: string;
  type: ValueType;
  options?: ReadonlyArray<FieldOption>;
}

/**
 * Canonical operator identifiers understood by the core.
 *
 * Notes:
 * - Symbolic / human-friendly forms (e.g., `"="`, `"!="`, `"is null"`) are normalized to these
 *   keys by `normalizeOperator`. Conversely, `encodeTarget` may denormalize equality keys to
 *   symbols to match the wire format.
 */
export type OperatorKey =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'lt'
  | 'contains'
  | 'starts_with'
  | 'ends_with'
  | 'in'
  | 'between'
  | 'is_null'
  | 'is_not_null'
  | 'before'
  | 'after';

/**
 * A terminal condition over a single `field` using an `operator`.
 *
 * `value`:
 * - Intentionally typed as `unknown` because the *operator* dictates arity and type at runtime:
 *   - `'none'`  → omit `value`
 *   - `'one'`   → scalar (string | number | boolean | date-serializable)
 *   - `'two'`   → tuple with exactly two elements
 *   - `'many'`  → non-empty array
 * Validation rules are enforced by `validateNode`.
 */
export type ConditionNode = { field: string; operator: string; value?: unknown };

/**
 * Conjunctive group: every child must match.
 * The **target format invariant** is that a group should exist only when it has ≥ 2 children.
 * Single-child groups are typically collapsed by `normalize`/`encodeTarget`.
 */
export type AndGroupNode = { and: ReadonlyArray<FilterNode> };

/**
 * Disjunctive group: at least one child must match.
 * The same ≥ 2 children invariant as `AndGroupNode` applies.
 */
export type OrGroupNode = { or: ReadonlyArray<FilterNode> };

/**
 * Unified filter node type used across the core.
 *
 * Shape vs semantics:
 * - The *shape* (condition | and-group | or-group) is shared by both the canonical and target
 *   forms. The **operator token** may differ (`eq` vs `"="`), which `decodeTarget` and
 *   `encodeTarget` transform.
 */
export type FilterNode = ConditionNode | AndGroupNode | OrGroupNode;

/**
 * Runtime descriptor for an operator’s capabilities.
 *
 * - `valueArity` expresses how the `value` in `ConditionNode` must be shaped.
 * - `supportedTypes` lists the field `ValueType`s the operator is valid against.
 *   This is merged with consumer `OperatorMap` to produce the effective schema.
 */
export interface OperatorDef {
  key: OperatorKey;
  label: string;
  valueArity: 'none' | 'one' | 'two' | 'many';
  supportedTypes: ReadonlyArray<ValueType>;
}

/**
 * Consumer-facing configuration that maps each `ValueType` to the set of allowed operators.
 *
 * Semantics:
 * - This is used to **narrow or expand** what the global `OPERATOR_CATALOG` allows.
 * - Omitted entries fall back to library defaults in `createSchema`.
 */
export interface OperatorMap {
  string?: ReadonlyArray<OperatorKey>;
  number?: ReadonlyArray<OperatorKey>;
  boolean?: ReadonlyArray<OperatorKey>;
  date?: ReadonlyArray<OperatorKey>;
}

/**
 * Fully realized schema the core operates against.
 *
 * - `fields` - the dataset-specific field descriptors.
 * - `operators` - the merged, deduplicated list of `OperatorDef`s after applying `OperatorMap`.
 * - `operatorMap` - the effective (defaults + overrides) operator map, fully required.
 */
export interface Schema {
  fields: ReadonlyArray<Field>;
  operators: ReadonlyArray<OperatorDef>;
  operatorMap: Required<OperatorMap>;
}

/**
 * Result of validating a `FilterNode` against a `Schema`.
 *
 * - `valid` reflects whether any issues were found.
 * - `issues` contains human-readable messages suitable for surfacing in the UI or logs.
 */
export interface ValidationResult {
  valid: boolean;
  issues: string[];
}

/**
 * Minimal, explicit programmatic API exposed by the core package.
 *
 * Design tenets:
 * - Pure functions (no I/O), easy to unit test.
 * - Clear separation of concerns: this layer handles shape, operators, and validation;
 *   your app decides how/when to transport the data (GET/POST).
 */
export interface FilterApi {
  /** The concrete schema this API instance is bound to. */
  schema: Schema;

  /**
   * Convert **target** JSON into canonical form (normalize operator tokens/shape).
   */
  decode: (input: FilterNode) => FilterNode;

  /**
   * Convert canonical form back to **target** JSON (e.g., `eq` → `"="`), applying
   * the “groups only if ≥ 2 children” rule.
   */
  encode: (input: FilterNode) => FilterNode;

  /**
   * Schema-aware validation of fields, operators, and operator/value arity.
   */
  validate: (input: FilterNode) => ValidationResult;

  /**
   * Build a single URL-safe querystring pair with the serialized target filter.
   */
  toQueryParam: (input: FilterNode, param?: string) => string;

  /**
   * Append the serialized target filter to a base URL (GET mode).
   */
  withFilterInUrl: (baseUrl: string, input: FilterNode, param?: string) => string;
}
