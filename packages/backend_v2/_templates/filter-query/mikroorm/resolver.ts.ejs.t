---
to: <%= out %>/<%= entity %>Resolver.ts
---
<%
function parseArg(val, fallback) {
  try {
    if (val === undefined || val === null) return fallback;
    if (typeof val === 'string') return JSON.parse(val);
    return val;
  } catch (_) {
    return fallback;
  }
}

const FIELDS    = parseArg(fields, []);     // [{ name, type, operators, enumValues }]
const SELECTS   = parseArg(selects, []);    // string[]
const RELATIONS = parseArg(relations, []);  // string[]

const ENTITY_ONLY_OPS = Array.from(new Set(
  FIELDS.flatMap(f => Array.isArray(f.operators) ? f.operators : [])
));

// Safe superset for relation-usable ops
const RELATION_SAFE_OPS = [
  'eq','neq','in',
  'gt','gte','lt','lte',
  'between',
  'contains','starts_with','ends_with',
  'is_null','is_not_null',
];

const MERGED_ENTITY_OPS = Array.from(new Set([...ENTITY_ONLY_OPS, ...RELATION_SAFE_OPS])).sort();
%>
/* THIS FILE IS AUTO-GENERATED. DO NOT EDIT. */

import type { EntityName, FindOptions, FilterQuery, EntityManager } from '@mikro-orm/core';
import type { FilterInput as BaseFilterInput, Primitive } from 'src/filtering/ast';
import { getFilterableMetadata, type FilterableMap, type FieldType } from 'src/filtering/filterable';
import { CustomOpRegistry, type IR } from 'src/filtering/custom-ops';
import { validateFilter } from 'src/filtering/validate';
import { getSelectableFields } from 'src/filtering/expose';
import { type FilterLimits } from 'src/filtering/limits';
import type { <%= entity %>Expr as Expr } from './<%= entity %>FilterQuery';
import type { MikroOrmCtx } from 'src/filtering/runtime/driver';
import type { CommonResolverApi } from 'src/filtering/runtime/resolver-api';

/** ======================= Compile-time entity-scoped constants ======================= */
export const <%= entity %>_SELECTABLE = <%- JSON.stringify(SELECTS) %> as const;
type Fallback<A, B> = [A] extends [never] ? B : A;
export type <%= entity %>SelectField = Fallback<typeof <%= entity %>_SELECTABLE[number], string>;

export const <%= entity %>_RELATIONS = <%- JSON.stringify(RELATIONS) %> as const;
export type <%= entity %>RelationRoot = Fallback<typeof <%= entity %>_RELATIONS[number], string>;

export const <%= entity %>_OPS = <%- JSON.stringify(MERGED_ENTITY_OPS) %> as const;
type Operator = typeof <%= entity %>_OPS[number];
type SortSpec = ReadonlyArray<{ field: <%= entity %>SelectField; direction?: 'asc' | 'desc' }>;

/** ======================= Strong filter typing for this entity ======================= */
export type <%= entity %>FieldName = <%= entity %>SelectField;

export type <%= entity %>ConditionNode = {
  field: <%= entity %>FieldName;
  op: Operator;
  /** present only when provided (exactOptionalPropertyTypes safe) */
  value?: Primitive | readonly Primitive[] | readonly [Primitive, Primitive];
};

export type <%= entity %>FilterNode =
  | { and: readonly <%= entity %>FilterNode[] }
  | { or: readonly <%= entity %>FilterNode[] }
  | <%= entity %>ConditionNode;

export type <%= entity %>FilterInput = <%= entity %>FilterNode;

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
type <%= entity %>Plain<S extends readonly <%= entity %>SelectField[] | undefined, T> =
  S extends readonly <%= entity %>SelectField[] ? PickByPaths<T, S> : Record<string, unknown>;

/** =========================================================================================
 *  FLUENT, STRICTLY-TYPED RESOLVER (implements CommonResolverApi)
 * =======================================================================================*/
type Shape = 'plain' | 'entity';

type ResolverState<S extends readonly <%= entity %>SelectField[] | undefined, P extends Shape> = Readonly<{
  filter?: <%= entity %>FilterInput;
  custom?: CustomOpRegistry;
  select?: S;
  sort?: SortSpec;
  limit?: number;
  offset?: number;
  shape: P;
  limits?: Partial<FilterLimits>;
  security?: { requireSelectableForFilter?: boolean };
}>;

export class <%= entity %>Resolver<
  T extends object,
  S extends readonly <%= entity %>SelectField[] | undefined = undefined,
  P extends Shape = 'plain'
> implements CommonResolverApi<
  <%= entity %>SelectField,
  <%= entity %>FilterInput,
  S,
  P,
  <%= entity %>Plain<S, T>,
  T
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
    this.em = <%= entity %>Resolver.getScopedEm(ctx);

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
  ): <%= entity %>Resolver<T, undefined, 'plain'> {
    return new <%= entity %>Resolver<T, undefined, 'plain'>(ctx, ctor);
  }

  static withName<T extends object>(
    ctx: MikroOrmCtx<EntityManager>,
    name: EntityName<T>,
    ctor: new (...args: never[]) => T,
  ): <%= entity %>Resolver<T, undefined, 'plain'> {
    return new <%= entity %>Resolver<T, undefined, 'plain'>(ctx, name, ctor);
  }

  /** ---------- Fluent API (immutable; implements CommonResolverApi while keeping narrowing) ---------- */

  /** Replace filter */
  where(filter: <%= entity %>FilterInput): this;
  where(filter: <%= entity %>FilterInput): <%= entity %>Resolver<T, S, P>;
  where(filter: <%= entity %>FilterInput) {
    return this.clone({ filter }) as any;
  }

  /** AND with existing filter */
  whereAnd(...nodes: readonly <%= entity %>FilterInput[]): this;
  whereAnd(...nodes: readonly <%= entity %>FilterNode[]): <%= entity %>Resolver<T, S, P>;
  whereAnd(...nodes: readonly <%= entity %>FilterNode[]) {
    const next = this.state.filter
      ? ({ and: [this.state.filter, ...nodes] } as <%= entity %>FilterInput)
      : (nodes.length === 1 ? nodes[0]! : ({ and: nodes } as <%= entity %>FilterInput));
    return this.clone({ filter: next }) as any;
  }

  /** OR with existing filter */
  whereOr(...nodes: readonly <%= entity %>FilterInput[]): this;
  whereOr(...nodes: readonly <%= entity %>FilterNode[]): <%= entity %>Resolver<T, S, P>;
  whereOr(...nodes: readonly <%= entity %>FilterNode[]) {
    const next = this.state.filter
      ? ({ or: [this.state.filter, ...nodes] } as <%= entity %>FilterInput)
      : (nodes.length === 1 ? nodes[0]! : ({ or: nodes } as <%= entity %>FilterInput));
    return this.clone({ filter: next }) as any;
  }

  /** Custom operators registry */
  withCustomOps(registry: CustomOpRegistry): this;
  withCustomOps(registry: CustomOpRegistry): <%= entity %>Resolver<T, S, P>;
  withCustomOps(registry: CustomOpRegistry) {
    return this.clone({ custom: registry }) as any;
  }

  /** Selection (typed narrowing + interface-compatible 'this' signature) */
  select<SS extends readonly <%= entity %>SelectField[]>(...fields: SS): this;
  select<SS extends readonly <%= entity %>SelectField[]>(...fields: SS): <%= entity %>Resolver<T, SS, P>;
  select(...fields: readonly <%= entity %>SelectField[]) {
    return this.clone({ select: fields as any }) as any;
  }

  selectAll(): this;
  selectAll(): <%= entity %>Resolver<T, typeof <%= entity %>_SELECTABLE, P>;
  selectAll() {
    return this.clone({ select: <%= entity %>_SELECTABLE }) as any;
  }

  /** Sorting / pagination */
  orderBy(field: <%= entity %>SelectField, direction: 'asc' | 'desc' = 'asc'): this {
    const s: SortSpec = [...(this.state.sort ?? []), { field, direction }];
    return this.clone({ sort: s }) as this;
  }
  sort(spec: SortSpec): this { return this.clone({ sort: spec }) as this; }

  limit(n: number): this { return this.clone({ limit: n }) as this; }
  offset(n: number): this { return this.clone({ offset: n }) as this; }
  paginate(p: { limit?: number; offset?: number }): this {
    return this.clone({
      ...(p.limit  !== undefined ? { limit:  p.limit  } : {}),
      ...(p.offset !== undefined ? { offset: p.offset } : {}),
    }) as this;
  }

  /** Security / limits */
  secureRequireSelectable(): this {
    return this.clone({ security: { ...(this.state.security ?? {}), requireSelectableForFilter: true } }) as this;
  }
  limits(l: Partial<FilterLimits>): this { return this.clone({ limits: l }) as this; }

  /** Shape toggles — flip type-level shape for execute() */
  entityShape(): this;
  entityShape(): <%= entity %>Resolver<T, S, 'entity'>;
  entityShape() { return this.clone<S, 'entity'>({ shape: 'entity' }) as any; }

  plainShape(): this;
  plainShape(): <%= entity %>Resolver<T, S, 'plain'>;
  plainShape()  { return this.clone<S, 'plain'>({  shape: 'plain'  }) as any; }

  /** ---------- Execute (typed by shape & selections) ---------- */
  async execute(this: <%= entity %>Resolver<T, S, 'entity'>): Promise<T[]>;
  async execute(this: <%= entity %>Resolver<T, S, 'plain'>): Promise<<%= entity %>Plain<S, T>[]>;
  async execute(): Promise<T[] | <%= entity %>Plain<S, T>[]> {
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

    const where = (filter ? <%= entity %>Resolver.buildWhere(this.meta, filter, custom) : {}) as FilterQuery<T>;

    const orderByRecord =
      sort?.reduce<Record<string, 'asc' | 'desc'>>((acc, s) => {
        acc[s.field as string] = s.direction ?? 'asc';
        return acc;
      }, {}) ?? undefined;

    const { populate, fields } = <%= entity %>Resolver.buildPopulateAndFields(select);
    const populateWhereMap = <%= entity %>Resolver.buildPopulateWhereMap(this.meta, filter);

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
      selPaths.length ? <%= entity %>Resolver.projectRow(row, selPaths) : ({} as Record<string, unknown>)
    ) as <%= entity %>Plain<S, T>[];

    return picked;
  }

  /** ---------- Static helpers ---------- */

  private static isGroup(n: <%= entity %>FilterNode): n is { and: readonly <%= entity %>FilterNode[] } | { or: readonly <%= entity %>FilterNode[] } {
    return Object.prototype.hasOwnProperty.call(n, 'and') || Object.prototype.hasOwnProperty.call(n, 'or');
  }

  private static AND(parts: readonly Expr[]): Expr { return { $and: parts as Expr[] }; }
  private static OR(parts: readonly Expr[]): Expr  { return { $or: parts as Expr[] }; }
  private static mergeAnd(parts: readonly Expr[]): Expr {
    return parts.length === 0 ? {} : parts.length === 1 ? parts[0]! : <%= entity %>Resolver.AND(parts);
  }
  private static mergeOr(parts: readonly Expr[]): Expr {
    return parts.length === 0 ? {} : parts.length === 1 ? parts[0]! : <%= entity %>Resolver.OR(parts);
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
    if ('and' in ir) return <%= entity %>Resolver.mergeAnd(ir.and.map(<%= entity %>Resolver.fromIR));
    if ('or'  in ir) return <%= entity %>Resolver.mergeOr(ir.or.map(<%= entity %>Resolver.fromIR));

    const f = ir.field ?? '__FIELD__';
    const dotted = f.includes('.');

    if (ir.op === 'eq')           return dotted ? <%= entity %>Resolver.nest(f, ir.value as V)                 : <%= entity %>Resolver.wrapField(f, ir.value as V);
    if (ir.op === 'neq')          return dotted ? <%= entity %>Resolver.nest(f, { $ne: ir.value as V } as V)   : <%= entity %>Resolver.wrapField(f, { $ne: ir.value as V } as V);
    if (ir.op === 'gt')           return dotted ? <%= entity %>Resolver.nest(f, { $gt: ir.value as V } as V)   : <%= entity %>Resolver.wrapField(f, { $gt: ir.value as V } as V);
    if (ir.op === 'gte')          return dotted ? <%= entity %>Resolver.nest(f, { $gte: ir.value as V } as V)  : <%= entity %>Resolver.wrapField(f, { $gte: ir.value as V } as V);
    if (ir.op === 'lt')           return dotted ? <%= entity %>Resolver.nest(f, { $lt: ir.value as V } as V)   : <%= entity %>Resolver.wrapField(f, { $lt: ir.value as V } as V);
    if (ir.op === 'lte')          return dotted ? <%= entity %>Resolver.nest(f, { $lte: ir.value as V } as V)  : <%= entity %>Resolver.wrapField(f, { $lte: ir.value as V } as V);
    if (ir.op === 'in')           return dotted ? <%= entity %>Resolver.nest(f, { $in: ir.values as readonly V[] } as V)
                                                : <%= entity %>Resolver.wrapField(f, { $in: ir.values as readonly V[] } as V);
    if (ir.op === 'between') {
      const gte = dotted ? <%= entity %>Resolver.nest(f, { $gte: ir.a as V } as V) : <%= entity %>Resolver.wrapField(f, { $gte: ir.a as V } as V);
      const lte = dotted ? <%= entity %>Resolver.nest(f, { $lte: ir.b as V } as V) : <%= entity %>Resolver.wrapField(f, { $lte: ir.b as V } as V);
      return <%= entity %>Resolver.mergeAnd([gte, lte]);
    }
    if (ir.op === 'contains')     return dotted ? <%= entity %>Resolver.nest(f, { $like: `%${<%= entity %>Resolver.likeEscape(String(ir.value))}%` } as V)
                                                : <%= entity %>Resolver.wrapField(f, { $like: `%${<%= entity %>Resolver.likeEscape(String(ir.value))}%` } as V);
    if (ir.op === 'starts_with')  return dotted ? <%= entity %>Resolver.nest(f, { $like: `${<%= entity %>Resolver.likeEscape(String(ir.value))}%` } as V)
                                                : <%= entity %>Resolver.wrapField(f, { $like: `${<%= entity %>Resolver.likeEscape(String(ir.value))}%` } as V);
    if (ir.op === 'ends_with')    return dotted ? <%= entity %>Resolver.nest(f, { $like: `%${<%= entity %>Resolver.likeEscape(String(ir.value))}` } as V)
                                                : <%= entity %>Resolver.wrapField(f, { $like: `%${<%= entity %>Resolver.likeEscape(String(ir.value))}` } as V);
    if (ir.op === 'is_null')      return dotted ? <%= entity %>Resolver.nest(f, null as V) : <%= entity %>Resolver.wrapField(f, null as V);
    if (ir.op === 'is_not_null')  return dotted ? <%= entity %>Resolver.nest(f, { $ne: null } as V) : <%= entity %>Resolver.wrapField(f, { $ne: null } as V);

    throw Object.assign(new Error(`Operator '${(ir as { op: string }).op}' cannot be mapped`), {
      code: 'FILTER_OPERATOR_UNSUPPORTED',
      operator: (ir as { op: string }).op,
      field: f,
    });
  }

  private static emitCondition(
    field: string,
    fieldType: FieldType,
    cond: <%= entity %>ConditionNode,
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
      if (name === 'eq')           return <%= entity %>Resolver.nest(field, v as V);
      if (name === 'neq')          return <%= entity %>Resolver.nest(field, { $ne: v as V } as V);
      if (name === 'gt')           return <%= entity %>Resolver.nest(field, { $gt: v as V } as V);
      if (name === 'gte')          return <%= entity %>Resolver.nest(field, { $gte: v as V } as V);
      if (name === 'lt')           return <%= entity %>Resolver.nest(field, { $lt: v as V } as V);
      if (name === 'lte')          return <%= entity %>Resolver.nest(field, { $lte: v as V } as V);
      if (name === 'in')           return <%= entity %>Resolver.nest(field, { $in: v as readonly V[] } as V);
      if (name === 'between') {
        const [a, b] = v as readonly [Primitive, Primitive];
        return <%= entity %>Resolver.mergeAnd([<%= entity %>Resolver.nest(field, { $gte: a as V } as V), <%= entity %>Resolver.nest(field, { $lte: b as V } as V)]);
      }
      if (name === 'contains')     return <%= entity %>Resolver.nest(field, { $like: `%${<%= entity %>Resolver.likeEscape(String(v))}%` } as V);
      if (name === 'starts_with')  return <%= entity %>Resolver.nest(field, { $like: `${<%= entity %>Resolver.likeEscape(String(v))}%` } as V);
      if (name === 'ends_with')    return <%= entity %>Resolver.nest(field, { $like: `%${<%= entity %>Resolver.likeEscape(String(v))}` } as V);
      if (name === 'is_null')      return <%= entity %>Resolver.nest(field, null as V);
      if (name === 'is_not_null')  return <%= entity %>Resolver.nest(field, { $ne: null } as V);
    } else {
      if (name === 'eq')           return <%= entity %>Resolver.wrapField(field, v as V);
      if (name === 'neq')          return <%= entity %>Resolver.wrapField(field, { $ne: v as V } as V);
      if (name === 'gt')           return <%= entity %>Resolver.wrapField(field, { $gt: v as V } as V);
      if (name === 'gte')          return <%= entity %>Resolver.wrapField(field, { $gte: v as V } as V);
      if (name === 'lt')           return <%= entity %>Resolver.wrapField(field, { $lt: v as V } as V);
      if (name === 'lte')          return <%= entity %>Resolver.wrapField(field, { $lte: v as V } as V);
      if (name === 'in')           return <%= entity %>Resolver.wrapField(field, { $in: v as readonly V[] } as V);
      if (name === 'between') {
        const [a, b] = v as readonly [Primitive, Primitive];
        return <%= entity %>Resolver.mergeAnd([<%= entity %>Resolver.wrapField(field, { $gte: a as V } as V), <%= entity %>Resolver.wrapField(field, { $lte: b as V } as V)]);
      }
      if (name === 'contains')     return <%= entity %>Resolver.wrapField(field, { $like: `%${<%= entity %>Resolver.likeEscape(String(v))}%` } as V);
      if (name === 'starts_with')  return <%= entity %>Resolver.wrapField(field, { $like: `${<%= entity %>Resolver.likeEscape(String(v))}%` } as V);
      if (name === 'ends_with')    return <%= entity %>Resolver.wrapField(field, { $like: `%${<%= entity %>Resolver.likeEscape(String(v))}` } as V);
      if (name === 'is_null')      return <%= entity %>Resolver.wrapField(field, null as V);
      if (name === 'is_not_null')  return <%= entity %>Resolver.wrapField(field, { $ne: null } as V);
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

        return <%= entity %>Resolver.fromIR(rewrite(ir));
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
    node: <%= entity %>FilterNode,
    custom?: CustomOpRegistry,
  ): Expr {
    if (<%= entity %>Resolver.isGroup(node)) {
      if ('and' in node) {
        const parts = node.and.map((child) => <%= entity %>Resolver.buildWhere(meta, child, custom)).filter((e) => Object.keys(e).length > 0);
        return <%= entity %>Resolver.mergeAnd(parts);
      }
      const parts = node.or.map((child) => <%= entity %>Resolver.buildWhere(meta, child, custom)).filter((e) => Object.keys(e).length > 0);
      return <%= entity %>Resolver.mergeOr(parts);
    }

    const def = meta[node.field];
    if (!def) {
      throw Object.assign(new Error(`Field '${node.field}' is not filterable`), { code: 'FILTER_FIELD_NOT_ALLOWED', field: node.field });
    }

    const allowed = def.operators as readonly string[];
    return <%= entity %>Resolver.emitCondition(node.field, def.type, node, custom, allowed);
  }

  private static emitRelationLeaf(
    tailField: string,
    _fieldType: FieldType,
    cond: <%= entity %>ConditionNode,
  ): Expr {
    const name = cond.op.toLowerCase();
    const hasValue = Object.prototype.hasOwnProperty.call(cond, 'value');
    const v = hasValue ? cond.value : undefined;

    if (name === 'eq')           return <%= entity %>Resolver.wrapField(tailField, v as V);
    if (name === 'neq')          return <%= entity %>Resolver.wrapField(tailField, { $ne: v as V } as V);
    if (name === 'gt')           return <%= entity %>Resolver.wrapField(tailField, { $gt: v as V } as V);
    if (name === 'gte')          return <%= entity %>Resolver.wrapField(tailField, { $gte: v as V } as V);
    if (name === 'lt')           return <%= entity %>Resolver.wrapField(tailField, { $lt: v as V } as V);
    if (name === 'lte')          return <%= entity %>Resolver.wrapField(tailField, { $lte: v as V } as V);
    if (name === 'in')           return <%= entity %>Resolver.wrapField(tailField, { $in: v as readonly V[] } as V);
    if (name === 'between') {
      const [a, b] = v as readonly [Primitive, Primitive];
      return <%= entity %>Resolver.mergeAnd([<%= entity %>Resolver.wrapField(tailField, { $gte: a as V } as V), <%= entity %>Resolver.wrapField(tailField, { $lte: b as V } as V)]);
    }
    if (name === 'contains')     return <%= entity %>Resolver.wrapField(tailField, { $like: `%${<%= entity %>Resolver.likeEscape(String(v))}%` } as V);
    if (name === 'starts_with')  return <%= entity %>Resolver.wrapField(tailField, { $like: `${<%= entity %>Resolver.likeEscape(String(v))}%` } as V);
    if (name === 'ends_with')    return <%= entity %>Resolver.wrapField(tailField, { $like: `%${<%= entity %>Resolver.likeEscape(String(v))}` } as V);
    if (name === 'is_null')      return <%= entity %>Resolver.wrapField(tailField, null as V);
    if (name === 'is_not_null')  return <%= entity %>Resolver.wrapField(tailField, { $ne: null } as V);

    return {};
  }

  private static buildRelationWhereForRoot(
    meta: Readonly<FilterableMap>,
    root: string,
    node: <%= entity %>FilterNode,
  ): Expr | undefined {
    if (<%= entity %>Resolver.isGroup(node)) {
      const children = ('and' in node ? node.and : node.or)
        .map((c) => <%= entity %>Resolver.buildRelationWhereForRoot(meta, root, c))
        .filter(<%= entity %>Resolver.isNonEmptyExpr);

      if (children.length === 0) return undefined;
      if (children.length === 1) return children[0]!;
      return ('and' in node) ? <%= entity %>Resolver.mergeAnd(children) : <%= entity %>Resolver.mergeOr(children);
    }

    if (!node.field.startsWith(root + '.')) return undefined;

    const tail = node.field.slice(root.length + 1);
    const def  = meta[node.field];
    if (!def) return undefined;

    return <%= entity %>Resolver.emitRelationLeaf(tail, def.type, node);
  }

  private static buildPopulateWhereMap(
    meta: Readonly<FilterableMap>,
    filter?: <%= entity %>FilterInput,
  ): Partial<Record<<%= entity %>RelationRoot, Expr>> {
    if (!filter) return {};
    const out: Partial<Record<<%= entity %>RelationRoot, Expr>> = {};
    for (const root of <%= entity %>_RELATIONS as readonly <%= entity %>RelationRoot[]) {
      const w = <%= entity %>Resolver.buildRelationWhereForRoot(meta, root, filter);
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

  private static buildPopulateAndFields(select?: readonly <%= entity %>SelectField[]): {
    populate?: readonly <%= entity %>RelationRoot[];
    fields?: readonly string[];
  } {
    if (!select || select.length === 0) return {};

    const relSet = new Set<string>(<%= entity %>_RELATIONS as readonly string[]);
    const populateRoots = new Set<<%= entity %>RelationRoot>();
    const scalar: string[] = [];
    const dotted: string[] = [];

    for (const s of select as readonly string[]) {
      const dot = s.indexOf('.');
      if (dot > 0) {
        const root  = s.slice(0, dot) as <%= entity %>RelationRoot;
        if (relSet.has(root)) {
          populateRoots.add(root);
          dotted.push(s);
        } else {
          scalar.push(s);
        }
      } else {
        if (relSet.has(s)) {
          populateRoots.add(s as <%= entity %>RelationRoot);
        } else {
          scalar.push(s);
        }
      }
    }

    const uniq = (arr: string[]) => Array.from(new Set(arr));
    const fieldsFlat = uniq([...scalar, ...dotted]);

    const result: {
      populate?: readonly <%= entity %>RelationRoot[];
      fields?: readonly string[];
    } = {};

    if (populateRoots.size > 0) result.populate = Array.from(populateRoots) as readonly <%= entity %>RelationRoot[];
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
        if (!<%= entity %>Resolver.isRecord(src)) break;

        const isLast = i === keys.length - 1;
        const next = (src as any)[k];

        if (isLast) {
          const maybeArr = <%= entity %>Resolver.asArray(src);
          if (maybeArr) {
            dst[k] = maybeArr.map((item) => (<%= entity %>Resolver.isRecord(item) ? (item as any)[k] : undefined));
          } else {
            dst[k] = next;
          }
          continue;
        }

        const arr = <%= entity %>Resolver.asArray(next);
        if (arr) {
          const tail = keys.slice(i + 1).join('.');
          dst[k] = arr.map((item) => <%= entity %>Resolver.projectRow(item as object, [tail]));
          break;
        } else {
          if (!<%= entity %>Resolver.isRecord(dst[k])) dst[k] = {};
          dst = dst[k] as Record<string, unknown>;
          src = next;
        }
      }
    }

    return out;
  }

  /** ---------- Tiny internal immutability helper ---------- */
  private clone<SS extends readonly <%= entity %>SelectField[] | undefined = S, PP extends Shape = P>(
    patch: Partial<ResolverState<SS, PP>>,
  ): <%= entity %>Resolver<T, SS, PP> {
    const next = {
      ...(this.state as unknown as ResolverState<SS, PP>),
      ...(patch as Partial<ResolverState<SS, PP>>),
    } as ResolverState<SS, PP>;
    return new <%= entity %>Resolver<T, SS, PP>(this.ctx, this.entityName, this.ctor, next);
  }

  /** ---------- Handy condition builder (typed & exactOptionalPropertyTypes-safe) ---------- */
  static cond(field: <%= entity %>SelectField, op: Operator): Omit<<%= entity %>ConditionNode, 'value'>;
  static cond(field: <%= entity %>SelectField, op: Operator, value: <%= entity %>ConditionNode['value']): <%= entity %>ConditionNode;
  static cond(field: <%= entity %>SelectField, op: Operator, value?: <%= entity %>ConditionNode['value']): <%= entity %>ConditionNode {
    const base = { field, op } as Omit<<%= entity %>ConditionNode, 'value'>;
    return value === undefined ? base as <%= entity %>ConditionNode : { ...base, value };
  }
}
