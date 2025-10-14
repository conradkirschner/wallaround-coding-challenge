import * as React from 'react';
import type { FilterNode, Schema, ValidationResult } from 'filter-builder-core';
import { createFilterApi } from 'filter-builder-core';
import { GroupNodeEditor } from './GroupNode';

export type FilterBuilderProps = {
  schema: Schema;
  value: FilterNode;
  onChange: (next: FilterNode) => void;
  onValidate?: (result: ValidationResult) => void;
  className?: string;
};

export const FilterBuilder: React.FC<FilterBuilderProps> = ({ schema, value, onChange, onValidate, className }) => {
  const api = React.useMemo(() => createFilterApi(schema), [schema]);

  const handleChange = (next: FilterNode) => {
    onChange(next);
    if (onValidate) onValidate(api.validate(next));
  };

  return (
    <div className={className}>
      {'and' in value || 'or' in value ? (
        <GroupNodeEditor
          node={value as any}
          schema={schema}
          onChange={handleChange as any}
        />
      ) : (
        // seed a group if only a solitary condition is passed
        <GroupNodeEditor
          node={{ and: [value] }}
          schema={schema}
          onChange={handleChange as any}
        />
      )}
    </div>
  );
};
