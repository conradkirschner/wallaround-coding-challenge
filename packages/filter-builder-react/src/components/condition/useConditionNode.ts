import * as React from 'react';
import type { Schema, Field, OperatorDef } from 'filter-builder-core';
import { findField, getCompatibleOperators, normalizeValueForArity } from './helpers';
import type { ConditionNode } from './helpers';

export type UseConditionNodeArgs = {
  node: ConditionNode;
  schema: Schema;
  onChange: (next: ConditionNode) => void;
};

export type UseConditionNodeResult = {
  fields: ReadonlyArray<Field>;
  effectiveField: Field | null;
  compatibleOps: ReadonlyArray<OperatorDef>;
  currentOp: OperatorDef | null;
  hasNoFields: boolean;
  hasNoCompatibleOps: boolean;
  onFieldChange: (fieldKey: string) => void;
  onOperatorChange: (opKey: string) => void;
  onValueChange: (nextVal: unknown) => void;
};

// Helper: tell TS this array is non-empty (throws otherwise)
function requireFirst<T>(arr: readonly T[]): T {
  if (arr.length === 0) throw new Error('Expected non-empty array');
  return arr[0]!;
}

export function useConditionNode({
  node,
  schema,
  onChange,
}: UseConditionNodeArgs): UseConditionNodeResult {
  const fields = schema.fields;
  const hasNoFields = fields.length === 0;

  const resolvedField = React.useMemo(() => {
    if (hasNoFields) return null;
    return findField(fields, node.field) ?? requireFirst(fields);
  }, [fields, node.field, hasNoFields]);

  const compatibleOps = React.useMemo(() => {
    if (!resolvedField) return [];
    return getCompatibleOperators(schema.operators, resolvedField.type);
  }, [schema.operators, resolvedField]);

  const hasNoCompatibleOps = !hasNoFields && compatibleOps.length === 0;

  const currentOp = React.useMemo(() => {
    if (!resolvedField || compatibleOps.length === 0) return null;
    return compatibleOps.find((o) => o.key === node.operator) ?? requireFirst(compatibleOps);
  }, [resolvedField, compatibleOps, node.operator]);

  React.useEffect(() => {
    if (!resolvedField || !currentOp) return;
    if (node.field !== resolvedField.key || node.operator !== currentOp.key) {
      onChange({
        field: resolvedField.key,
        operator: currentOp.key,
        value: normalizeValueForArity(node.value, currentOp.valueArity),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedField?.key, currentOp?.key]);

  const onFieldChange = React.useCallback(
    (fieldKey: string) => {
      if (hasNoFields) return;

      const nextField = findField(fields, fieldKey) ?? requireFirst(fields);
      const nextOps = getCompatibleOperators(schema.operators, nextField.type);
      if (nextOps.length === 0) return; // nothing compatible; leave as-is

      const nextOp = requireFirst(nextOps);
      onChange({
        field: nextField.key,
        operator: nextOp.key,
        value: normalizeValueForArity(undefined, nextOp.valueArity),
      });
    },
    [fields, schema.operators, hasNoFields, onChange],
  );

  const onOperatorChange = React.useCallback(
    (opKey: string) => {
      if (!resolvedField || !currentOp) return;
      const nextOp = compatibleOps.find((o) => o.key === opKey) ?? currentOp;
      onChange({
        field: resolvedField.key,
        operator: nextOp.key,
        value: normalizeValueForArity(node.value, nextOp.valueArity),
      });
    },
    [compatibleOps, currentOp, node.value, onChange, resolvedField],
  );

  const onValueChange = React.useCallback(
    (nextVal: unknown) => {
      if (!resolvedField || !currentOp) return;
      onChange({
        field: resolvedField.key,
        operator: currentOp.key,
        value: nextVal,
      });
    },
    [currentOp, onChange, resolvedField],
  );

  return {
    fields,
    effectiveField: resolvedField,
    compatibleOps,
    currentOp,
    hasNoFields,
    hasNoCompatibleOps,
    onFieldChange,
    onOperatorChange,
    onValueChange,
  };
}
