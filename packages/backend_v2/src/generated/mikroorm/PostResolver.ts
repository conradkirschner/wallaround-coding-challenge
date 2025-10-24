
/* THIS FILE IS AUTO-GENERATED. DO NOT EDIT. */

import type { EntityName, FindOptions, FilterQuery, EntityManager } from '@mikro-orm/core';
import type { FilterInput as BaseFilterInput, Primitive } from 'src/filtering/ast';
import { getFilterableMetadata, type FilterableMap, type FieldType } from 'src/filtering/filterable';
import { CustomOpRegistry, type IR } from 'src/filtering/custom-ops';
import { validateFilter } from 'src/filtering/validate';
import { getSelectableFields } from 'src/filtering/expose';
import { type FilterLimits } from 'src/filtering/limits';
import type { PostExpr as Expr } from './PostFilterQuery';
import type { MikroOrmCtx } from 'src/filtering/runtime/driver';

/** ======================= Compile-time entity-scoped constants ======================= */
export const Post_SELECTABLE = ["author","content","createdAt","id","published","title","updatedAt"] as const;
type Fallback<A, B> = [A] extends [never] ? B : A;
export type PostSelectField = Fallback<typeof Post_SELECTABLE[number], string>;

export const Post_RELATIONS = [] as const;
export type PostRelationRoot = Fallback<typeof Post_RELATIONS[number], string>;

export const Post_OPS = ["between","contains","ends_with","eq","gt","gte","in","is_not_null","is_null","lt","lte","neq","starts_with"] as const;
type Operator = typeof Post_OPS[number];
type SortSpec = ReadonlyArray<{ field: PostSelectField; direction?: 'asc' | 'desc' }>;

/** ======================= Strong filter typing for this entity ======================= */
export type PostFieldName = PostSelectField;

export type PostConditionNode = {
  field: PostFieldName;
  op: Operator;
  /** present only when provided (exactOptionalPropertyTypes safe) */
  value?: Primitive | readonly Primitive[] | readonly [Primitive, Primitive];
};

export type PostFilterNode =
  | { and: readonly PostFilterNode[] }
  | { or: readonly PostFilterNode[] }
  | PostConditionNode;

export type PostFilterInput = PostFilterNode;

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
type PostPlain<S extends readonly PostSelectField[] | undefined, T> =
  S extends readonly PostSelectField[] ? PickByPaths<T, S> : Record<string, unknown>;

/** =========================================================================================
 *  FLUENT, STRICTLY-TYPED RESOLVER
 * =======================================================================================*/
type Shape = 'plain' | 'entity';

type ResolverState<S extends readonly PostSelectField[] | undefined, P extends Shape> = Readonly<{
  filter?: PostFilterInput;
  custom?: CustomOpRegistry;
  select?: S;
  sort?: SortSpec;
  limit?: number;
  offset?: number;
  shape: P;
  limits?: Partial<FilterLimits>;
  security?: { requireSelectableForFilter?: boolean };
}>;

export class PostResolver<
  T extends object,
  S extends readonly PostSelectField[] | undefined = undefined,
  P extends Shape = 'plain'
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
    this.em = PostResolver.getScopedEm(ctx);

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
  ): PostResolver<T, undefined, 'plain'> {
    return new PostResolver<T, undefined, 'plain'>(ctx, ctor);
  }

  static withName<T extends object>(
    ctx: MikroOrmCtx<EntityManager>,
    name: EntityName<T>,
    ctor: new (...args: never[]) => T,
  ): PostResolver<T, undefined, 'plain'> {
    return new PostResolver<T, undefined, 'plain'>(ctx, name, ctor);
  }

  /** ---------- Fluent API (immutable; narrows generics) ---------- */

  where(filter: PostFilterInput): PostResolver<T, S, P> {
    return this.clone({ filter });
  }

  whereAnd(...nodes: readonly PostFilterNode[]): PostResolver<T, S, P> {
    const next = this.state.filter
      ? ({ and: [this.state.filter, ...nodes] } as PostFilterInput)
      : (nodes.length === 1 ? nodes[0]! : ({ and: nodes } as PostFilterInput));
    return this.clone({ filter: next });
  }

  whereOr(...nodes: readonly PostFilterNode[]): PostResolver<T, S, P> {
    const next = this.state.filter
      ? ({ or: [this.state.filter, ...nodes] } as PostFilterInput)
      : (nodes.length === 1 ? nodes[0]! : ({ or: nodes } as PostFilterInput));
    return this.clone({ filter: next });
  }

  withCustomOps(registry: CustomOpRegistry): PostResolver<T, S, P> {
    return this.clone({ custom: registry });
  }

  select<SS extends readonly PostSelectField[]>(
    ...fields: SS
  ): PostResolver<T, SS, P> {
    return this.clone<SS, P>({ select: fields as SS });
  }

  selectAll(): PostResolver<T, typeof Post_SELECTABLE, P> {
    return this.clone<typeof Post_SELECTABLE, P>({ select: Post_SELECTABLE });
  }

  orderBy(field: PostSelectField, direction: 'asc' | 'desc' = 'asc'): PostResolver<T, S, P> {
    const s: SortSpec = [...(this.state.sort ?? []), { field, direction }];
    return this.clone({ sort: s });
  }

  sort(spec: SortSpec): PostResolver<T, S, P> {
    return this.clone({ sort: spec });
  }

  limit(n: number): PostResolver<T, S, P> { return this.clone({ limit: n }); }
  offset(n: number): PostResolver<T, S, P> { return this.clone({ offset: n }); }
  paginate(p: { limit?: number; offset?: number }): PostResolver<T, S, P> {
    return this.clone({ ...(p.limit !== undefined ? { limit: p.limit } : {}), ...(p.offset !== undefined ? { offset: p.offset } : {}) });
  }

  secureRequireSelectable(): PostResolver<T, S, P> {
    return this.clone({ security: { ...(this.state.security ?? {}), requireSelectableForFilter: true } });
  }

  limits(l: Partial<FilterLimits>): PostResolver<T, S, P> {
    return this.clone({ limits: l });
  }

  entityShape(): PostResolver<T, S, 'entity'> { return this.clone<S, 'entity'>({ shape: 'entity' }); }
  plainShape():  PostResolver<T, S, 'plain'>  { return this.clone<S, 'plain'>({  shape: 'plain'  }); }

  /** ---------- Execute (typed by shape & selections) ---------- */
  async execute(this: PostResolver<T, S, 'entity'>): Promise<T[]>;
  async execute(this: PostResolver<T, S, 'plain'>): Promise<PostPlain<S, T>[]>;
  async execute(): Promise<T[] | PostPlain<S, T>[]> {
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

    const where = (filter ? PostResolver.buildWhere(this.meta, filter, custom) : {}) as FilterQuery<T>;

    const orderByRecord =
      sort?.reduce<Record<string, 'asc' | 'desc'>>((acc, s) => {
        acc[s.field as string] = s.direction ?? 'asc';
        return acc;
      }, {}) ?? undefined;

    const { populate, fields } = PostResolver.buildPopulateAndFields(select);
    const populateWhereMap = PostResolver.buildPopulateWhereMap(this.meta, filter);

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
      selPaths.length ? PostResolver.projectRow(row, selPaths) : ({} as Record<string, unknown>)
    ) as PostPlain<S, T>[];

    return picked;
  }

  /** ---------- Static helpers ---------- */

  private static isGroup(n: PostFilterNode): n is { and: readonly PostFilterNode[] } | { or: readonly PostFilterNode[] } {
    return Object.prototype.hasOwnProperty.call(n, 'and') || Object.prototype.hasOwnProperty.call(n, 'or');
  }

  private static AND(parts: readonly Expr[]): Expr { return { $and: parts as Expr[] }; }
  private static OR(parts: readonly Expr[]): Expr  { return { $or: parts as Expr[] }; }
  private static mergeAnd(parts: readonly Expr[]): Expr {
    return parts.length === 0 ? {} : parts.length === 1 ? parts[0]! : PostResolver.AND(parts);
  }
  private static mergeOr(parts: readonly Expr[]): Expr {
    return parts.length === 0 ? {} : parts.length === 1 ? parts[0]! : PostResolver.OR(parts);
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
    if ('and' in ir) return PostResolver.mergeAnd(ir.and.map(PostResolver.fromIR));
    if ('or'  in ir) return PostResolver.mergeOr(ir.or.map(PostResolver.fromIR));

    const f = ir.field ?? '__FIELD__';
    const dotted = f.includes('.');

    if (ir.op === 'eq')           return dotted ? PostResolver.nest(f, ir.value as V)                 : PostResolver.wrapField(f, ir.value as V);
    if (ir.op === 'neq')          return dotted ? PostResolver.nest(f, { $ne: ir.value as V } as V)   : PostResolver.wrapField(f, { $ne: ir.value as V } as V);
    if (ir.op === 'gt')           return dotted ? PostResolver.nest(f, { $gt: ir.value as V } as V)   : PostResolver.wrapField(f, { $gt: ir.value as V } as V);
    if (ir.op === 'gte')          return dotted ? PostResolver.nest(f, { $gte: ir.value as V } as V)  : PostResolver.wrapField(f, { $gte: ir.value as V } as V);
    if (ir.op === 'lt')           return dotted ? PostResolver.nest(f, { $lt: ir.value as V } as V)   : PostResolver.wrapField(f, { $lt: ir.value as V } as V);
    if (ir.op === 'lte')          return dotted ? PostResolver.nest(f, { $lte: ir.value as V } as V)  : PostResolver.wrapField(f, { $lte: ir.value as V } as V);
    if (ir.op === 'in')           return dotted ? PostResolver.nest(f, { $in: ir.values as readonly V[] } as V)
                                                : PostResolver.wrapField(f, { $in: ir.values as readonly V[] } as V);
    if (ir.op === 'between') {
      const gte = dotted ? PostResolver.nest(f, { $gte: ir.a as V } as V) : PostResolver.wrapField(f, { $gte: ir.a as V } as V);
      const lte = dotted ? PostResolver.nest(f, { $lte: ir.b as V } as V) : PostResolver.wrapField(f, { $lte: ir.b as V } as V);
      return PostResolver.mergeAnd([gte, lte]);
    }
    if (ir.op === 'contains')     return dotted ? PostResolver.nest(f, { $like: `%${PostResolver.likeEscape(String(ir.value))}%` } as V)
                                                : PostResolver.wrapField(f, { $like: `%${PostResolver.likeEscape(String(ir.value))}%` } as V);
    if (ir.op === 'starts_with')  return dotted ? PostResolver.nest(f, { $like: `${PostResolver.likeEscape(String(ir.value))}%` } as V)
                                                : PostResolver.wrapField(f, { $like: `${PostResolver.likeEscape(String(ir.value))}%` } as V);
    if (ir.op === 'ends_with')    return dotted ? PostResolver.nest(f, { $like: `%${PostResolver.likeEscape(String(ir.value))}` } as V)
                                                : PostResolver.wrapField(f, { $like: `%${PostResolver.likeEscape(String(ir.value))}` } as V);
    if (ir.op === 'is_null')      return dotted ? PostResolver.nest(f, null as V) : PostResolver.wrapField(f, null as V);
    if (ir.op === 'is_not_null')  return dotted ? PostResolver.nest(f, { $ne: null } as V) : PostResolver.wrapField(f, { $ne: null } as V);

    throw Object.assign(new Error(`Operator '${(ir as { op: string }).op}' cannot be mapped`), {
      code: 'FILTER_OPERATOR_UNSUPPORTED',
      operator: (ir as { op: string }).op,
      field: f,
    });
  }

  private static emitCondition(
    field: string,
    fieldType: FieldType,
    cond: PostConditionNode,
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
      if (name === 'eq')           return PostResolver.nest(field, v as V);
      if (name === 'neq')          return PostResolver.nest(field, { $ne: v as V } as V);
      if (name === 'gt')           return PostResolver.nest(field, { $gt: v as V } as V);
      if (name === 'gte')          return PostResolver.nest(field, { $gte: v as V } as V);
      if (name === 'lt')           return PostResolver.nest(field, { $lt: v as V } as V);
      if (name === 'lte')          return PostResolver.nest(field, { $lte: v as V } as V);
      if (name === 'in')           return PostResolver.nest(field, { $in: v as readonly V[] } as V);
      if (name === 'between') {
        const [a, b] = v as readonly [Primitive, Primitive];
        return PostResolver.mergeAnd([PostResolver.nest(field, { $gte: a as V } as V), PostResolver.nest(field, { $lte: b as V } as V)]);
      }
      if (name === 'contains')     return PostResolver.nest(field, { $like: `%${PostResolver.likeEscape(String(v))}%` } as V);
      if (name === 'starts_with')  return PostResolver.nest(field, { $like: `${PostResolver.likeEscape(String(v))}%` } as V);
      if (name === 'ends_with')    return PostResolver.nest(field, { $like: `%${PostResolver.likeEscape(String(v))}` } as V);
      if (name === 'is_null')      return PostResolver.nest(field, null as V);
      if (name === 'is_not_null')  return PostResolver.nest(field, { $ne: null } as V);
    } else {
      if (name === 'eq')           return PostResolver.wrapField(field, v as V);
      if (name === 'neq')          return PostResolver.wrapField(field, { $ne: v as V } as V);
      if (name === 'gt')           return PostResolver.wrapField(field, { $gt: v as V } as V);
      if (name === 'gte')          return PostResolver.wrapField(field, { $gte: v as V } as V);
      if (name === 'lt')           return PostResolver.wrapField(field, { $lt: v as V } as V);
      if (name === 'lte')          return PostResolver.wrapField(field, { $lte: v as V } as V);
      if (name === 'in')           return PostResolver.wrapField(field, { $in: v as readonly V[] } as V);
      if (name === 'between') {
        const [a, b] = v as readonly [Primitive, Primitive];
        return PostResolver.mergeAnd([PostResolver.wrapField(field, { $gte: a as V } as V), PostResolver.wrapField(field, { $lte: b as V } as V)]);
      }
      if (name === 'contains')     return PostResolver.wrapField(field, { $like: `%${PostResolver.likeEscape(String(v))}%` } as V);
      if (name === 'starts_with')  return PostResolver.wrapField(field, { $like: `${PostResolver.likeEscape(String(v))}%` } as V);
      if (name === 'ends_with')    return PostResolver.wrapField(field, { $like: `%${PostResolver.likeEscape(String(v))}` } as V);
      if (name === 'is_null')      return PostResolver.wrapField(field, null as V);
      if (name === 'is_not_null')  return PostResolver.wrapField(field, { $ne: null } as V);
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

        return PostResolver.fromIR(rewrite(ir));
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
    node: PostFilterNode,
    custom?: CustomOpRegistry,
  ): Expr {
    if (PostResolver.isGroup(node)) {
      if ('and' in node) {
        const parts = node.and.map((child) => PostResolver.buildWhere(meta, child, custom)).filter((e) => Object.keys(e).length > 0);
        return PostResolver.mergeAnd(parts);
      }
      const parts = node.or.map((child) => PostResolver.buildWhere(meta, child, custom)).filter((e) => Object.keys(e).length > 0);
      return PostResolver.mergeOr(parts);
    }

    const def = meta[node.field];
    if (!def) {
      throw Object.assign(new Error(`Field '${node.field}' is not filterable`), { code: 'FILTER_FIELD_NOT_ALLOWED', field: node.field });
    }

    const allowed = def.operators as readonly string[];
    return PostResolver.emitCondition(node.field, def.type, node, custom, allowed);
  }

  private static emitRelationLeaf(
    tailField: string,
    fieldType: FieldType,
    cond: PostConditionNode,
  ): Expr {
    const name = cond.op.toLowerCase();
    const hasValue = Object.prototype.hasOwnProperty.call(cond, 'value');
    const v = hasValue ? cond.value : undefined;

    if (name === 'eq')           return PostResolver.wrapField(tailField, v as V);
    if (name === 'neq')          return PostResolver.wrapField(tailField, { $ne: v as V } as V);
    if (name === 'gt')           return PostResolver.wrapField(tailField, { $gt: v as V } as V);
    if (name === 'gte')          return PostResolver.wrapField(tailField, { $gte: v as V } as V);
    if (name === 'lt')           return PostResolver.wrapField(tailField, { $lt: v as V } as V);
    if (name === 'lte')          return PostResolver.wrapField(tailField, { $lte: v as V } as V);
    if (name === 'in')           return PostResolver.wrapField(tailField, { $in: v as readonly V[] } as V);
    if (name === 'between') {
      const [a, b] = v as readonly [Primitive, Primitive];
      return PostResolver.mergeAnd([PostResolver.wrapField(tailField, { $gte: a as V } as V), PostResolver.wrapField(tailField, { $lte: b as V } as V)]);
    }
    if (name === 'contains')     return PostResolver.wrapField(tailField, { $like: `%${PostResolver.likeEscape(String(v))}%` } as V);
    if (name === 'starts_with')  return PostResolver.wrapField(tailField, { $like: `${PostResolver.likeEscape(String(v))}%` } as V);
    if (name === 'ends_with')    return PostResolver.wrapField(tailField, { $like: `%${PostResolver.likeEscape(String(v))}` } as V);
    if (name === 'is_null')      return PostResolver.wrapField(tailField, null as V);
    if (name === 'is_not_null')  return PostResolver.wrapField(tailField, { $ne: null } as V);

    return {};
  }

  private static buildRelationWhereForRoot(
    meta: Readonly<FilterableMap>,
    root: string,
    node: PostFilterNode,
  ): Expr | undefined {
    if (PostResolver.isGroup(node)) {
      const children = ('and' in node ? node.and : node.or)
        .map((c) => PostResolver.buildRelationWhereForRoot(meta, root, c))
        .filter(PostResolver.isNonEmptyExpr);

      if (children.length === 0) return undefined;
      if (children.length === 1) return children[0]!;
      return ('and' in node) ? PostResolver.mergeAnd(children) : PostResolver.mergeOr(children);
    }

    if (!node.field.startsWith(root + '.')) return undefined;

    const tail = node.field.slice(root.length + 1);
    const def  = meta[node.field];
    if (!def) return undefined;

    return PostResolver.emitRelationLeaf(tail, def.type, node);
  }

  private static buildPopulateWhereMap(
    meta: Readonly<FilterableMap>,
    filter?: PostFilterInput,
  ): Partial<Record<PostRelationRoot, Expr>> {
    if (!filter) return {};
    const out: Partial<Record<PostRelationRoot, Expr>> = {};
    for (const root of Post_RELATIONS as readonly PostRelationRoot[]) {
      const w = PostResolver.buildRelationWhereForRoot(meta, root, filter);
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

  private static buildPopulateAndFields(select?: readonly PostSelectField[]): {
    populate?: readonly PostRelationRoot[];
    fields?: readonly string[];
  } {
    if (!select || select.length === 0) return {};

    const relSet = new Set<string>(Post_RELATIONS as readonly string[]);
    const populateRoots = new Set<PostRelationRoot>();
    const scalar: string[] = [];
    const dotted: string[] = [];

    for (const s of select as readonly string[]) {
      const dot = s.indexOf('.');
      if (dot > 0) {
        const root  = s.slice(0, dot) as PostRelationRoot;
        if (relSet.has(root)) {
          populateRoots.add(root);
          dotted.push(s);
        } else {
          scalar.push(s);
        }
      } else {
        if (relSet.has(s)) {
          populateRoots.add(s as PostRelationRoot);
        } else {
          scalar.push(s);
        }
      }
    }

    const uniq = (arr: string[]) => Array.from(new Set(arr));
    const fieldsFlat = uniq([...scalar, ...dotted]);

    const result: {
      populate?: readonly PostRelationRoot[];
      fields?: readonly string[];
    } = {};

    if (populateRoots.size > 0) result.populate = Array.from(populateRoots) as readonly PostRelationRoot[];
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
        if (!PostResolver.isRecord(src)) break;

        const isLast = i === keys.length - 1;
        const next = (src as any)[k];

        if (isLast) {
          const maybeArr = PostResolver.asArray(src);
          if (maybeArr) {
            dst[k] = maybeArr.map((item) => (PostResolver.isRecord(item) ? (item as any)[k] : undefined));
          } else {
            dst[k] = next;
          }
          continue;
        }

        const arr = PostResolver.asArray(next);
        if (arr) {
          const tail = keys.slice(i + 1).join('.');
          dst[k] = arr.map((item) => PostResolver.projectRow(item as object, [tail]));
          break;
        } else {
          if (!PostResolver.isRecord(dst[k])) dst[k] = {};
          dst = dst[k] as Record<string, unknown>;
          src = next;
        }
      }
    }

    return out;
  }

  /** ---------- Tiny internal immutability helper ---------- */
  private clone<SS extends readonly PostSelectField[] | undefined = S, PP extends Shape = P>(
    patch: Partial<ResolverState<SS, PP>>,
  ): PostResolver<T, SS, PP> {
    const next = {
      ...(this.state as unknown as ResolverState<SS, PP>),
      ...(patch as Partial<ResolverState<SS, PP>>),
    } as ResolverState<SS, PP>;
    return new PostResolver<T, SS, PP>(this.ctx, this.entityName, this.ctor, next);
  }

  /** ---------- Handy condition builder (typed & exactOptionalPropertyTypes-safe) ---------- */
  static cond(field: PostSelectField, op: Operator): Omit<PostConditionNode, 'value'>;
  static cond(field: PostSelectField, op: Operator, value: PostConditionNode['value']): PostConditionNode;
  static cond(field: PostSelectField, op: Operator, value?: PostConditionNode['value']): PostConditionNode {
    const base = { field, op } as Omit<PostConditionNode, 'value'>;
    return value === undefined ? base as PostConditionNode : { ...base, value };
  }
}
