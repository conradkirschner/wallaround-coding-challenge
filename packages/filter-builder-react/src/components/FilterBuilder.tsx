import * as React from 'react';
import type { FilterNode } from 'filter-builder-core';
import type { FilterBuilderProps, EmitPayload } from '../publicTypes';
import { NodeEditor } from './NodeEditor';

const EMPTY: FilterNode = { field: '', operator: 'eq', value: '' };

export function FilterBuilder(props: FilterBuilderProps) {
  const { core } = props;
  const [node, setNode] = React.useState<FilterNode>(() => props.initialFilter ? core.decode(props.initialFilter) : EMPTY);

  const emit = React.useCallback((current: FilterNode) => {
    const target = core.encode(current);
    const queryParam = props.transport?.queryParam ?? 'filter';
    const queryString = core.toQueryParam(target, queryParam);
    const method = props.transport?.mode === 'post' ? 'POST' : 'GET';
    const payload: EmitPayload = { target, queryString, method };
    payload.url = method === 'GET' ? core.withFilterInUrl(props.transport?.baseUrl ?? '/search', target, queryParam) : '/search';
    if (method === 'POST') payload.body = target;
    props.onEmit?.(payload);
  }, [props, core]);

  React.useEffect(() => { emit(node); }, [node, emit]);

  return (
    <div role="region" aria-label={props['aria-label'] ?? 'Filter builder'}>
      <NodeEditor schema={core.schema} node={node} onChange={setNode} />
    </div>
  );
}
