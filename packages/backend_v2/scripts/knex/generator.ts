// scripts/generators/sql/generator.ts
import type { Knex } from 'knex';
import type { FilterableMap } from '../../src/filtering/filterable';
import type { SqlCapabilities, SqlMapping } from '../../src/filtering/runtime/adapter/adapter-sql';

type Ctor<T = unknown> = new (...args: never[]) => T;

const DEBUG =
    process.env.DEBUG_FILTER_CODEGEN === '1' ||
    process.env.DEBUG_FILTER_CODEGEN === 'true';

const log = (...a: unknown[]) => {
    if (DEBUG) console.log('[filter-codegen][sql]', ...a);
};

/** Normalize knex.raw result rows across dialects */
function rowsOf(rawResult: unknown): any[] {
    const r = rawResult as any;
    if (!r) return [];
    if (Array.isArray(r)) return r;
    // pg: { rows: [...] }
    if (Array.isArray(r.rows)) return r.rows;
    // sqlite (knex): often returns an array directly, but in some envs it’s { ... } with numeric keys → coerce
    const vals = typeof r === 'object' ? Object.values(r) : [];
    // pick first array-looking value
    const arr = vals.find((v) => Array.isArray(v)) as any[] | undefined;
    return Array.isArray(arr) ? arr : [];
}

/** Fetch { dbColumn -> isNullable } for a table using dialect-aware SQL */
async function loadColumnNullability(db: Knex, dialect: string, table: string): Promise<Record<string, boolean>> {
    const out: Record<string, boolean> = {};

    try {
        switch (dialect) {
            case 'sqlite': {
                // PRAGMA table_info('<table>'): columns → name, notnull (0/1)
                const safe = table.replace(/'/g, "''");
                const res = await db.raw(`PRAGMA table_info('${safe}')`);
                for (const row of rowsOf(res)) {
                    const name = String(row.name);
                    const notnull = Number(row.notnull) === 1;
                    out[name] = !notnull; // notnull=1 → nullable=false
                }
                break;
            }

            case 'postgres': {
                // Assume current schema; override by setting SEARCH_PATH before running codegen if needed
                const sql = `
          select column_name, is_nullable
          from information_schema.columns
          where table_schema = current_schema()
            and table_name = ?
        `;
                const res = await db.raw(sql, [table]);
                for (const row of rowsOf(res)) {
                    const name = String(row.column_name);
                    const isNull = String(row.is_nullable).toLowerCase() === 'yes';
                    out[name] = isNull;
                }
                break;
            }

            default: {
                log(`warn: unknown dialect '${dialect}', defaulting all columns to non-nullable.`);
            }
        }
    } catch (err) {
        log('warn: failed to inspect nullability for table:', table, err);
    }

    return out;
}

/** Build fields JSON for SQL: nullability comes from the DB (via Knex) */
export async function fieldsJsonForSql(
    entity: string,
    ctor: Ctor,
    meta: Readonly<FilterableMap>,
    db: Knex,
    caps: SqlCapabilities,
): Promise<string> {
    // 1) Get mapping for the entity
    const mapping: SqlMapping = caps.getMapping(ctor);
    const dialect = caps.dialect ?? 'generic';

    // 2) Load nullability map for the ROOT table only (top-level scalars)
    const colNullable = await loadColumnNullability(db, dialect, mapping.table);

    // 3) Project FilterableMap → fields array (top-level scalars only)
    const arr = Object.entries(meta)
        .filter(([name]) => !name.includes('.')) // only top-level
        .map(([name, def]) => {
            const dbCol = mapping.columns[name];
            // If unmapped → default to non-nullable but warn (debug)
            if (!dbCol) log(`warn: '${entity}.${name}' has no DB column mapping; nullable=false by default.`);

            const nullable = dbCol ? Boolean(colNullable[dbCol]) : false;

            return {
                name,
                type: def.type,
                operators: Array.isArray(def.operators) ? def.operators : [],
                enumValues: def.enumValues ?? [],
                nullable,
            };
        });

    // 4) Enforce null-ops only on nullable fields
    for (const f of arr) {
        const ops = f.operators ?? [];
        if ((ops.includes('is_null') || ops.includes('is_not_null')) && !f.nullable) {
            throw new Error(
                `[filter-codegen] SQL: Field "${entity}.${f.name}" is not nullable in DB (table: ${mapping.table}) but its @Filterable operators include 'is_null'/'is_not_null'.`,
            );
        }
    }

    if (DEBUG) {
        log(`entity=${entity} table=${mapping.table} fields=`, arr);
    }

    return JSON.stringify(arr);
}
