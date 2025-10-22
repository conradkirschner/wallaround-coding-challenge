import 'reflect-metadata';
import * as Mikro from '@mikro-orm/core';
import type { FilterableMap } from '../../src/filtering/filterable';

type Ctor<T = unknown> = new (...args: never[]) => T;

const DEBUG =
    process.env.DEBUG_FILTER_CODEGEN === '1' ||
    process.env.DEBUG_FILTER_CODEGEN === 'true';

const log = (...a: unknown[]) => {
    if (DEBUG) console.log('[filter-codegen][mikro]', ...a);
};

/** Best-effort: coerce unknown collections into iterable values */
function valuesOf(x: any): any[] {
    if (!x) return [];
    if (Array.isArray(x)) return x;
    if (x instanceof Map) return Array.from(x.values());
    if (typeof x === 'object') return Object.values(x);
    return [];
}

/** Try to get entity metadata via the public API (v5/v6) */
function getMetaViaPublicApi(ctor: Ctor): any | undefined {
    const Metadata: any = (Mikro as any).Metadata;
    if (Metadata?.get) {
        try {
            // MikroORM v5/v6 supports resolving by ctor directly
            const em = Metadata.get(ctor);
            if (em) return em;
        } catch {/* ignore */}
        // Some projects build with slightly different helpers;
        // try by class name (defensive)
        try {
            const name = ctor.name;
            const em = Metadata.get(name);
            if (em) return em;
        } catch {/* ignore */}
    }
    return undefined;
}

/** Fallback: search internal storage shapes if public API fails */
function getMetaViaStorageSweep(ctor: Ctor): any | undefined {
    const storages: any[] = [];

    const ms =
        (Mikro as any)?.MetadataStorage?.getMetadata?.() ??
        (Mikro as any)?.MetadataStorage?.metadata ??
        (Mikro as any)?.Metadata?.getMetadata?.() ??
        (Mikro as any)?.ORM_METADATA ??
        (Mikro as any)?.metadata;

    if (ms) storages.push(ms, ms.entities, ms.metadata, ms._entities, ms._metadata, ms._items, ms._store);

    for (const bag of storages) {
        for (const item of valuesOf(bag)) {
            const name =
                item?.className ??
                item?.name ??
                item?.entity ??
                item?.target?.name ??
                item?.root?.name;

            const target =
                item?.target ?? item?.class ?? item?.constructor ?? item?.prototype;

            if (name === ctor.name || target === ctor) {
                if (item?.properties || item?.props) return item;
            }
        }
    }
    return undefined;
}

/** Unified entry to fetch MikroORM entity metadata for a class */
function findEntityMeta(ctor: Ctor): any | undefined {
    // Prefer the official API
    const viaApi = getMetaViaPublicApi(ctor);
    if (viaApi) return viaApi;

    // Fall back to scanning internal storages
    const viaStorage = getMetaViaStorageSweep(ctor);
    if (viaStorage) return viaStorage;

    log(`warn: no MikroORM metadata found for ${ctor.name} (defaulting non-nullable).`);
    return undefined;
}

/** Extract a { propName: booleanNullable } map from entity metadata */
function extractNullableMap(entityMeta: any): Record<string, boolean> {
    const propsArray: any[] =
        entityMeta?.props ??
        (entityMeta?.properties ? Object.values(entityMeta.properties) : []) ??
        [];

    const out: Record<string, boolean> = {};
    for (const p of propsArray) {
        const name = p?.name ?? p?.fieldName ?? p?.propertyName;
        if (!name) continue;
        // Only nullable: true counts; missing/false => non-nullable (per spec)
        out[name] = p?.nullable === true;
    }

    // Some builds keep properties only in an object map; cover that too
    if (!propsArray.length && entityMeta?.properties && typeof entityMeta.properties === 'object') {
        for (const [k, v] of Object.entries(entityMeta.properties)) {
            const pv: any = v;
            out[k] = pv?.nullable === true;
        }
    }

    if (DEBUG) {
        log('nullable map:', out);
    }
    return out;
}

/**
 * Build fields JSON for MikroORM with nullability from @Property({ nullable }).
 * - If we can’t find metadata for a field, we treat it as NON-nullable (false).
 * - We then fail fast if null-ops are defined on a non-nullable field.
 */
export async function fieldsJsonForMikro(
    entity: string,
    ctor: Ctor,
    meta: Readonly<FilterableMap>,
): Promise<string> {
    // IMPORTANT: By the time this runs, your main generator should have already
    // imported the entity modules. That executes decorators and registers metadata.
    const entityMeta = findEntityMeta(ctor);
    const nullableMap = entityMeta ? extractNullableMap(entityMeta) : {};

    const arr = Object.entries(meta)
        .filter(([name]) => !name.includes('.'))
        .map(([name, def]) => {
            // Default to non-nullable unless explicitly marked nullable: true
            const nullable = Object.prototype.hasOwnProperty.call(nullableMap, name)
                ? Boolean(nullableMap[name])
                : false;

            return {
                name,
                type: def.type,
                operators: Array.isArray(def.operators) ? def.operators : [],
                enumValues: def.enumValues ?? [],
                nullable,
            };
        });

    // Enforce: 'is_null' / 'is_not_null' require nullable: true
    for (const f of arr) {
        const ops = f.operators ?? [];
        if ((ops.includes('is_null') || ops.includes('is_not_null')) && !f.nullable) {
            throw new Error(
                `[filter-codegen] MikroORM: Field "${entity}.${f.name}" is not nullable (no @Property({ nullable: true })) but its @Filterable operators include 'is_null'/'is_not_null'.`,
            );
        }
    }

    return JSON.stringify(arr);
}
