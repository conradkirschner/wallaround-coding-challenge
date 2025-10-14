import type { Schema, Field, OperatorDef, OperatorMap, OperatorKey, ValueType } from './types.js';
import { OPERATOR_CATALOG } from '@/operators';

/**
 * Construct a **concrete, dataset-specific schema** by merging caller-provided fields with
 * an operator capability map. This function is the single entry point for preparing the core
 * to reason about **which operators are available for which field types**.
 *
 * How operator capabilities are resolved:
 * - We start with **sensible defaults** per type
 * - The optional `operatorMap` lets consumers *narrow or expand* operators per type.
 * - We then derive a **deduplicated OperatorDef list** by:
 *    1) Looking up each operator in {@link OPERATOR_CATALOG} (authoritative metadata).
 *    2) Merging `supportedTypes` so that multiple types mapped to the same operator
 *       produce a single definition with a union of types.
 *
 * Guardrails:
 * - Field keys must be unique; duplicates throw immediately to avoid ambiguous UIs.
 *
 * Complexity:
 * - O(T + O) where T is total operator-map entries and O is number of unique operators.
 *
 * @param fields - Dataset fields (unique `key`, display `label`, and runtime `type`).
 * @param operatorMap - Optional override/extension of operators supported per ValueType.
 * @returns A normalized, runtime `Schema` used by validation and UI rendering.
 */
export function createSchema(fields: ReadonlyArray<Field>, operatorMap?: OperatorMap): Schema {
  // Baseline operator support per type
  const defaults: Required<OperatorMap> = {
    string: ['eq', 'neq', 'contains', 'starts_with', 'ends_with'],
    number: ['eq', 'neq', 'gt', 'lt', 'between'],
    boolean: ['eq', 'neq'],
    date: ['eq', 'neq', 'before', 'after', 'between'],
  };

  // Caller-provided map overrides/extends defaults; later code will deduplikate per operator.
  const resolved: Required<OperatorMap> = { ...defaults, ...operatorMap };

  const entries = Object.entries(resolved) as Array<
    [keyof Required<OperatorMap>, ReadonlyArray<OperatorKey>]
  >;

  // Build OperatorDef list by merging per-operator supported types.
  const operatorsArray = entries
    .flatMap(([typeKey, keys]) =>
      (keys ?? []).map((k: OperatorKey) => ({ key: k, type: typeKey as ValueType })),
    )
    .reduce<Map<OperatorKey, OperatorDef>>((acc, { key, type }) => {
      // Authoritative base descriptor (arity + baseline supportedTypes).
      const base = OPERATOR_CATALOG[key];

      // If we've already seen this operator, union its supported types; otherwise seed from base.
      const existing = acc.get(key);
      const merged = existing
        ? Array.from(new Set([...existing.supportedTypes, type]))
        : Array.from(new Set([...base.supportedTypes, type]));

      acc.set(key, { ...base, supportedTypes: merged });
      return acc;
    }, new Map())
    .values();

  // Defensive: field keys must be unique to avoid ambiguous targeting in conditions.
  const unique = new Set(fields.map((f) => f.key));
  if (unique.size !== fields.length) throw new Error('Duplicate field keys are not allowed.');

  return { fields, operators: Array.from(operatorsArray), operatorMap: resolved };
}

/**
 * Locate a field descriptor by its `key`.
 *
 * Intent:
 * - Centralized lookup used by validation and UI to discover field type/options.
 * - Returns `undefined` when not found; callers decide how to surface the issue.
 *
 * @param schema - The concrete schema produced by {@link createSchema}.
 * @param key - The field key to resolve.
 * @returns The matching `Field` or `undefined`.
 */
export const findField = (schema: Schema, key: string) => schema.fields.find((f) => f.key === key);

/**
 * Locate an operator descriptor by its `key`.
 *
 * Intent:
 * - Drive validation (type support, arity) and UI operator dropdowns without duplicating
 *   business logic. Operator semantics live in {@link OPERATOR_CATALOG}; this accessor
 *   simply exposes the **resolved** set for the current schema.
 *
 * @param schema - The concrete schema produced by {@link createSchema}.
 * @param key - Canonical operator key (e.g., `eq`, `between`, `is_null`).
 * @returns The matching `OperatorDef` or `undefined`.
 */
export const findOperator = (schema: Schema, key: string) =>
  schema.operators.find((o) => o.key === key);
