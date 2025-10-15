import type { Schema, Field, OperatorDef, FilterNode } from 'filter-builder-core';

/** Narrowed type for a leaf condition node. */
export type ConditionNode = Extract<
  FilterNode,
  { field: string; operator: string; value?: unknown }
>;

/** Normalize a value to match the operator’s valueArity. */
export function normalizeValueForArity(prev: unknown, arity: OperatorDef['valueArity']): unknown {
  switch (arity) {
    case 'none':
      return undefined;
    case 'one':
      return Array.isArray(prev) || prev == null ? '' : prev;
    case 'two':
      return Array.isArray(prev) && prev.length === 2 ? prev : ['', ''];
    case 'many':
      return Array.isArray(prev) ? prev : [];
  }
}

/** Find a field by key, or undefined if missing. */
export function findField(fields: ReadonlyArray<Field>, key: string): Field | undefined {
  return fields.find((f) => f.key === key);
}

/** Operators compatible with a given field type. */
export function getCompatibleOperators(
  operators: ReadonlyArray<OperatorDef>,
  fieldType: Field['type'],
): OperatorDef[] {
  return operators.filter((o) => o.supportedTypes.includes(fieldType));
}
