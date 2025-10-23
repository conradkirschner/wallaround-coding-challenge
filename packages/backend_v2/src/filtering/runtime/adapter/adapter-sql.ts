export type SqlDialect = 'sqlite' | 'postgres' | 'mysql' | 'mssql' | 'generic';

export type SqlIdentifier = string;
type MappingKey = Function | string | symbol;

export type SqlValue =
    | string | number | boolean | Date | null
    | readonly SqlValue[]
    | { readonly [k: string]: SqlValue };

export interface SqlMapping {
    /** DB table backing the root entity */
    table: string;
    /** PK column on the root table */
    primaryKey: string;
    /** map: "domainField" -> "db_column" (top-level scalars only) */
    columns: Record<string, string>;

    /** Top-level relations the resolver may touch (optional) */
    relations?: Record<string, {
        kind: 'one' | 'many';
        table: string;                // related table
        primaryKey?: string;          // related table PK (defaults to 'id')
        columns?: Record<string, string>; // related scalar fields
        join: { local: string; foreign: string }; // join condition: root.local = rel.foreign
        defaultQuantifier?: 'some' | 'every' | 'none'; // for to-many filters
    }>;
}
export interface SqlCapabilities {
    getMapping(ctorOrKey: Function | string | symbol): SqlMapping;
    quoteId(id: SqlIdentifier): string;         // make required
    dialect: SqlDialect;                         // make required
}
export function createSqlCapabilitiesFromObject(
    records: Record<string, SqlMapping>, // key by stable token
    opts: { dialect: SqlDialect; quoteId?: (id: string) => string }
) {
    if (!opts?.dialect) {
        throw Object.assign(new Error('SQL dialect must be specified'), { code: 'SQL_DIALECT_REQUIRED' });
    }
    return createSqlCapabilities(new Map(Object.entries(records)), opts);
}

export interface AdapterSql {
    /** Return mapping for a given domain ctor (or token) */
    getMapping(ctor: Function): SqlMapping;

    /** Quote an identifier for the current dialect (table/column names) */
    quoteId?(id: SqlIdentifier): string;

    /** Optional hint if you want dialect-aware behavior */
    dialect?: SqlDialect;
}

function defaultQuote(dialect: SqlDialect = 'generic') {
    switch (dialect) {
        case 'mysql':  return (id: string) => `\`${id.replace(/`/g, '``')}\``;
        case 'mssql':  return (id: string) => `[${id.replace(/]/g, ']]')}]`;
        case 'sqlite':
        case 'postgres':
        default:       return (id: string) => `"${id.replace(/"/g, '""')}"`;
    }
}

export function createSqlCapabilities(
    maps: Map<MappingKey, SqlMapping>,
    opts: { dialect: SqlDialect; quoteId?: (id: string) => string } // ← require dialect
): AdapterSql {
    const quoteId = opts?.quoteId ?? defaultQuote(opts?.dialect);
    return {
        dialect: opts?.dialect ?? 'generic',
        quoteId,
        getMapping(ctor: Function): SqlMapping {
            const mapping = maps.get(ctor);
            if (!mapping) {
                const name = typeof ctor === 'function' ? (ctor.name || '<anonymous>') : String(ctor);
                throw Object.assign(
                    new Error(`No SqlMapping registered for ${name}`),
                    { code: 'SQL_MAPPING_MISSING', meta: { name } },
                );
            }
            return Object.freeze({ ...mapping, columns: Object.freeze({ ...mapping.columns }) });
        },
    };
}
