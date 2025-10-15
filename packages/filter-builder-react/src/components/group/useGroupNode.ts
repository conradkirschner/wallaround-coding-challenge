import * as React from 'react';
import type { Schema, FilterNode } from 'filter-builder-core';
import {
    GroupKind,
    GroupNode,
    getKind,
    getChildren,
    makeGroup,
    firstCondition,
} from './helpers';

export type UseGroupNodeArgs = {
    node: GroupNode;
    schema: Schema;
    onChange: (next: GroupNode) => void;
};

export type UseGroupNodeResult = {
    kind: GroupKind;
    children: ReadonlyArray<FilterNode>;
    updateAt: (idx: number, next: FilterNode) => void;
    removeAt: (idx: number) => void;
    addCondition: () => void;
    addGroup: (k: GroupKind) => void;
    toggleKind: () => void;
};

export function useGroupNode({
                                 node,
                                 schema,
                                 onChange,
                             }: UseGroupNodeArgs): UseGroupNodeResult {
    const kind = React.useMemo(() => getKind(node), [node]);
    const children = React.useMemo(() => getChildren(node), [node]);

    const updateAt = React.useCallback(
        (idx: number, next: FilterNode) => {
            const nextChildren = children.map((c, i) => (i === idx ? next : c));
            onChange(makeGroup(kind, nextChildren));
        },
        [children, kind, onChange]
    );

    const removeAt = React.useCallback(
        (idx: number) => {
            const nextChildren = children.filter((_, i) => i !== idx);
            onChange(makeGroup(kind, nextChildren));
        },
        [children, kind, onChange]
    );

    const addCondition = React.useCallback(() => {
        const c = firstCondition(schema);
        onChange(makeGroup(kind, [...children, c]));
    }, [schema, kind, children, onChange]);

    const addGroup = React.useCallback(
        (k: GroupKind) => {
            const a = firstCondition(schema);
            const b = firstCondition(schema);
            const nested: GroupNode = k === 'and' ? { and: [a, b] } : { or: [a, b] };
            onChange(makeGroup(kind, [...children, nested]));
        },
        [schema, kind, children, onChange]
    );

    const toggleKind = React.useCallback(() => {
        onChange(makeGroup(kind === 'and' ? 'or' : 'and', children));
    }, [children, kind, onChange]);

    return { kind, children, updateAt, removeAt, addCondition, addGroup, toggleKind };
}
