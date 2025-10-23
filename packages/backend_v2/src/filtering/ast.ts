export type Primitive = string | number | boolean | Date | null;

/** A single field condition (value is optional for nullary ops like is_null) */
export type ConditionNode = {
    field: string;
    op: string; // validated against @Filterable.operators at runtime
    value?:
        | Primitive
        | readonly Primitive[]
        | readonly [Primitive, Primitive];
};

/** Logical groups can contain either conditions or nested groups */
export type GroupNode =
    | { and: readonly FilterNode[] }
    | { or: readonly FilterNode[] };

/** A filter node can be a single condition OR a group */
export type FilterNode = ConditionNode | GroupNode;

/** Public input type: allow a single condition or a group */
export type FilterInput = FilterNode;
