
/* THIS FILE IS AUTO-GENERATED. DO NOT EDIT. */

import type { EntityName, FindOptions, FilterQuery, EntityManager } from '@mikro-orm/core';
import type { FilterInput as BaseFilterInput, Primitive } from 'src/filtering/ast';
import { getFilterableMetadata, type FilterableMap, type FieldType } from 'src/filtering/filterable';
import { CustomOpRegistry, type IR } from 'src/filtering/custom-ops';
import { validateFilter } from 'src/filtering/validate';
import { getSelectableFields } from 'src/filtering/expose';
import { type FilterLimits } from 'src/filtering/limits';
import type { UserExpr as Expr } from './UserFilterQuery';
import type { MikroOrmCtx } from 'src/filtering/runtime/driver';
import type { CommonResolverApi } from 'src/filtering/runtime/resolver-api';

/** ======================= Compile-time entity-scoped constants ======================= */
export const User_SELECTABLE = ["address","address.city","address.country","address.postalCode","address.street1","address.street2","age","createdAt","displayName","email","id","isActive","posts","posts.content","posts.createdAt","posts.published","posts.title","role","updatedAt"] as const;
type Fallback<A, B> = [A] extends [never] ? B : A;
export type UserSelectField = Fallback<typeof User_SELECTABLE[number], string>;

export const User_RELATIONS = ["address","posts"] as const;
export type UserRelationRoot = Fallback<typeof User_RELATIONS[number], string>;

export const User_OPS = ["between","contains","ends_with","eq","gt","gte","in","is_not_null","is_null","lt","lte","neq","starts_with"] as const;
type Operator = typeof User_OPS[number];
type SortSpec = ReadonlyArray<{ field: UserSelectField; direction?: 'asc' | 'desc' }>;

/** ======================= Strong filter typing for this entity ======================= */
export type UserFieldName = UserSelectField;

export type UserConditionNode = {
  field: UserFieldName;
  op: Operator;
  /** present only when provided (exactOptionalPropertyTypes safe) */
  value?: Primitive | readonly Primitive[] | readonly [Primitive, Primitive];
};

export type UserFilterNode =
  | { and: readonly UserFilterNode[] }
  | { or: readonly UserFilterNode[] }
  | UserConditionNode;

export type UserFilterInput = UserFilterNode;

/** ======================= Types for plain projection ======================= */
type UnionToIntersection<U> =
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

type Expand<T> = T extends object ? { [K in keyof T]: T[K] } : T;

type DotPick<T, P extends string> =
  P extends `${infer K}.${infer R}`
    ? K extends keyof T
      ? { [KK in K]: DotPick<NonNullable<T[KK]>, R> }
      : { [KK in K & string]: unknown }
    : P extends keyof T
      ? { [KK in P]: T[KK] }
      : { [KK in P & string]: unknown };

type PickByPaths<T, S extends readonly string[]> =
  Expand<UnionToIntersection<S[number] extends string ? DotPick<T, S[number]> : {}>>;

type V = Expr[keyof Expr];

/** Return shape for 'plain' */
type UserPlain<S extends readonly UserSelectField[] | undefined, T> =
  S extends readonly UserSelectField[] ? PickByPaths<T, S> : Record<string, unknown>;

/** =========================================================================================
 *  FLUENT, STRICTLY-TYPED RESOLVER
 * =======================================================================================*/
type Shape = 'plain' | 'entity';

type ResolverState<S extends readonly UserSelectField[] | undefined, P extends Shape> = Readonly<{
  filter?: UserFilterInput;
  custom?: CustomOpRegistry;
  select?: S;
  sort?: SortSpec;
  limit?: number;
  offset?: number;
  shape: P;
  limits?: Partial<FilterLimits>;
  security?: { requireSelectableForFilter?: boolean };
}>;

export class UserResolver<
  T extends object,
  S extends readonly UserSelectField[] | undefined = undefined,
  P extends Shape = 'plain'
> implements CommonResolverApi<
    PostSelectField,
    PostFilterInput,
    S,
    P,
    PostPlain<S, T>,
    PrismaEntityPayload<S>
  > {
  private readonly ctx: MikroOrmCtx<EntityManager>;
  private readonly em: EntityManager;
  private readonly entityName: EntityName<T>;
  private readonly ctor: new (...args: never[]) => T;
  private readonly meta: Readonly<FilterableMap>;
  private readonly state: ResolverState<S, P>;

  /** ---------- Construction ---------- */
  constructor(
    ctx: MikroOrmCtx<EntityManager>,
    a: EntityName<T> | (new (...args: never[]) => T),
    b?: new (...args: never[]) => T,
    state?: ResolverState<S, P>,
  ) {
    this.ctx = ctx;
    this.em = UserResolver.getScopedEm(ctx);

    if (typeof a === 'function' && !b) {
      this.entityName = a as unknown as EntityName<T>;
      this.ctor = a as new (...args: never[]) => T;
    } else {
      this.entityName = a as EntityName<T>;
      this.ctor = (b ?? (a as new (...args: never[]) => T)) as new (...args: never[]) => T;
    }

    this.meta = getFilterableMetadata(this.ctor);
    this.state = state ?? ({ shape: 'plain' } as ResolverState<S, P>);
  }

  /** Factory helpers */
  static withCtor<T extends object>(
    ctx: MikroOrmCtx<EntityManager>,
    ctor: new (...args: never[]) => T,
  ): UserResolver<T, undefined, 'plain'> {
    return new UserResolver<T, undefined, 'plain'>(ctx, ctor);
  }

  static withName<T extends object>(
    ctx: MikroOrmCtx<EntityManager>,
    name: EntityName<T>,
    ctor: new (...args: never[]) => T,
  ): UserResolver<T, undefined, 'plain'> {
    return new UserResolver<T, undefined, 'plain'>(ctx, name, ctor);
  }

  /** ---------- Fluent API (immutable; narrows generics) ---------- */

  /** Replace filter */
  where(filter: UserFilterInput): this;
  where(filter: UserFilterInput): UserResolver<T, S, P>;
  where(filter: UserFilterInput): any {
    return this.clone({ filter }) as any;
  }

  /** AND with existing filter */
  whereAnd(...nodes: readonly UserFilterNode[]): this;
  whereAnd(...nodes: readonly UserFilterNode[]): UserResolver<T, S, P>;
  whereAnd(...nodes: readonly UserFilterNode[]): any {
    const next = this.state.filter
      ? ({ and: [this.state.filter, ...nodes] } as UserFilterInput)
      : (nodes.length === 1 ? nodes[0]! : ({ and: nodes } as UserFilterInput));
    return this.clone({ filter: next }) as any;
  }

  /** OR with existing filter */
  whereOr(...nodes: readonly UserFilterNode[]): this;
  whereOr(...nodes: readonly UserFilterNode[]): UserResolver<T, S, P>;
  whereOr(...nodes: readonly UserFilterNode[]): any {
    const next = this.state.filter
      ? ({ or: [this.state.filter, ...nodes] } as UserFilterInput)
      : (nodes.length === 1 ? nodes[0]! : ({ or: nodes } as UserFilterInput));
    return this.clone({ filter: next }) as any;
  }

  /** Custom operators registry */
  withCustomOps(registry: CustomOpRegistry): this;
  withCustomOps(registry: CustomOpRegistry): UserResolver<T, S, P>;
  withCustomOps(registry: CustomOpRegistry): any {
    return this.clone({ custom: registry }) as any;
  }

  /** Select specific fields */
  select<SS extends readonly UserSelectField[]>(...fields: SS): this;
  select<SS extends readonly UserSelectField[]>(...fields: SS): UserResolver<T, SS, P>;
  select(...fields: readonly UserSelectField[]): any {
    return this.clone({ select: fields as any }) as any;
  }

  /** Select all compile-time selectable fields */
  selectAll(): this;
  selectAll(): UserResolver<T, typeof User_SELECTABLE, P>;
  selectAll(): any {
    return this.clone({ select: User_SELECTABLE }) as any;
  }

  /** Sorting */
  orderBy(field: UserSelectField, direction: 'asc' | 'desc' = 'asc'): this {
    const s: SortSpec = [...(this.state.sort ?? []), { field, direction }];
    return this.clone({ sort: s }) as any as this;
  }

  sort(spec: SortSpec): this {
    return this.clone({ sort: spec }) as any as this;
  }

  /** Pagination */
  limit(n: number): this { return this.clone({ limit: n }) as any as this; }
  offset(n: number): this { return this.clone({ offset: n }) as any as this; }
  paginate(p: { limit?: number; offset?: number }): this {
    return this.clone({
      ...(p.limit  !== undefined ? { limit:  p.limit  } : {}),
      ...(p.offset !== undefined ? { offset: p.offset } : {}),
    }) as any as this;
  }

  /** Security & limits */
  secureRequireSelectable(): this {
    return this.clone({ security: { ...(this.state.security ?? {}), requireSelectableForFilter: true } }) as any as this;
  }

  limits(l: Partial<FilterLimits>): this {
    return this.clone({ limits: l }) as any as this;
  }

  /** Shape toggles */
  entityShape(): this;
  entityShape(): UserResolver<T, S, 'entity'>;
  entityShape(): any { return this.clone<S, 'entity'>({ shape: 'entity' }) as any; }

  plainShape(): this;
  plainShape(): UserResolver<T, S, 'plain'>;
  plainShape(): any  { return this.clone<S, 'plain'>({  shape: 'plain'  }) as any; }

  /** ---------- Execute (typed by shape & selections) ---------- */
  async execute(this: UserResolver<T, S, 'entity'>): Promise<T[]>;
  async execute(this: UserResolver<T, S, 'plain'>): Promise<UserPlain<S, T>[]>;
  async execute(): Promise<T[] | UserPlain<S, T>[]> {
    const { filter, custom, select, sort, limit, offset, shape, security, limits } = this.state;

    if (filter) {
      const selectableRoots: readonly string[] = (() => {
        const s = getSelectableFields(this.ctor);
        return Array.isArray(s) ? s : Array.from(s as ReadonlySet<string>);
      })();

      validateFilter(this.meta, filter as unknown as BaseFilterInput, limits, {
        requireSelectableForFilter: Boolean(security?.requireSelectableForFilter),
        selectable: selectableRoots,
      });
    }

    const where = (filter ? UserResolver.buildWhere(this.meta, filter, custom) : {}) as FilterQuery<T>;

    const orderByRecord =
      sort?.reduce<Record<string, 'asc' | 'desc'>>((acc, s) => {
        acc[s.field as string] = s.direction ?? 'asc';
        return acc;
      }, {}) ?? undefined;

    const { populate, fields } = UserResolver.buildPopulateAndFields(select);
    const populateWhereMap = UserResolver.buildPopulateWhereMap(this.meta, filter);

    const findOptions = {
      ...(typeof limit  === 'number' ? { limit  } : {}),
      ...(typeof offset === 'number' ? { offset } : {}),
      ...(orderByRecord ? { orderBy: orderByRecord as NonNullable<FindOptions<T>['orderBy']> } : {}),
      ...(populate      ? { populate: populate     as NonNullable<FindOptions<T>['populate']> } : {}),
      ...(fields        ? { fields:   fields       as NonNullable<FindOptions<T>['fields']> }   : {}),
      ...(Object.keys(populateWhereMap).length
          ? { populateWhere: populateWhereMap as unknown as NonNullable<FindOptions<T>['populateWhere']> }
          : {}),
    } satisfies FindOptions<T>;

    const rows = await this.em.find<T>(this.entityName, where, findOptions);

    if (shape === 'entity') return rows;

    const selPaths = (select as readonly string[] | undefined) ?? [];
    const picked = (rows as unknown as object[]).map((row) =>
      selPaths.length ? UserResolver.projectRow(row, selPaths) : ({} as Record<string, unknown>)
    ) as UserPlain<S, T>[];

    return picked;
  }

  /** ---------- Static helpers ---------- */

  private static isGroup(n: UserFilterNode): n is { and: readonly UserFilterNode[] } | { or: readonly UserFilterNode[] } {
    return Object.prototype.hasOwnProperty.call(n, 'and') || Object.prototype.hasOwnProperty.call(n, 'or');
  }

  private static AND(parts: readonly Expr[]): Expr { return { AND: parts as Expr[] }; }
  private static OR(parts: readonly Expr[]): Expr  { return { OR: parts as Expr[] }; }
  private static mergeAnd(parts: readonly Expr[]): Expr {
    return parts.length === 0 ? {} : parts.length === 1 ? parts[0]! : UserResolver.AND(parts);
  }
  private static mergeOr(parts: readonly Expr[]): Expr {
    return parts.length === 0 ? {} : parts.length === 1 ? parts[0]! : UserResolver.OR(parts);
  }

  private static likeEscape(s: string): string { return s.replace(/[%_]/g, (m) => '\\' + m); }

  private static wrapField(field: string, payload: V): Expr {
    return { [field]: payload } as Expr;
  }

  private static nest(path: string, payload: V): Expr {
    const segs = path.split('.');
    let acc: Record<string, V> = { [segs[segs.length - 1] as string]: payload };
    for (let i = segs.length - 2; i >= 0; i--) acc = { [segs[i] as string]: acc };
    return acc as Expr;
  }

  private static isNonEmptyExpr(x: Expr | undefined): x is Expr {
    return !!x && Object.keys(x as Record<string, unknown>).length > 0;
  }

  private static fromIR(ir: IR): Expr {
    if ('and' in ir) return UserResolver.mergeAnd(ir.and.map(UserResolver.fromIR));
    if ('or'  in ir) return UserResolver.mergeOr(ir.or.map(UserResolver.fromIR));

    const f = ir.field ?? '__FIELD__';
    const dotted = f.includes('.');

    if (ir.op === 'eq')           return dotted ? UserResolver.nest(f, ir.value as V)                 : UserResolver.wrapField(f, ir.value as V);
    if (ir.op === 'neq')          return dotted ? UserResolver.nest(f, { $ne: ir.value as V } as V)   : UserResolver.wrapField(f, { $ne: ir.value as V } as V);
    if (ir.op === 'gt')           return dotted ? UserResolver.nest(f, { $gt: ir.value as V } as V)   : UserResolver.wrapField(f, { $gt: ir.value as V } as V);
    if (ir.op === 'gte')          return dotted ? UserResolver.nest(f, { $gte: ir.value as V } as V)  : UserResolver.wrapField(f, { $gte: ir.value as V } as V);
    if (ir.op === 'lt')           return dotted ? UserResolver.nest(f, { $lt: ir.value as V } as V)   : UserResolver.wrapField(f, { $lt: ir.value as V } as V);
    if (ir.op === 'lte')          return dotted ? UserResolver.nest(f, { $lte: ir.value as V } as V)  : UserResolver.wrapField(f, { $lte: ir.value as V } as V);
    if (ir.op === 'in')           return dotted ? UserResolver.nest(f, { $in: ir.values as readonly V[] } as V)
                                                : UserResolver.wrapField(f, { $in: ir.values as readonly V[] } as V);
    if (ir.op === 'between') {
      const gte = dotted ? UserResolver.nest(f, { $gte: ir.a as V } as V) : UserResolver.wrapField(f, { $gte: ir.a as V } as V);
      const lte = dotted ? UserResolver.nest(f, { $lte: ir.b as V } as V) : UserResolver.wrapField(f, { $lte: ir.b as V } as V);
      return UserResolver.mergeAnd([gte, lte]);
    }
    if (ir.op === 'contains')     return dotted ? UserResolver.nest(f, { $like: `%${UserResolver.likeEscape(String(ir.value))}%` } as V)
                                                : UserResolver.wrapField(f, { $like: `%${UserResolver.likeEscape(String(ir.value))}%` } as V);
    if (ir.op === 'starts_with')  return dotted ? UserResolver.nest(f, { $like: `${UserResolver.likeEscape(String(ir.value))}%` } as V)
                                                : UserResolver.wrapField(f, { $like: `${UserResolver.likeEscape(String(ir.value))}%` } as V);
    if (ir.op === 'ends_with')    return dotted ? UserResolver.nest(f, { $like: `%${UserResolver.likeEscape(String(ir.value))}` } as V)
                                                : UserResolver.wrapField(f, { $like: `%${UserResolver.likeEscape(String(ir.value))}` } as V);
    if (ir.op === 'is_null')      return dotted ? UserResolver.nest(f, null as V) : UserResolver.wrapField(f, null as V);
    if (ir.op === 'is_not_null')  return dotted ? UserResolver.nest(f, { $ne: null } as V) : UserResolver.wrapField(f, { $ne: null } as V);

    throw Object.assign(new Error(`Operator '${(ir as { op: string }).op}' cannot be mapped`), {
      code: 'FILTER_OPERATOR_UNSUPPORTED',
      operator: (ir as { op: string }).op,
      field: f,
    });
  }

  private static emitCondition(
    field: string,
    fieldType: FieldType,
    cond: UserConditionNode,
    custom?: CustomOpRegistry,
    defAllowed?: readonly string[],
  ): Expr {
    const name = cond.op.toLowerCase();

    if (defAllowed && !(defAllowed as readonly string[]).includes(name)) {
      throw Object.assign(new Error(`Operator '${name}' is not allowed for field '${field}'`), {
        code: 'FILTER_OPERATOR_UNSUPPORTED',
        field,
        operator: name,
        allowed: defAllowed,
      });
    }

    const hasValue = Object.prototype.hasOwnProperty.call(cond, 'value');
    const v = hasValue ? cond.value : undefined;

    if (field.includes('.')) {
      if (name === 'eq')           return UserResolver.nest(field, v as V);
      if (name === 'neq')          return UserResolver.nest(field, { $ne: v as V } as V);
      if (name === 'gt')           return UserResolver.nest(field, { $gt: v as V } as V);
      if (name === 'gte')          return UserResolver.nest(field, { $gte: v as V } as V);
      if (name === 'lt')           return UserResolver.nest(field, { $lt: v as V } as V);
      if (name === 'lte')          return UserResolver.nest(field, { $lte: v as V } as V);
      if (name === 'in')           return UserResolver.nest(field, { $in: v as readonly V[] } as V);
      if (name === 'between') {
        const [a, b] = v as readonly [Primitive, Primitive];
        return UserResolver.mergeAnd([UserResolver.nest(field, { $gte: a as V } as V), UserResolver.nest(field, { $lte: b as V } as V)]);
      }
      if (name === 'contains')     return UserResolver.nest(field, { $like: `%${UserResolver.likeEscape(String(v))}%` } as V);
      if (name === 'starts_with')  return UserResolver.nest(field, { $like: `${UserResolver.likeEscape(String(v))}%` } as V);
      if (name === 'ends_with')    return UserResolver.nest(field, { $like: `%${UserResolver.likeEscape(String(v))}` } as V);
      if (name === 'is_null')      return UserResolver.nest(field, null as V);
      if (name === 'is_not_null')  return UserResolver.nest(field, { $ne: null } as V);
    } else {
      if (name === 'eq')           return UserResolver.wrapField(field, v as V);
      if (name === 'neq')          return UserResolver.wrapField(field, { $ne: v as V } as V);
      if (name === 'gt')           return UserResolver.wrapField(field, { $gt: v as V } as V);
      if (name === 'gte')          return UserResolver.wrapField(field, { $gte: v as V } as V);
      if (name === 'lt')           return UserResolver.wrapField(field, { $lt: v as V } as V);
      if (name === 'lte')          return UserResolver.wrapField(field, { $lte: v as V } as V);
      if (name === 'in')           return UserResolver.wrapField(field, { $in: v as readonly V[] } as V);
      if (name === 'between') {
        const [a, b] = v as readonly [Primitive, Primitive];
        return UserResolver.mergeAnd([UserResolver.wrapField(field, { $gte: a as V } as V), UserResolver.wrapField(field, { $lte: b as V } as V)]);
      }
      if (name === 'contains')     return UserResolver.wrapField(field, { $like: `%${UserResolver.likeEscape(String(v))}%` } as V);
      if (name === 'starts_with')  return UserResolver.wrapField(field, { $like: `${UserResolver.likeEscape(String(v))}%` } as V);
      if (name === 'ends_with')    return UserResolver.wrapField(field, { $like: `%${UserResolver.likeEscape(String(v))}` } as V);
      if (name === 'is_null')      return UserResolver.wrapField(field, null as V);
      if (name === 'is_not_null')  return UserResolver.wrapField(field, { $ne: null } as V);
    }

    if (custom) {
      const emitter = custom.get(field, fieldType, name);
      if (emitter) {
        const ir: IR = (() => {
          if (hasValue) {
            const vv = v;
            if (Array.isArray(vv)) {
              if (vv.length === 2 && 0 in vv && 1 in vv) return (emitter as (a: Primitive, b: Primitive) => IR)(vv[0] as Primitive, vv[1] as Primitive);
              return (emitter as (arr: readonly Primitive[]) => IR)(vv as readonly Primitive[]);
            }
            return (emitter as (a: Primitive) => IR)(vv as Primitive);
          }
          return (emitter as () => IR)();
        })();

        const rewrite = (node: IR): IR => {
          if ('and' in node) return { and: node.and.map(rewrite) };
          if ('or'  in node) return { or:  node.or.map(rewrite) };
          return (node as { field?: string }).field === '__FIELD__'
            ? ({ ...(node as Exclude<IR, { and: readonly IR[] } | { or: readonly IR[] }>), field } as IR)
            : node;
        };

        return UserResolver.fromIR(rewrite(ir));
      }
    }

    throw Object.assign(new Error(`Operator '${cond.op}' is not supported for field '${field}'`), {
      code: 'FILTER_OPERATOR_UNSUPPORTED',
      field,
      operator: name,
    });
  }

  private static buildWhere(
    meta: Readonly<FilterableMap>,
    node: UserFilterNode,
    custom?: CustomOpRegistry,
  ): Expr {
    if (UserResolver.isGroup(node)) {
      if ('and' in node) {
        const parts = node.and.map((child) => UserResolver.buildWhere(meta, child, custom)).filter((e) => Object.keys(e).length > 0);
        return UserResolver.mergeAnd(parts);
      }
      const parts = node.or.map((child) => UserResolver.buildWhere(meta, child, custom)).filter((e) => Object.keys(e).length > 0);
      return UserResolver.mergeOr(parts);
    }

    const def = meta[node.field];
    if (!def) {
      throw Object.assign(new Error(`Field '${node.field}' is not filterable`), { code: 'FILTER_FIELD_NOT_ALLOWED', field: node.field });
    }

    const allowed = def.operators as readonly string[];
    return UserResolver.emitCondition(node.field, def.type, node, custom, allowed);
  }

  private static emitRelationLeaf(
    tailField: string,
    fieldType: FieldType,
    cond: UserConditionNode,
  ): Expr {
    const name = cond.op.toLowerCase();
    const hasValue = Object.prototype.hasOwnProperty.call(cond, 'value');
    const v = hasValue ? cond.value : undefined;

    if (name === 'eq')           return UserResolver.wrapField(tailField, v as V);
    if (name === 'neq')          return UserResolver.wrapField(tailField, { $ne: v as V } as V);
    if (name === 'gt')           return UserResolver.wrapField(tailField, { $gt: v as V } as V);
    if (name === 'gte')          return UserResolver.wrapField(tailField, { $gte: v as V } as V);
    if (name === 'lt')           return UserResolver.wrapField(tailField, { $lt: v as V } as V);
    if (name === 'lte')          return UserResolver.wrapField(tailField, { $lte: v as V } as V);
    if (name === 'in')           return UserResolver.wrapField(tailField, { $in: v as readonly V[] } as V);
    if (name === 'between') {
      const [a, b] = v as readonly [Primitive, Primitive];
      return UserResolver.mergeAnd([UserResolver.wrapField(tailField, { $gte: a as V } as V), UserResolver.wrapField(tailField, { $lte: b as V } as V)]);
    }
    if (name === 'contains')     return UserResolver.wrapField(tailField, { $like: `%${UserResolver.likeEscape(String(v))}%` } as V);
    if (name === 'starts_with')  return UserResolver.wrapField(tailField, { $like: `${UserResolver.likeEscape(String(v))}%` } as V);
    if (name === 'ends_with')    return UserResolver.wrapField(tailField, { $like: `%${UserResolver.likeEscape(String(v))}` } as V);
    if (name === 'is_null')      return UserResolver.wrapField(tailField, null as V);
    if (name === 'is_not_null')  return UserResolver.wrapField(tailField, { $ne: null } as V);

    return {};
  }

  private static buildRelationWhereForRoot(
    meta: Readonly<FilterableMap>,
    root: string,
    node: UserFilterNode,
  ): Expr | undefined {
    if (UserResolver.isGroup(node)) {
      const children = ('and' in node ? node.and : node.or)
        .map((c) => UserResolver.buildRelationWhereForRoot(meta, root, c))
        .filter(UserResolver.isNonEmptyExpr);

      if (children.length === 0) return undefined;
      if (children.length === 1) return children[0]!;
      return ('and' in node) ? UserResolver.mergeAnd(children) : UserResolver.mergeOr(children);
    }

    if (!node.field.startsWith(root + '.')) return undefined;

    const tail = node.field.slice(root.length + 1);
    const def  = meta[node.field];
    if (!def) return undefined;

    return UserResolver.emitRelationLeaf(tail, def.type, node);
  }

  private static buildPopulateWhereMap(
    meta: Readonly<FilterableMap>,
    filter?: UserFilterInput,
  ): Partial<Record<UserRelationRoot, Expr>> {
    if (!filter) return {};
    const out: Partial<Record<UserRelationRoot, Expr>> = {};
    for (const root of User_RELATIONS as readonly UserRelationRoot[]) {
      const w = UserResolver.buildRelationWhereForRoot(meta, root, filter);
      if (w && Object.keys(w).length > 0) out[root] = w;
    }
    return out;
  }

  private static getScopedEm(ctx: MikroOrmCtx<EntityManager>): EntityManager {
    try {
      const maybe = ctx.em as MikroOrmCtx['em'] & { getContext?: () => void };
      if (typeof maybe.getContext === 'function') { maybe.getContext(); return ctx.em; }
    } catch { /* ignore */ }
    throw new Error("Don't use the global EntityManager!");
  }

  private static buildPopulateAndFields(select?: readonly UserSelectField[]): {
    populate?: readonly UserRelationRoot[];
    fields?: readonly string[];
  } {
    if (!select || select.length === 0) return {};

    const relSet = new Set<string>(User_RELATIONS as readonly string[]);
    const populateRoots = new Set<UserRelationRoot>();
    const scalar: string[] = [];
    const dotted: string[] = [];

    for (const s of select as readonly string[]) {
      const dot = s.indexOf('.');
      if (dot > 0) {
        const root  = s.slice(0, dot) as UserRelationRoot;
        if (relSet.has(root)) {
          populateRoots.add(root);
          dotted.push(s);
        } else {
          scalar.push(s);
        }
      } else {
        if (relSet.has(s)) {
          populateRoots.add(s as UserRelationRoot);
        } else {
          scalar.push(s);
        }
      }
    }

    const uniq = (arr: string[]) => Array.from(new Set(arr));
    const fieldsFlat = uniq([...scalar, ...dotted]);

    const result: {
      populate?: readonly UserRelationRoot[];
      fields?: readonly string[];
    } = {};

    if (populateRoots.size > 0) result.populate = Array.from(populateRoots) as readonly UserRelationRoot[];
    if (fieldsFlat.length > 0)  result.fields   = fieldsFlat as readonly string[];

    return result;
  }

  private static isRecord(v: unknown): v is Record<string, unknown> {
    return typeof v === 'object' && v !== null;
  }

  private static asArray(v: unknown): unknown[] | null {
    if (Array.isArray(v)) return v;
    if (v && typeof v === 'object' && typeof (v as any).toArray === 'function') {
      try { return (v as any).toArray(); } catch { /* ignore */ }
    }
    return null;
  }

  private static projectRow(row: object, paths: readonly string[]): Record<string, unknown> {
    const out: Record<string, unknown> = {};

    for (const fullPath of paths) {
      const keys = fullPath.split('.');
      let src: unknown = row;
      let dst: Record<string, unknown> = out;

      for (let i = 0; i < keys.length; i++) {
        const k = keys[i]!;
        if (!UserResolver.isRecord(src)) break;

        const isLast = i === keys.length - 1;
        const next = (src as any)[k];

        if (isLast) {
          const maybeArr = UserResolver.asArray(src);
          if (maybeArr) {
            dst[k] = maybeArr.map((item) => (UserResolver.isRecord(item) ? (item as any)[k] : undefined));
          } else {
            dst[k] = next;
          }
          continue;
        }

        const arr = UserResolver.asArray(next);
        if (arr) {
          const tail = keys.slice(i + 1).join('.');
          dst[k] = arr.map((item) => UserResolver.projectRow(item as object, [tail]));
          break;
        } else {
          if (!UserResolver.isRecord(dst[k])) dst[k] = {};
          dst = dst[k] as Record<string, unknown>;
          src = next;
        }
      }
    }

    return out;
  }

  /** ---------- Tiny internal immutability helper ---------- */
  private clone<SS extends readonly UserSelectField[] | undefined = S, PP extends Shape = P>(
    patch: Partial<ResolverState<SS, PP>>,
  ): UserResolver<T, SS, PP> {
    const next = {
      ...(this.state as unknown as ResolverState<SS, PP>),
      ...(patch as Partial<ResolverState<SS, PP>>),
    } as ResolverState<SS, PP>;
    return new UserResolver<T, SS, PP>(this.ctx, this.entityName, this.ctor, next);
  }

  /** ---------- Handy condition builder (typed & exactOptionalPropertyTypes-safe) ---------- */
  static cond(field: UserSelectField, op: Operator): Omit<UserConditionNode, 'value'>;
  static cond(field: UserSelectField, op: Operator, value: UserConditionNode['value']): UserConditionNode;
  static cond(field: UserSelectField, op: Operator, value?: UserConditionNode['value']): UserConditionNode {
    const base = { field, op } as Omit<UserConditionNode, 'value'>;
    return value === undefined ? base as UserConditionNode : { ...base, value };
  }
}
