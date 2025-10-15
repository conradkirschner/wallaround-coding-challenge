import type { Schema, FilterNode, Field } from 'filter-builder-core';
import { InvalidSchemaOperationError } from './errors';

type ConditionNode = Extract<FilterNode, { field: string; operator: string; value?: unknown }>;
type Scalar = string | number | boolean | Date | null | undefined;

/** Coerce a runtime value to the field’s declared ValueType (or return undefined if impossible). */
function coerceToType(value: unknown, type: 'string' | 'number' | 'boolean' | 'date'): Scalar {
  switch (type) {
    case 'string':
      return value == null ? (value as null | undefined) : String(value);
    case 'number': {
      if (typeof value === 'number' && Number.isFinite(value)) return value;
      if (typeof value === 'string' && value.trim() !== '') {
        const n = Number(value);
        return Number.isFinite(n) ? n : undefined;
      }
      return undefined;
    }
    case 'boolean': {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        const s = value.trim().toLowerCase();
        if (s === 'true') return true;
        if (s === 'false') return false;
      }
      return undefined;
    }
    case 'date': {
      if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
      if (typeof value === 'string') {
        const d = new Date(value);
        return Number.isNaN(d.getTime()) ? undefined : d;
      }
      return undefined;
    }
  }
}

const isNullishish = (v: Scalar) => v === undefined || v === null || v === '';
const cmpNumber = (a: number, b: number) => (a === b ? 0 : a < b ? -1 : 1);
const cmpDate = (a: Date, b: Date) =>
  a.getTime() === b.getTime() ? 0 : a.getTime() < b.getTime() ? -1 : 1;

/** Evaluate a single condition against a row using the schema to coerce types. */
function evaluateCondition(
  schema: Schema,
  row: Record<string, unknown>,
  c: ConditionNode,
): boolean {
  const field = schema.fields.find((f: Field) => f.key === c.field);
  if (!field) return false;

  const left = coerceToType(row[c.field], field.type);

  if (c.operator === 'is_null') return isNullishish(left);
  if (c.operator === 'is_not_null') return !isNullishish(left);
  if (left == null) return false;

  const rhs = (c as { value?: unknown }).value;

  switch (c.operator) {
    case 'eq': {
      const right = coerceToType(rhs, field.type);
      return left === right;
    }
    case 'neq': {
      const right = coerceToType(rhs, field.type);
      return left !== right;
    }
    case 'gt': {
      if (field.type === 'number') {
        const r = coerceToType(rhs, 'number');
        return typeof left === 'number' && typeof r === 'number' && cmpNumber(left, r) > 0;
      }
      if (field.type === 'date') {
        const r = coerceToType(rhs, 'date');
        return left instanceof Date && r instanceof Date && cmpDate(left, r) > 0;
      }
      return false;
    }
    case 'lt': {
      if (field.type === 'number') {
        const r = coerceToType(rhs, 'number');
        return typeof left === 'number' && typeof r === 'number' && cmpNumber(left, r) < 0;
      }
      if (field.type === 'date') {
        const r = coerceToType(rhs, 'date');
        return left instanceof Date && r instanceof Date && cmpDate(left, r) < 0;
      }
      return false;
    }
    case 'contains':
    case 'starts_with':
    case 'ends_with': {
      const L = coerceToType(left, 'string');
      const R = coerceToType(rhs, 'string');
      if (typeof L !== 'string' || typeof R !== 'string') return false;
      if (c.operator === 'contains') return L.includes(R);
      if (c.operator === 'starts_with') return L.startsWith(R);
      return L.endsWith(R);
    }
    case 'in': {
      const arr = rhs;
      if (!Array.isArray(arr)) return false;
      const coerced = arr
        .map((v) => coerceToType(v, field.type))
        .filter((v): v is Exclude<Scalar, undefined> => v !== undefined);
      return coerced.some((v) => v === left);
    }
    case 'between': {
      const arr = rhs;
      if (!Array.isArray(arr) || arr.length !== 2) return false;

      if (field.type === 'number') {
        const a = coerceToType(arr[0], 'number');
        const b = coerceToType(arr[1], 'number');
        if (typeof left !== 'number' || typeof a !== 'number' || typeof b !== 'number')
          return false;
        const lo = Math.min(a, b);
        const hi = Math.max(a, b);
        return left >= lo && left <= hi;
      }

      if (field.type === 'date') {
        const a = coerceToType(arr[0], 'date');
        const b = coerceToType(arr[1], 'date');
        if (!(left instanceof Date) || !(a instanceof Date) || !(b instanceof Date)) return false;
        const lo = cmpDate(a, b) <= 0 ? a : b;
        const hi = lo === a ? b : a;
        return cmpDate(left, lo) >= 0 && cmpDate(left, hi) <= 0;
      }
      return false;
    }
    case 'before': {
      const r = coerceToType(rhs, 'date');
      return left instanceof Date && r instanceof Date && cmpDate(left, r) < 0;
    }
    case 'after': {
      const r = coerceToType(rhs, 'date');
      return left instanceof Date && r instanceof Date && cmpDate(left, r) > 0;
    }
    default:
      // Make invalid/unknown ops very explicit for the app to catch and show nicely.
      throw new InvalidSchemaOperationError(
        c.operator,
        `Unknown or unsupported operator '${c.operator}' at field '${c.field}'`,
      );
  }
}

/** Recursively evaluate a filter tree (canonical) against a row. */
export function evaluateRow(
  schema: Schema,
  node: FilterNode,
  row: Record<string, unknown>,
): boolean {
  if ('field' in node) return evaluateCondition(schema, row, node);
  if ('and' in node) return node.and.every((n: FilterNode) => evaluateRow(schema, n, row));
  return node.or.some((n: FilterNode) => evaluateRow(schema, n, row));
}

/** Convenience: filter an array of rows. */
export function filterRows<T extends Record<string, unknown>>(
  schema: Schema,
  node: FilterNode,
  rows: ReadonlyArray<T>,
): T[] {
  return rows.filter((r) => evaluateRow(schema, node, r));
}
