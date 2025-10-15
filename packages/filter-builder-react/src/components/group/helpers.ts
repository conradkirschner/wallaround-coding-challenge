import type {
    Schema,
    FilterNode,
    ConditionNode,
    OperatorDef,
    AndGroupNode,
    OrGroupNode,
} from 'filter-builder-core';
import { NoOperationError } from '../../errors';

/** Narrow type for group kind. */
export type GroupKind = 'and' | 'or';

/** Public union for group nodes (re-exported for convenience). */
export type GroupNode = AndGroupNode | OrGroupNode;

/** Type guard: is a leaf condition node. */
export const isCondition = (n: FilterNode): n is ConditionNode =>
    'field' in n && 'operator' in n;

/** Group discriminators. */
export const getKind = (node: GroupNode): GroupKind =>
    'and' in node ? 'and' : 'or';

export const getChildren = (node: GroupNode): ReadonlyArray<FilterNode> =>
    'and' in node ? node.and : node.or;

export const makeGroup = (
    kind: GroupKind,
    children: ReadonlyArray<FilterNode>
): GroupNode => (kind === 'and' ? { and: [...children] } : { or: [...children] });

/**
 * Produce a minimal valid condition using the FIRST field that has at least one compatible operator.
 * Throws a NoOperationError if none exist.
 */
export function firstCondition(schema: Schema): ConditionNode {
    if (schema.fields.length === 0) {
        throw new Error('Schema must include at least one field.');
    }
    for (const f of schema.fields) {
        const op: OperatorDef | undefined = schema.operators.find((o) =>
            o.supportedTypes.includes(f.type)
        );
        if (op) return { field: f.key, operator: op.key };
    }
    // If we reach here, no operator supports any field type
    throw new NoOperationError(schema.fields);
}
