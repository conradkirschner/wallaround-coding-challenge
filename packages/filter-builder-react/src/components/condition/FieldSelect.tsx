import * as React from 'react';
import type { Field } from 'filter-builder-core';

export type FieldSelectProps = {
  id: string;
  fields: ReadonlyArray<Field>;
  value: string;
  onChange: (fieldKey: string) => void;
  testId?: string;
};

export const FieldSelect: React.FC<FieldSelectProps> = ({
  id,
  fields,
  value,
  onChange,
  testId = 'field-select',
}) => {
  return (
    <div data-test-id={testId}>
      <label htmlFor={id} className="sr-only">
        Field
      </label>
      <select
        id={id}
        className="rounded-md border px-2 py-1 text-sm bg-white min-w-[10rem]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Field"
      >
        {fields.map((f) => (
          <option key={f.key} value={f.key}>
            {f.label}
          </option>
        ))}
      </select>
    </div>
  );
};
