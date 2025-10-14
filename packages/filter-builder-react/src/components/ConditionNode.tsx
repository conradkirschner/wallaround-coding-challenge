import * as React from 'react';
import type { Schema, Field, OperatorDef, FilterNode } from 'filter-builder-core';
import { ValueEditor } from './ValueEditor';

export type ConditionNodeEditorProps = {
  node: Extract<FilterNode, { field: string; operator: string; value?: unknown }>;
  schema: Schema;
  onChange: (next: Extract<FilterNode, { field: string; operator: string; value?: unknown }>) => void;
  onRemove: () => void;
};

const byType = (schema: Schema, type: Field['type']): OperatorDef[] =>
  schema.operators.filter((op) => op.supportedTypes.includes(type));

export const ConditionNodeEditor: React.FC<ConditionNodeEditorProps> = ({ node, schema, onChange, onRemove }) => {
  const fields = schema.fields;
  const field = fields.find((f) => f.key === node.field) ?? fields[0];
  const ops = byType(schema, field.type);

  const onField = (key: string) => {
    const nextField = fields.find((f) => f.key === key) ?? field;
    const nextOps = byType(schema, nextField.type);
    const nextOp = nextOps[0];
    onChange({ field: nextField.key, operator: nextOp.key, value: undefined });
  };
  const onOperator = (key: string) => {
    onChange({ ...node, operator: key });
  };
  const onValue = (v: unknown) => {
    onChange({ ...node, value: v });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_2fr_auto] items-center gap-2">
      <select
        aria-label="Field"
        className="rounded-md border border-gray-300 px-2 py-1 text-sm bg-white"
        value={field.key}
        onChange={(e) => onField(e.target.value)}
      >
        {fields.map((f) => (
          <option key={f.key} value={f.key}>{f.label}</option>
        ))}
      </select>

      <select
        aria-label="Operator"
        className="rounded-md border border-gray-300 px-2 py-1 text-sm bg-white"
        value={node.operator}
        onChange={(e) => onOperator(e.target.value)}
      >
        {ops.map((op) => (
          <option key={op.key} value={op.key}>{op.label}</option>
        ))}
      </select>

      <ValueEditor
        schema={schema}
        field={field}
        operator={ops.find((o) => o.key === node.operator) ?? ops[0]}
        value={(node as any).value}
        onChange={onValue}
      />

      <button
        type="button"
        onClick={onRemove}
        className="justify-self-start sm:justify-self-end rounded-md border px-2 py-1 text-xs text-red-700 border-red-200 hover:bg-red-50"
        aria-label="Remove condition"
      >
        Remove
      </button>
    </div>
  );
};
