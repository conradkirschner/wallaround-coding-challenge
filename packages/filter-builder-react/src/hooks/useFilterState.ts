import { useCallback, useMemo, useState } from 'react';
import type { FilterNode } from 'filter-builder-core';


/**
 * A path describes how to reach a node from the root by walking indices inside group arrays.
 * Each step knows whether the current group is an AND or OR.
 */
export type NodePath = ReadonlyArray<{ kind: 'and' | 'or'; index: number }>;

function setAt(root: FilterNode, path: NodePath, next: FilterNode): FilterNode {
  if (path.length === 0) return next;
  const [head, ...tail] = path;
  if ('field' in root) throw new Error('Cannot descend into a condition');
  const arr = ('and' in root ? root.and : root.or).slice();
  arr[head.index] = setAt(arr[head.index], tail, next);
  return 'and' in root ? { and: arr } : { or: arr };
}

function removeAt(root: FilterNode, path: NodePath): FilterNode {
  if (path.length === 0) {
    return { field: '', operator: 'eq', value: '' };
  }
  if ('field' in root) throw new Error('Cannot descend into a condition');
  const [head, ...tail] = path;
  const arr = ('and' in root ? root.and : root.or).slice();
  if (tail.length === 0) {
    arr.splice(head.index, 1);
  } else {
    arr[head.index] = removeAt(arr[head.index], tail);
  }
  return 'and' in root ? { and: arr } : { or: arr };
}

export interface UseFilterState {
  node: FilterNode;
  setNode: (n: FilterNode) => void;
  replaceAt: (path: NodePath, next: FilterNode) => void;
  removeAt: (path: NodePath) => void;
  appendTo: (path: NodePath | null, kind: 'and' | 'or', child: FilterNode) => void;
}

export function useFilterState(initial: FilterNode): UseFilterState {
  const [node, setNode] = useState<FilterNode>(initial);

  const replaceAtCb = useCallback((path: NodePath, next: FilterNode) => {
    setNode(prev => setAt(prev, path, next));
  }, []);

  const removeAtCb = useCallback((path: NodePath) => {
    setNode(prev => removeAt(prev, path));
  }, []);

  const appendTo = useCallback((path: NodePath | null, kind: 'and' | 'or', child: FilterNode) => {
    setNode(prev => {
      if (!path) {
        return kind === 'and' ? { and: [prev, child] } : { or: [prev, child] };
      }
      // Walk to parent
      const walker = (root: FilterNode, p: NodePath): FilterNode => {
        if (p.length === 0) {
          if ('field' in root) {
            return kind === 'and' ? { and: [root, child] } : { or: [root, child] };
          }
          const isAnd = 'and' in root;
          const arr = (isAnd ? root.and : root.or).slice();
          arr.push(child);
          return isAnd ? { and: arr } : { or: arr };
        }
        if ('field' in root) throw new Error('Cannot descend into a condition');
        const [head, ...tail] = p;
        const isAnd = 'and' in root;
        const arr = (isAnd ? root.and : root.or).slice();
        arr[head.index] = walker(arr[head.index], tail);
        return isAnd ? { and: arr } : { or: arr };
      };
      return walker(prev, path);
    });
  }, []);

  return useMemo(() => ({
    node,
    setNode,
    replaceAt: replaceAtCb,
    removeAt: removeAtCb,
    appendTo
  }), [node, replaceAtCb, removeAtCb, appendTo]);
}
