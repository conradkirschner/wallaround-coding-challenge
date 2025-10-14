import * as React from 'react';
import type { FilterNode, Schema } from 'filter-builder-core';
import { NodeEditor } from '../NodeEditor';

/** AND/OR group editor; group exists only if nodes.length >= 2. */
export function GroupEditor({ op, schema, nodes, onChange }:
  { op: 'and'|'or'; schema: Schema; nodes: ReadonlyArray<FilterNode>; onChange: (nodes: ReadonlyArray<FilterNode>) => void }) {

  const addCondition = () => onChange([...nodes, { field: '', operator: 'eq', value: '' }]);
  const addGroup = () => onChange([...nodes, { and: [{ field: '', operator: 'eq', value: '' }, { field: '', operator: 'eq', value: '' }] }]);
  const updateAt = (index: number, child: FilterNode) => onChange(nodes.map((n, i) => i === index ? child : n));
  const removeAt = (index: number) => onChange(nodes.filter((_, i) => i !== index));

  return (
    <fieldset className="fb-group">
      <legend className="fb-legend">{op.toUpperCase()}</legend>
      <div className="fb-children">
        {nodes.map((n, i) => (
          <div key={i} className="fb-child">
            <NodeEditor schema={schema} node={n} onChange={(c) => updateAt(i, c)} />
            <button type="button" className="fb-btn danger" aria-label={`Remove child ${i + 1}`} onClick={() => removeAt(i)}>Remove</button>
          </div>
        ))}
      </div>
      <div className="fb-actions">
        <button type="button" className="fb-btn" onClick={addCondition} aria-label="Add condition">+ Condition</button>
        <button type="button" className="fb-btn" onClick={addGroup} aria-label="Add group">+ Group</button>
      </div>
    </fieldset>
  );
}
