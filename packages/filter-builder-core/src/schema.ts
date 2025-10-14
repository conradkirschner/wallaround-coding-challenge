// src/schema.ts
import type { Schema, Field, OperatorDef, OperatorMap, OperatorKey, ValueType } from './types.js';
import { OPERATOR_CATALOG } from '@/operators';

/**
 * Construct a concrete, dataset-specific schema. If `operatorMap` is provided,
 * defaults are dropped and only the listed operators are considered (intersected with catalog support).
 * If `operatorMap` is omitted, sensible defaults per type are applied.
 */
export function createSchema(fields: ReadonlyArray<Field>, operatorMap?: OperatorMap): Schema {
  const defaults: Required<OperatorMap> = {
    string: ['eq', 'neq', 'contains', 'starts_with', 'ends_with'],
    number: ['eq', 'neq', 'gt', 'lt', 'between'],
    boolean: ['eq', 'neq'],
    date: ['eq', 'neq', 'before', 'after', 'between'],
  };

  // If a custom map is provided, drop defaults and treat missing entries as empty arrays (true narrowing).
  let source: Required<OperatorMap>;
  if (operatorMap === undefined) {
    source = defaults;
  } else {
    const {
      string = [],
      number = [],
      boolean = [],
      date = [],
    } = operatorMap;
    source = { string, number, boolean, date };
  }

  const entries = Object.entries(source) as Array<[ValueType, ReadonlyArray<OperatorKey>]>;

  const operators = new Map<OperatorKey, OperatorDef>();
  entries.forEach(([typeKey, keys]) => {
    for (const key of keys) {
      const base = OPERATOR_CATALOG[key];
      if (!base) continue; // ignore unknown operator keys
      if (!base.supportedTypes.includes(typeKey)) continue; // intersect with catalog support
      const existing = operators.get(base.key);
      const merged = existing
        ? Array.from(new Set([...existing.supportedTypes, typeKey]))
        : [typeKey];
      operators.set(base.key, { ...base, supportedTypes: merged });
    }
  });

  // Defensive: field keys must be unique to avoid ambiguous targeting.
  const unique = new Set(fields.map((f) => f.key));
  if (unique.size !== fields.length) throw new Error('Duplicate field keys are not allowed.');

  return { fields, operators: Array.from(operators.values()), operatorMap: source };
}

/** Locate a field descriptor by its key. */
export const findField = (schema: Schema, key: string) => schema.fields.find((f) => f.key === key);

/** Locate an operator descriptor by its canonical key. */
export const findOperator = (schema: Schema, key: string) =>
  schema.operators.find((o) => o.key === key);
