import * as React from 'react';
import type {
  Schema,
  FilterNode,
  ConditionNode,
  AndGroupNode,
  OrGroupNode,
} from 'filter-builder-core';
import { ConditionNodeEditor } from './ConditionNode';

export type GroupNode = AndGroupNode | OrGroupNode;

export type GroupNodeEditorProps = {
  node: GroupNode;
  schema: Schema;
  onChange: (next: GroupNode) => void;
  onRemove?: () => void;
};

function isCondition(n: FilterNode): n is ConditionNode {
  return 'field' in n && 'operator' in n;
}

// Produce a minimal valid condition using the first compatible operator for the first field.
// If the schema is malformed (no fields or no compatible operator), we throw early and loudly.
const firstCondition = (schema: Schema): ConditionNode => {
  if (schema.fields.length === 0) {
    throw new Error('Schema must include at least one field');
  }
  const f = schema.fields[0];
  const op = schema.operators.find((o) => o.supportedTypes.includes(f.type));
  if (!op) {
    throw new Error(`No operator available for field type '${f.type}'`);
  }
  return { field: f.key, operator: op.key };
};

export const GroupNodeEditor: React.FC<GroupNodeEditorProps> = ({
                                                                  node,
                                                                  schema,
                                                                  onChange,
                                                                  onRemove,
                                                                }) => {
  const isAnd = 'and' in node;
  const children: ReadonlyArray<FilterNode> = isAnd ? node.and : node.or;

  const updateAt = (idx: number, next: FilterNode) => {
    const newChildren = children.map((c, i) => (i === idx ? next : c));
    const nextGroup: GroupNode = isAnd ? { and: newChildren } : { or: newChildren };
    onChange(nextGroup);
  };

  const removeAt = (idx: number) => {
    const newChildren = children.filter((_, i) => i !== idx);
    const nextGroup: GroupNode = isAnd ? { and: newChildren } : { or: newChildren };
    onChange(nextGroup);
  };

  const addCondition = () => {
    const next = firstCondition(schema);
    const nextGroup: GroupNode = isAnd
        ? { and: [...children, next] }
        : { or: [...children, next] };
    onChange(nextGroup);
  };

  const addGroup = (kind: 'and' | 'or') => {
    const a = firstCondition(schema);
    const b = firstCondition(schema);
    const group: GroupNode = kind === 'and' ? { and: [a, b] } : { or: [a, b] };
    const nextGroup: GroupNode = isAnd
        ? { and: [...children, group] }
        : { or: [...children, group] };
    onChange(nextGroup);
  };

  const toggleKind = () => {
    const nextGroup: GroupNode = isAnd ? { or: children } : { and: children };
    onChange(nextGroup);
  };

  return (
      <div className="rounded-lg border border-gray-200 p-3 space-y-3 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-600">Group</span>
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
            {isAnd ? 'AND' : 'OR'}
          </span>
            <button
                type="button"
                onClick={toggleKind}
                className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                aria-label="Toggle group kind"
            >
              Toggle AND/OR
            </button>
          </div>
          {onRemove && (
              <button
                  type="button"
                  onClick={onRemove}
                  className="rounded-md border px-2 py-1 text-xs text-red-700 border-red-200 hover:bg-red-50"
                  aria-label="Remove group"
              >
                Remove
              </button>
          )}
        </div>

        <div className="space-y-2">
          {children.map((child, idx) =>
              isCondition(child) ? (
                  <ConditionNodeEditor
                      key={idx}
                      node={child}
                      schema={schema}
                      onChange={(n) => updateAt(idx, n)}
                      onRemove={() => removeAt(idx)}
                  />
              ) : (
                  <GroupNodeEditor
                      key={idx}
                      node={child as GroupNode}
                      schema={schema}
                      onChange={(n) => updateAt(idx, n)}
                      onRemove={() => removeAt(idx)}
                  />
              )
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
          <button
              type="button"
              onClick={addCondition}
              className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
              aria-label="Add condition"
          >
            + Condition
          </button>
          <button
              type="button"
              onClick={() => addGroup('and')}
              className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
              aria-label="Add AND group"
          >
            + AND group
          </button>
          <button
              type="button"
              onClick={() => addGroup('or')}
              className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
              aria-label="Add OR group"
          >
            + OR group
          </button>
        </div>
      </div>
  );
};
