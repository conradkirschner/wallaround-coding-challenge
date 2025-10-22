// src/filtering/filterable.ts
import 'reflect-metadata';

/** Field value type classification for filter semantics */
export type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'enum' | 'uuid';

/** Allowed operators per field (driven by your decorators) */
export type Operator =
    | 'eq' | 'neq'
    | 'gt' | 'gte' | 'lt' | 'lte'
    | 'between'
    | 'in'
    | 'contains' | 'starts_with' | 'ends_with'
    | 'is_null' | 'is_not_null';

export type FilterableDef = Readonly<{
    type: FieldType;
    operators: readonly Operator[];
    enumValues?: string[];
}>;

/** Flat map of dotted-path → filterable definition. */
export type FilterableMap = Readonly<Record<string, FilterableDef>>;

/** Relation quantifier semantics for to-many/n:n (Prisma) */
export type Quantifier = 'some' | 'every' | 'none';

/** Per-entity relation metadata used by adapters (Prisma, etc.) */
export type RelationMeta = Readonly<Record<
    string,
    Readonly<{
        kind: 'one' | 'many';
        defaultQuantifier?: Quantifier;
    }>
>>;

/** ====== Metadata keys ====== */
const M_FILTERABLE_FIELDS = Symbol.for('filterable:fields');     // Map<string, FilterableDef>
const M_RELATION_IMPORTS  = Symbol.for('filterable:imports');    // Map<string, { getTarget: () => Function; depth: number }>
const M_RELATION_META     = Symbol.for('filterable:relations');  // RelationMeta

/** Utility — get or create metadata container */
function ensureMeta<T extends object>(target: object, key: symbol, init: T): T {
    const prev = Reflect.getOwnMetadata(key, target);
    if (prev) return prev as T;
    Reflect.defineMetadata(key, init, target);
    return init;
}

/** Mark a scalar field as filterable with the allowed operator set */
export function Filterable(config: { type: FieldType; operators: readonly Operator[]; enumValues?: readonly string[] }) {
    return (proto: object, propertyKey: string | symbol) => {
        const ctor = proto.constructor;
        const map = ensureMeta<Map<string, FilterableDef>>(ctor, M_FILTERABLE_FIELDS, new Map());
        map.set(String(propertyKey), {
            type: config.type,
            operators: Object.freeze([...(config.operators)]) as readonly Operator[],
            ...(config.enumValues ? { enumValues: Object.freeze([...(config.enumValues)]) as string[] } : {}),
        });
    };
}

/**
 * Import filterable fields from a related entity and expose them as dotted paths.
 * Also records relation "kind" and an optional default quantifier for to-many relations (Prisma).
 *
 * Example:
 *   @FilterableRelation(() => Address, { kind: 'one', depth: 1 })
 *   address?: Address
 *
 *   @FilterableRelation(() => Post, { kind: 'many', depth: 1, defaultQuantifier: 'some' })
 *   posts?: Post[]
 */
export function FilterableRelation(
    getTarget: () => Function,
    opts: Readonly<{
        kind: 'one' | 'many';
        depth: number;
        defaultQuantifier?: Quantifier;
    }>,
) {
    return (proto: object, propertyKey: string | symbol) => {
        const ctor = proto.constructor;

        // IMPORTANT: store the factory lazily to avoid circular-init issues
        const relImports = ensureMeta<Map<string, { getTarget: () => Function; depth: number }>>(
            ctor, M_RELATION_IMPORTS, new Map(),
        );
        relImports.set(String(propertyKey), { getTarget, depth: opts.depth });

        const relMeta = ensureMeta<RelationMeta>(ctor, M_RELATION_META, {});
        (relMeta as Record<string, unknown>)[String(propertyKey)] = {
            kind: opts.kind,
            ...(opts.defaultQuantifier ? { defaultQuantifier: opts.defaultQuantifier } : {}),
        };
    };
}

/** Retrieve relation meta (kind + defaultQuantifier) for codegen/adapters */
export function getFilterableRelationsMeta(ctor: Function): RelationMeta {
    return (Reflect.getOwnMetadata(M_RELATION_META, ctor) as RelationMeta) ?? {};
}

/** Retrieve the flat filterable map (including dotted imports from relations) */
export function getFilterableMetadata(ctor: Function): FilterableMap {
    // 1) Own scalar fields
    const own = (Reflect.getOwnMetadata(M_FILTERABLE_FIELDS, ctor) as Map<string, FilterableDef>) ?? new Map();

    const out: Record<string, FilterableDef> = {};
    for (const [k, v] of own.entries()) out[k] = v;

    // 2) Expand relations lazily (resolve target now, not at decoration time)
    const relImports = (Reflect.getOwnMetadata(M_RELATION_IMPORTS, ctor) as Map<string, { getTarget: () => Function; depth: number }>) ?? new Map();
    for (const [root, { getTarget, depth }] of relImports.entries()) {
        if (depth <= 0) continue;

        // Lazily resolve the target constructor here
        const targetCtor = getTarget();
        const child = getFilterableMetadata(targetCtor);

        // Depth=1 import: root.field → dotted paths
        for (const [k, v] of Object.entries(child)) {
            out[`${root}.${k}`] = v;
        }
    }

    return out;
}
