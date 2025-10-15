import * as React from 'react';
import type { OperatorDef } from 'filter-builder-core';

export type OperatorSelectProps = {
  id: string;
  operators: ReadonlyArray<OperatorDef>;
  value: string; // operator key
  onChange: (opKey: string) => void;
  testId?: string;
};

export const OperatorSelect: React.FC<OperatorSelectProps> = ({
  id,
  operators,
  value,
  onChange,
  testId = 'operator-select',
}) => {
  return (
    <div data-test-id={testId}>
      <label htmlFor={id} className="sr-only">
        Operator
      </label>
      <select
        id={id}
        className="rounded-md border px-2 py-1 text-sm bg-white min-w-[10rem]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Operator"
      >
        {operators.map((o) => (
          <option key={o.key} value={o.key}>
            {o.label ?? o.key}
          </option>
        ))}
      </select>
    </div>
  );
};
