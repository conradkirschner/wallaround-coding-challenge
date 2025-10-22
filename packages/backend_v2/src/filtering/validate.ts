// src/filtering/validate.ts
import type { FilterInput, FilterNode, ConditionNode, Primitive } from './ast';
import type { FilterableMap, FieldType } from './filterable';
import { FilterError } from './errors';
import { mergeLimits, type FilterLimits } from './limits';

type Op = string;

function isObject(v: unknown): v is Record<string, unknown> {
    return !!v && typeof v === 'object' && !Array.isArray(v);
}

function isGroup(n: unknown): n is { and: readonly FilterNode[] } | { or: readonly FilterNode[] } {
    return isObject(n) && (Array.isArray((n as any).and) || Array.isArray((n as any).or));
}

function isCondition(n: unknown): n is ConditionNode {
    return isObject(n) && typeof (n as any).field === 'string' && typeof (n as any).op === 'string';
}

function rootOf(path: string): string {
    const i = path.indexOf('.');
    return i === -1 ? path : path.slice(0, i);
}

function isDateLike(v: unknown): v is string | Date {
    return v instanceof Date || (typeof v === 'string' && !Number.isNaN(Date.parse(v)));
}

function typeOk(expected: FieldType, value: Primitive): boolean {
    switch (expected) {
        case 'string': return typeof value === 'string';
        case 'number': return typeof value === 'number' && Number.isFinite(value);
        case 'boolean': return typeof value === 'boolean';
        case 'date': return isDateLike(value);
        case 'enum': return typeof value === 'string';
        case 'uuid': return typeof value === 'string'; // format validated by db/driver
        default: return true;
    }
}

function assertEnumValue(enumValues: readonly string[] | undefined, v: unknown, field: string) {
    if (!enumValues) return;
    if (typeof v !== 'string' || !enumValues.includes(v)) {
        throw new FilterError('FILTER_VALUE_INVALID', `Invalid enum value for ${field}`, { field, value: v, enumValues });
    }
}

function assertEnumArray(enumValues: readonly string[] | undefined, arr: unknown[], field: string, maxInSize: number) {
    if (!Array.isArray(arr)) {
        throw new FilterError('FILTER_VALUE_INVALID', `Invalid 'in' value for ${field}`, { field, value: arr });
    }
    if (arr.length > maxInSize) {
        throw new FilterError('FILTER_COMPLEXITY_EXCEEDED', `'in' list too large`, { field, size: arr.length, maxInSize });
    }
    if (!enumValues) return;
    for (const v of arr) {
        if (typeof v !== 'string' || !enumValues.includes(v)) {
            throw new FilterError('FILTER_VALUE_INVALID', `Invalid enum value for ${field}`, { field, value: v, enumValues });
        }
    }
}

function assertValueForOp(
    fieldType: FieldType,
    enumValues: readonly string[] | undefined,
    op: Op,
    v: unknown,
    maxInSize: number,
    field: string,
) {
    const bad = () =>
        new FilterError('FILTER_VALUE_INVALID', `Invalid value for ${field} ${op}`, { field, op, value: v });

    // nullary ops
    if (op === 'is_null' || op === 'is_not_null') {
        if (v !== undefined) throw bad();
        return;
    }

    // between
    if (op === 'between') {
        if (!Array.isArray(v) || v.length !== 2) throw bad();
        const [a, b] = v as [Primitive, Primitive];
        if (!typeOk(fieldType, a) || !typeOk(fieldType, b)) throw bad();
        if (fieldType === 'enum') throw bad(); // semantically nonsensical
        return;
    }

    // in
    if (op === 'in') {
        if (!Array.isArray(v)) throw bad();
        if ((v as unknown[]).length > maxInSize) {
            throw new FilterError('FILTER_COMPLEXITY_EXCEEDED', `'in' list too large`, { field, size: (v as unknown[]).length, maxInSize });
        }
        for (const item of v as Primitive[]) if (!typeOk(fieldType, item)) throw bad();
        if (fieldType === 'enum') assertEnumArray(enumValues, v as unknown[], field, maxInSize);
        return;
    }

    // string-like ops must have strings and string-capable field types
    if (op === 'contains' || op === 'starts_with' || op === 'ends_with') {
        if (typeof v !== 'string') throw bad();
        if (fieldType !== 'string' && fieldType !== 'enum' && fieldType !== 'uuid') throw bad();
        return;
    }

    // unary comparisons
    if (!typeOk(fieldType, v as Primitive)) throw bad();
    if (fieldType === 'enum' && (op === 'eq' || op === 'neq')) {
        assertEnumValue(enumValues, v, field);
    }
}

type Policy = {
    /** If true, the top-level field (root segment before the first dot) must be @Selectable() on the root entity */
    requireSelectableForFilter?: boolean;
    /** List of selectable top-level fields of the root entity (e.g., ['email','age','address',...]) */
    selectable?: readonly string[];
};

function enforceSelectableGuard(field: string, policy?: Policy) {
    if (!policy?.requireSelectableForFilter) return;
    const selectable = new Set(policy.selectable ?? []);
    const root = rootOf(field);
    if (!selectable.has(root)) {
        throw new FilterError(
            'FILTER_FIELD_NOT_SELECTABLE',
            `Filtering by '${field}' is not allowed because top-level field '${root}' is not selectable.`,
            { field, root },
        );
    }
}

function validateNode(
    meta: FilterableMap,
    node: FilterNode,
    limits: FilterLimits,
    depthState: { depth: number; nodes: number },
    policy?: Policy,
): void {
    depthState.nodes += 1;
    if (depthState.nodes > limits.maxNodes) {
        throw new FilterError('FILTER_COMPLEXITY_EXCEEDED', 'Filter node count exceeded', { maxNodes: limits.maxNodes });
    }

    if (isGroup(node)) {
        depthState.depth += 1;
        if (depthState.depth > limits.maxDepth) {
            throw new FilterError('FILTER_COMPLEXITY_EXCEEDED', 'Filter depth exceeded', { maxDepth: limits.maxDepth });
        }
        const arr = (node as any).and ?? (node as any).or;
        if (!Array.isArray(arr)) {
            throw new FilterError('FILTER_INVALID_SHAPE', 'Group requires array of nodes');
        }
        for (const child of arr) validateNode(meta, child, limits, depthState, policy);
        depthState.depth -= 1;
        return;
    }

    if (!isCondition(node)) {
        throw new FilterError('FILTER_INVALID_SHAPE', 'Condition requires { field, op, value? }');
    }

    const { field, op } = node;

    // Security: must be selectable at root if policy says so
    enforceSelectableGuard(field, policy);

    // Field & operator checks
    const def = meta[field];
    if (!def) {
        throw new FilterError('FILTER_FIELD_NOT_ALLOWED', `Field '${field}' is not filterable`, { field });
    }
    const allowed = def.operators;
    if (!allowed.includes(op as Op)) {
        throw new FilterError('FILTER_OPERATOR_UNSUPPORTED', `Operator '${op}' is not allowed for '${field}'`, {
            field, op, allowed,
        });
    }

    const value: unknown = (node as any).value;
    assertValueForOp(def.type, def.enumValues, op, value, limits.maxInSize, field);
}

/** Public entry: validates in place; throws FilterError on failure. */
export function validateFilter(
    meta: FilterableMap,
    input: FilterInput | undefined, // ← allow undefined
    partial?: Partial<FilterLimits>,
    policy?: Policy,
): void {
    // No filter is valid; nothing to validate.
    if (input == null) return;

    const limits = mergeLimits(partial);
    const state = { depth: 0, nodes: 0 };

    // TypeScript narrowing for FilterNode. We already know it's non-null; shape errors will be caught below.
    const node = input as FilterNode;
    validateNode(meta, node, limits, state, policy);
}
