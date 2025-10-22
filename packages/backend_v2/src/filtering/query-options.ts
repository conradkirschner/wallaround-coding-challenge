// src/filtering/query-options.ts
import type { FilterableMap } from './filterable';
import { getSelectableFields, getSortableFields } from './expose';
import { FilterError } from './errors';

export type SortDirection = 'asc' | 'desc';
export interface SortSpec { field: string; direction?: SortDirection }

export interface QueryOptions {
    /** Projection; if omitted, ORM returns full entity. */
    select?: readonly string[];
    /** Sorting in priority order. */
    sort?: readonly SortSpec[];
    /** Pagination */
    limit?: number;
    offset?: number;
}

export interface QueryLimits {
    /** Max selected fields; prevents wide selects. */
    maxSelect: number;
    /** Max sort keys; prevents huge ORDER BY lists. */
    maxSort: number;
    /** Page size cap and default. */
    maxLimit: number;
    defaultLimit: number;
}

export const DefaultQueryLimits: Readonly<QueryLimits> = {
    maxSelect: 50,
    maxSort: 5,
    maxLimit: 100,
    defaultLimit: 25,
};

export function mergeQueryLimits(p?: Partial<QueryLimits>): QueryLimits {
    return { ...DefaultQueryLimits, ...(p ?? {}) };
}

/** Validate & normalize query options against entity metadata. */
export function normalizeQueryOptions<T>(
    entityCtor: new (...args: never[]) => T,
    filterable: Readonly<FilterableMap>,
    opts?: QueryOptions,
    partialLimits?: Partial<QueryLimits>,
): Required<Pick<QueryOptions, 'limit' | 'offset'>> & QueryOptions {
    const limits = mergeQueryLimits(partialLimits);
    const selectable = getSelectableFields(entityCtor); // strict allowlist
    const sortable = getSortableFields(entityCtor);     // allowlist; fallback to filterable keys

    const normalized: QueryOptions = {};
    const limit = typeof opts?.limit === 'number' && opts.limit > 0
        ? Math.min(opts.limit, limits.maxLimit)
        : limits.defaultLimit;
    const offset = typeof opts?.offset === 'number' && opts.offset >= 0 ? Math.floor(opts.offset) : 0;

    // SELECT
    if (opts?.select && opts.select.length > 0) {
        if (opts.select.length > limits.maxSelect) {
            throw new FilterError('FILTER_COMPLEXITY_EXCEEDED', 'Too many selected fields', { maxSelect: limits.maxSelect });
        }
        for (const f of opts.select) {
            if (!selectable.has(f)) {
                throw new FilterError('FILTER_FIELD_NOT_ALLOWED', `Field '${f}' is not selectable`, { field: f });
            }
        }
        normalized.select = Array.from(new Set(opts.select)); // dedupe
    }

    // SORT
    if (opts?.sort && opts.sort.length > 0) {
        if (opts.sort.length > limits.maxSort) {
            throw new FilterError('FILTER_COMPLEXITY_EXCEEDED', 'Too many sort fields', { maxSort: limits.maxSort });
        }
        const allowedSort = sortable.size > 0 ? sortable : new Set(Object.keys(filterable));
        normalized.sort = opts.sort.map(({ field, direction }) => {
            if (!allowedSort.has(field)) {
                throw new FilterError('FILTER_FIELD_NOT_ALLOWED', `Field '${field}' is not sortable`, { field });
            }
            const dir = (direction ?? 'asc').toLowerCase();
            if (dir !== 'asc' && dir !== 'desc') {
                throw new FilterError('FILTER_INVALID_SHAPE', `Invalid sort direction for '${field}'`, { field, direction });
            }
            return { field, direction: dir as SortDirection };
        });
    }

    normalized.limit = limit;
    normalized.offset = offset;
    return normalized as Required<Pick<QueryOptions, 'limit' | 'offset'>> & QueryOptions;
}
