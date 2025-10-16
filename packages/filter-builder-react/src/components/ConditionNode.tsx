import * as React from 'react';
import type { Schema } from 'filter-builder-core';
import { ValueEditor } from './ValueEditor';
import { ConditionFrame } from './condition/ConditionFrame';
import { ConditionToolbar } from './condition/ConditionToolbar';
import { FieldSelect } from './condition/FieldSelect';
import { OperatorSelect } from './condition/OperatorSelect';
import { useConditionNode } from './condition/useConditionNode';
import type { ConditionNode } from './condition/helpers';

export type ConditionNodeEditorProps = {
  node: ConditionNode;
  schema: Schema;
  onChange: (next: ConditionNode) => void;
  onRemove?: () => void;
  className?: string;
  testId?: string;
};

export const ConditionNodeEditor: React.FC<ConditionNodeEditorProps> = React.memo(
  function ConditionNodeEditor({
    node,
    schema,
    onChange,
    onRemove,
    className,
    testId = 'condition',
  }) {
    const id = React.useId();

    const {
      fields,
      effectiveField,
      compatibleOps,
      currentOp,
      hasNoFields,
      hasNoCompatibleOps,
      onFieldChange,
      onOperatorChange,
      onValueChange,
    } = useConditionNode({ node, schema, onChange });

    // Guard: no fields configured
    if (hasNoFields) {
      return (
        <div
          className="rounded-md border p-3 bg-amber-50 text-amber-900 text-xs"
          role="status"
          aria-live="polite"
          data-test-id={`${testId}-no-fields`}
        >
          No fields configured in schema.
        </div>
      );
    }

    // Guard: no compatible operators for current field
    if (hasNoCompatibleOps || !effectiveField || !currentOp) {
      return (
        <ConditionFrame
          className={className}
          testId={`${testId}-guard`}
          header={<ConditionToolbar onRemove={onRemove} testId={`${testId}-toolbar`} />}
        >
          <div
            className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2"
            role="status"
            aria-live="polite"
            data-test-id={`${testId}-no-operators`}
          >
            No operators available for type “{effectiveField?.type ?? 'unknown'}”. Adjust your
            operator map.
          </div>
        </ConditionFrame>
      );
    }

    // Safe: effectiveField and currentOp are defined here
    return (
      <ConditionFrame
        className={className}
        testId={`${testId}-frame`}
        header={<ConditionToolbar onRemove={onRemove} testId={`${testId}-toolbar`} />}
      >
        <div className="flex flex-wrap items-center gap-2" data-test-id={`${testId}-controls`}>
          <FieldSelect
            id={`${id}-field`}
            fields={fields}
            value={effectiveField.key}
            onChange={onFieldChange}
            testId={`${testId}-field`}
          />
          <OperatorSelect
            id={`${id}-operator`}
            operators={compatibleOps}
            value={currentOp.key}
            onChange={onOperatorChange}
            testId={`${testId}-operator`}
          />
          <ValueEditor
            id={`${id}-value`}
            schema={schema}
            field={effectiveField}
            operator={currentOp}
            value={node.value}
            onChange={onValueChange}
          />
        </div>
      </ConditionFrame>
    );
  },
);
