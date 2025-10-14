import * as React from 'react';
import type { FilterNode, Schema } from 'filter-builder-core';
import { ConditionRow } from './parts/ConditionRow';
import { GroupEditor } from './parts/GroupEditor';
import { isCondition, isAndGroup } from 'filter-builder-core/guards';

export function NodeEditor({ schema, node, onChange }: { schema: Schema; node: FilterNode; onChange: (n: FilterNode) => void }) {
  if (isCondition(node)) return <ConditionRow schema={schema} node={node} onChange={onChange} />;
  if (isAndGroup(node)) return <GroupEditor op="and" schema={schema} nodes={node.and} onChange={(nodes) => onChange({ and: nodes })} />;
  return <GroupEditor op="or" schema={schema} nodes={node.or} onChange={(nodes) => onChange({ or: nodes })} />;
}
