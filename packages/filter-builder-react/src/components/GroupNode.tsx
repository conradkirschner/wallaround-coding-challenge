import * as React from 'react';
import type { Schema, FilterNode } from 'filter-builder-core';
import { ConditionNodeEditor } from './ConditionNode';
import type { GroupNode } from './group';
import { GroupActions, GroupFrame, GroupToolbar, isCondition, useGroupNode } from './group';

export type GroupNodeEditorProps = {
  node: GroupNode;
  schema: Schema;
  onChange: (next: GroupNode) => void;
  onRemove?: () => void;
  className?: string;
  /** Optional test id suffix if you render multiple instances */
  testId?: string;
};

export const GroupNodeEditor: React.FC<GroupNodeEditorProps> = React.memo(function GroupNodeEditor({
  node,
  schema,
  onChange,
  onRemove,
  className,
  testId = 'group',
}) {
  const groupId = React.useId();
  const labelId = `${groupId}-label`;

  const { kind, children, updateAt, removeAt, addCondition, addGroup, toggleKind } = useGroupNode({
    node,
    schema,
    onChange,
  });

  const childrenList = (
    <ul className="space-y-2" role="list" data-test-id={`${testId}-children`}>
      {children.map((child: FilterNode, idx: number) => {
        const itemId = `${testId}-child-${idx}`;
        return (
          <li key={itemId} role="listitem" data-test-id={itemId}>
            {isCondition(child) ? (
              <ConditionNodeEditor
                node={child}
                schema={schema}
                onChange={(n) => updateAt(idx, n)}
                onRemove={() => removeAt(idx)}
              />
            ) : (
              <GroupNodeEditor
                node={child as GroupNode}
                schema={schema}
                onChange={(n) => updateAt(idx, n)}
                onRemove={() => removeAt(idx)}
                testId={`${itemId}-group`}
              />
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <GroupFrame
      groupLabelId={labelId}
      className={className}
      testId={`${testId}-frame`}
      header={
        <GroupToolbar
          kind={kind}
          labelId={labelId}
          onToggleKind={toggleKind}
          onRemove={onRemove}
          testId={`${testId}-toolbar`}
        />
      }
      childrenList={childrenList}
      footer={
        <GroupActions
          onAddCondition={addCondition}
          onAddAndGroup={() => addGroup('and')}
          onAddOrGroup={() => addGroup('or')}
          testId={`${testId}-actions`}
        />
      }
    />
  );
});
