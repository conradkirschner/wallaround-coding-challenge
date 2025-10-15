import * as React from 'react';
import type { Schema, Field, OperatorDef } from 'filter-builder-core';
import type { PartialRegistryMap } from './value/types';
import { useValueEditor } from './value/useValueEditor';
import { NoValuePill, OneValue, TwoValue, ManyValue } from './value/ui';

export type ValueEditorProps = {
  id?: string;
  schema: Schema; // not used directly today, kept for future-proofing/custom inputs
  field: Field;
  operator: OperatorDef;
  value: unknown;
  onChange: (next: unknown) => void;
  inputs?: PartialRegistryMap; // Partial<ValueInputRegistry>
  className?: string;
  testId?: string;
};

export const ValueEditor: React.FC<ValueEditorProps> = React.memo(function ValueEditor({
  id,
  field,
  operator,
  value,
  onChange,
  inputs,
  className,
  testId = 'value-editor',
}) {
  const model = useValueEditor({ id, field, operator, value, onChange, inputs, schema: undefined });

  if (model.arity === 'none') {
    return <NoValuePill testId={`${testId}-none`} />;
  }

  return (
    <div className={className} data-test-id={testId}>
      {model.arity === 'one' && <OneValue h={model.handlers} testId={`${testId}-one`} />}
      {model.arity === 'two' && <TwoValue h={model.handlers} testId={`${testId}-two`} />}
      {model.arity === 'many' && <ManyValue h={model.handlers} testId={`${testId}-many`} />}
    </div>
  );
});
