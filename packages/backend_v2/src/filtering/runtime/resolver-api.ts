// src/filtering/runtime/resolver-api.ts
import type { CustomOpRegistry } from 'src/filtering/custom-ops';
import type { FilterLimits } from 'src/filtering/limits';

export type ResolverShape = 'plain' | 'entity';

/**
 * Common fluent API shared by all resolvers.
 *
 * Type params:
 * - TSelectField: union of legal selectable field names for the entity
 * - TFilterInput: entity-specific filter AST type
 * - S:            current selection tuple (or undefined)
 * - P:            current result shape ('plain' | 'entity')
 * - TPlainOut:    "plain" row type for the CURRENT S (implementer supplies this)
 * - TEntityOut:   "entity" row type for the CURRENT S (implementer supplies this)
 *
 * Notes:
 * - Methods keep `this` returns so implementers can return narrower class types
 *   without fighting the interface.
 * - `entityShape()` / `plainShape()` flip the shape at the type level so
 *   `execute()` becomes precisely typed by overload on `this`.
 */
export interface CommonResolverApi<
    TSelectField extends string,
    TFilterInput,
    S extends readonly TSelectField[] | undefined,
    P extends ResolverShape,
    TPlainOut,
    TEntityOut
> {
    /** Replace / combine filters */
    where(filter: TFilterInput): this;
    whereAnd(...nodes: readonly TFilterInput[]): this;
    whereOr(...nodes: readonly TFilterInput[]): this;

    /** Custom operator registry */
    withCustomOps(registry: CustomOpRegistry): this;

    /** Selection (implementations may return a narrowed subtype for better DX) */
    select<SS extends readonly TSelectField[]>(...fields: SS): this;
    selectAll(): this;

    /** Sorting / pagination */
    orderBy(field: TSelectField, direction?: 'asc' | 'desc'): this;
    sort(spec: ReadonlyArray<{ field: TSelectField; direction?: 'asc' | 'desc' }>): this;

    limit(n: number): this;
    offset(n: number): this;
    paginate(p: { limit?: number; offset?: number }): this;

    /** Guards / limits */
    secureRequireSelectable(): this;
    limits(l: Partial<FilterLimits>): this;

    /** Shape toggles — flip type-level shape for execute() */
    entityShape(): CommonResolverApi<TSelectField, TFilterInput, S, 'entity', TPlainOut, TEntityOut>;
    plainShape():  CommonResolverApi<TSelectField, TFilterInput, S, 'plain',  TPlainOut, TEntityOut>;

    /** Precisely typed by current shape */
    execute(this: CommonResolverApi<TSelectField, TFilterInput, S, 'entity', TPlainOut, TEntityOut>): Promise<TEntityOut[]>;
    execute(this: CommonResolverApi<TSelectField, TFilterInput, S, 'plain',  TPlainOut, TEntityOut>): Promise<TPlainOut[]>;
}
