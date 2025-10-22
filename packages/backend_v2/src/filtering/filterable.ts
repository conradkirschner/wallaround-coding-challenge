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
    enumValues?: readonly string[];
}>;

/**
 * Flat map of dotted-path → filterable definition.
 * Example keys: 'age', 'createdAt', 'address.city', 'address.postalCode'
 */
export type FilterableMap = Readonly<Record<string, FilterableDef>>;

/** Relation quantifier semantics for to-many/n:n (Prisma) */
export type Quantifier = 'some' | 'every' | 'none';

/** Per-entity relation metadata used by adapters (Prisma, etc.) */
export type RelationMeta = Readonly<Record<
    string, // relation root (property name on the entity)
    Readonly<{
        kind: 'one' | 'many';           // 1:1 vs 1:n / n:n
        defaultQuantifier?: Quantifier; // used when not explicitly specified in a path (e.g. posts.title)
    }>
>>;

/** ====== Metadata keys ====== */
const M_FILTERABLE_FIELDS = Symbol.for('filterable:fields');    // Map<string, FilterableDef>
const M_RELATION_IMPORTS  = Symbol.for('filterable:imports');   // Map<string, { target: Function; depth: number }>
const M_RELATION_META     = Symbol.for('filterable:relations'); // RelationMeta

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
        const ctor = (proto as { constructor: Function }).constructor;
        const map = ensureMeta<Map<string, FilterableDef>>(ctor, M_FILTERABLE_FIELDS, new Map());

        // Freeze arrays so their types are readonly at compile time and immutable at runtime.
        const operators = Object.freeze([...(config.operators ?? [])]) as readonly Operator[];

        // Only include `enumValues` key when present (avoid setting it to undefined with exactOptionalPropertyTypes).
        const entry: FilterableDef = {
            type: config.type,
            operators,
            ...(config.enumValues
                ? { enumValues: Object.freeze([...(config.enumValues)]) as readonly string[] }
                : {}),
        };

        map.set(String(propertyKey), entry);
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
        depth: number; // how deep to import nested @Filterable from the target
        defaultQuantifier?: Quantifier;
    }>,
) {
    return (proto: object, propertyKey: string | symbol) => {
        const ctor = (proto as { constructor: Function }).constructor;
        const relImports = ensureMeta<Map<string, { target: Function; depth: number }>>(
            ctor,
            M_RELATION_IMPORTS,
            new Map(),
        );
        relImports.set(String(propertyKey), { target: getTarget(), depth: opts.depth });

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
    // 1) Start with own scalar fields
    const own =
        (Reflect.getOwnMetadata(M_FILTERABLE_FIELDS, ctor) as Map<string, FilterableDef>) ?? new Map();

    const out: Record<string, FilterableDef> = {};
    for (const [k, v] of own.entries()) out[k] = v;

    // 2) Expand relations imports into dotted paths
    const relImports =
        (Reflect.getOwnMetadata(M_RELATION_IMPORTS, ctor) as Map<
            string,
            { target: Function; depth: number }
        >) ?? new Map();

    for (const [root, { target, depth }] of relImports.entries()) {
        if (depth <= 0) continue;

        const child = getFilterableMetadata(target);
        for (const [k, v] of Object.entries(child)) {
            // Depth=1 only; extend if you later need deeper import trees.
            out[`${root}.${k}`] = v;
        }
    }

    return out;
}
