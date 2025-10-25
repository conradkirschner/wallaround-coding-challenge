
/* THIS FILE IS AUTO-GENERATED. DO NOT EDIT. */

import type { EntityName, FindOptions, FilterQuery, EntityManager } from '@mikro-orm/core';
import type { FilterInput as BaseFilterInput, Primitive } from 'src/filtering/ast';
import { getFilterableMetadata, type FilterableMap, type FieldType } from 'src/filtering/filterable';
import { CustomOpRegistry, type IR } from 'src/filtering/custom-ops';
import { validateFilter } from 'src/filtering/validate';
import { getSelectableFields } from 'src/filtering/expose';
import { type FilterLimits } from 'src/filtering/limits';
import type { AddressExpr as Expr } from './AddressFilterQuery';
import type { MikroOrmCtx } from 'src/filtering/runtime/driver';
import type { CommonResolverApi } from 'src/filtering/runtime/resolver-api';

/** ======================= Compile-time entity-scoped constants ======================= */
export const Address_SELECTABLE = ["city","country","createdAt","id","postalCode","street1","street2","updatedAt"] as const;
type Fallback<A, B> = [A] extends [never] ? B : A;
export type AddressSelectField = Fallback<typeof Address_SELECTABLE[number], string>;

export const Address_RELATIONS = [] as const;
export type AddressRelationRoot = Fallback<typeof Address_RELATIONS[number], string>;

export const Address_OPS = ["between","contains","ends_with","eq","gt","gte","in","is_not_null","is_null","lt","lte","neq","starts_with"] as const;
type Operator = typeof Address_OPS[number];
type SortSpec = ReadonlyArray<{ field: AddressSelectField; direction?: 'asc' | 'desc' }>;

/** ======================= Strong filter typing for this entity ======================= */
export type AddressFieldName = AddressSelectField;

export type AddressConditionNode = {
  field: AddressFieldName;
  op: Operator;
  /** present only when provided (exactOptionalPropertyTypes safe) */
  value?: Primitive | readonly Primitive[] | readonly [Primitive, Primitive];
};

export type AddressFilterNode =
  | { and: readonly AddressFilterNode[] }
  | { or: readonly AddressFilterNode[] }
  | AddressConditionNode;

export type AddressFilterInput = AddressFilterNode;

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
type AddressPlain<S extends readonly AddressSelectField[] | undefined, T> =
  S extends readonly AddressSelectField[] ? PickByPaths<T, S> : Record<string, unknown>;

/** =========================================================================================
 *  FLUENT, STRICTLY-TYPED RESOLVER (implements CommonResolverApi)
 * =======================================================================================*/
type Shape = 'plain' | 'entity';

type ResolverState<S extends readonly AddressSelectField[] | undefined, P extends Shape> = Readonly<{
  filter?: AddressFilterInput;
  custom?: CustomOpRegistry;
  select?: S;
  sort?: SortSpec;
  limit?: number;
  offset?: number;
  shape: P;
  limits?: Partial<FilterLimits>;
  security?: { requireSelectableForFilter?: boolean };
}>;

export class AddressResolver<
  T extends object,
  S extends readonly AddressSelectField[] | undefined = undefined,
  P extends Shape = 'plain'
> implements CommonResolverApi<
  AddressSelectField,
  AddressFilterInput,
  S,
  P,
  AddressPlain<S, T>,
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
    this.em = AddressResolver.getScopedEm(ctx);

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
  ): AddressResolver<T, undefined, 'plain'> {
    return new AddressResolver<T, undefined, 'plain'>(ctx, ctor);
  }

  static withName<T extends object>(
    ctx: MikroOrmCtx<EntityManager>,
    name: EntityName<T>,
    ctor: new (...args: never[]) => T,
  ): AddressResolver<T, undefined, 'plain'> {
    return new AddressResolver<T, undefined, 'plain'>(ctx, name, ctor);
  }

  /** ---------- Fluent API (immutable; implements CommonResolverApi while keeping narrowing) ---------- */

  /** Replace filter */
  where(filter: AddressFilterInput): this;
  where(filter: AddressFilterInput): AddressResolver<T, S, P>;
  where(filter: AddressFilterInput) {
    return this.clone({ filter }) as any;
  }

  /** AND with existing filter */
  whereAnd(...nodes: readonly AddressFilterInput[]): this;
  whereAnd(...nodes: readonly AddressFilterNode[]): AddressResolver<T, S, P>;
  whereAnd(...nodes: readonly AddressFilterNode[]) {
    const next = this.state.filter
      ? ({ and: [this.state.filter, ...nodes] } as AddressFilterInput)
      : (nodes.length === 1 ? nodes[0]! : ({ and: nodes } as AddressFilterInput));
    return this.clone({ filter: next }) as any;
  }

  /** OR with existing filter */
  whereOr(...nodes: readonly AddressFilterInput[]): this;
  whereOr(...nodes: readonly AddressFilterNode[]): AddressResolver<T, S, P>;
  whereOr(...nodes: readonly AddressFilterNode[]) {
    const next = this.state.filter
      ? ({ or: [this.state.filter, ...nodes] } as AddressFilterInput)
      : (nodes.length === 1 ? nodes[0]! : ({ or: nodes } as AddressFilterInput));
    return this.clone({ filter: next }) as any;
  }

  /** Custom operators registry */
  withCustomOps(registry: CustomOpRegistry): this;
  withCustomOps(registry: CustomOpRegistry): AddressResolver<T, S, P>;
  withCustomOps(registry: CustomOpRegistry) {
    return this.clone({ custom: registry }) as any;
  }

  /** Selection (typed narrowing + interface-compatible 'this' signature) */
  select<SS extends readonly AddressSelectField[]>(...fields: SS): this;
  select<SS extends readonly AddressSelectField[]>(...fields: SS): AddressResolver<T, SS, P>;
  select(...fields: readonly AddressSelectField[]) {
    return this.clone({ select: fields as any }) as any;
  }

  selectAll(): this;
  selectAll(): AddressResolver<T, typeof Address_SELECTABLE, P>;
  selectAll() {
    return this.clone({ select: Address_SELECTABLE }) as any;
  }

  /** Sorting / pagination */
  orderBy(field: AddressSelectField, direction: 'asc' | 'desc' = 'asc'): this {
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
  entityShape(): AddressResolver<T, S, 'entity'>;
  entityShape() { return this.clone<S, 'entity'>({ shape: 'entity' }) as any; }

  plainShape(): this;
  plainShape(): AddressResolver<T, S, 'plain'>;
  plainShape()  { return this.clone<S, 'plain'>({  shape: 'plain'  }) as any; }

  /** ---------- Execute (typed by shape & selections) ---------- */
  async execute(this: AddressResolver<T, S, 'entity'>): Promise<T[]>;
  async execute(this: AddressResolver<T, S, 'plain'>): Promise<AddressPlain<S, T>[]>;
  async execute(): Promise<T[] | AddressPlain<S, T>[]> {
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

    const where = (filter ? AddressResolver.buildWhere(this.meta, filter, custom) : {}) as FilterQuery<T>;

    const orderByRecord =
      sort?.reduce<Record<string, 'asc' | 'desc'>>((acc, s) => {
        acc[s.field as string] = s.direction ?? 'asc';
        return acc;
      }, {}) ?? undefined;

    const { populate, fields } = AddressResolver.buildPopulateAndFields(select);
    const populateWhereMap = AddressResolver.buildPopulateWhereMap(this.meta, filter);

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
      selPaths.length ? AddressResolver.projectRow(row, selPaths) : ({} as Record<string, unknown>)
    ) as AddressPlain<S, T>[];

    return picked;
  }

  /** ---------- Static helpers ---------- */

  private static isGroup(n: AddressFilterNode): n is { and: readonly AddressFilterNode[] } | { or: readonly AddressFilterNode[] } {
    return Object.prototype.hasOwnProperty.call(n, 'and') || Object.prototype.hasOwnProperty.call(n, 'or');
  }

  private static AND(parts: readonly Expr[]): Expr { return { $and: parts as Expr[] }; }
  private static OR(parts: readonly Expr[]): Expr  { return { $or: parts as Expr[] }; }
  private static mergeAnd(parts: readonly Expr[]): Expr {
    return parts.length === 0 ? {} : parts.length === 1 ? parts[0]! : AddressResolver.AND(parts);
  }
  private static mergeOr(parts: readonly Expr[]): Expr {
    return parts.length === 0 ? {} : parts.length === 1 ? parts[0]! : AddressResolver.OR(parts);
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
    if ('and' in ir) return AddressResolver.mergeAnd(ir.and.map(AddressResolver.fromIR));
    if ('or'  in ir) return AddressResolver.mergeOr(ir.or.map(AddressResolver.fromIR));

    const f = ir.field ?? '__FIELD__';
    const dotted = f.includes('.');

    if (ir.op === 'eq')           return dotted ? AddressResolver.nest(f, ir.value as V)                 : AddressResolver.wrapField(f, ir.value as V);
    if (ir.op === 'neq')          return dotted ? AddressResolver.nest(f, { $ne: ir.value as V } as V)   : AddressResolver.wrapField(f, { $ne: ir.value as V } as V);
    if (ir.op === 'gt')           return dotted ? AddressResolver.nest(f, { $gt: ir.value as V } as V)   : AddressResolver.wrapField(f, { $gt: ir.value as V } as V);
    if (ir.op === 'gte')          return dotted ? AddressResolver.nest(f, { $gte: ir.value as V } as V)  : AddressResolver.wrapField(f, { $gte: ir.value as V } as V);
    if (ir.op === 'lt')           return dotted ? AddressResolver.nest(f, { $lt: ir.value as V } as V)   : AddressResolver.wrapField(f, { $lt: ir.value as V } as V);
    if (ir.op === 'lte')          return dotted ? AddressResolver.nest(f, { $lte: ir.value as V } as V)  : AddressResolver.wrapField(f, { $lte: ir.value as V } as V);
    if (ir.op === 'in')           return dotted ? AddressResolver.nest(f, { $in: ir.values as readonly V[] } as V)
                                                : AddressResolver.wrapField(f, { $in: ir.values as readonly V[] } as V);
    if (ir.op === 'between') {
      const gte = dotted ? AddressResolver.nest(f, { $gte: ir.a as V } as V) : AddressResolver.wrapField(f, { $gte: ir.a as V } as V);
      const lte = dotted ? AddressResolver.nest(f, { $lte: ir.b as V } as V) : AddressResolver.wrapField(f, { $lte: ir.b as V } as V);
      return AddressResolver.mergeAnd([gte, lte]);
    }
    if (ir.op === 'contains')     return dotted ? AddressResolver.nest(f, { $like: `%${AddressResolver.likeEscape(String(ir.value))}%` } as V)
                                                : AddressResolver.wrapField(f, { $like: `%${AddressResolver.likeEscape(String(ir.value))}%` } as V);
    if (ir.op === 'starts_with')  return dotted ? AddressResolver.nest(f, { $like: `${AddressResolver.likeEscape(String(ir.value))}%` } as V)
                                                : AddressResolver.wrapField(f, { $like: `${AddressResolver.likeEscape(String(ir.value))}%` } as V);
    if (ir.op === 'ends_with')    return dotted ? AddressResolver.nest(f, { $like: `%${AddressResolver.likeEscape(String(ir.value))}` } as V)
                                                : AddressResolver.wrapField(f, { $like: `%${AddressResolver.likeEscape(String(ir.value))}` } as V);
    if (ir.op === 'is_null')      return dotted ? AddressResolver.nest(f, null as V) : AddressResolver.wrapField(f, null as V);
    if (ir.op === 'is_not_null')  return dotted ? AddressResolver.nest(f, { $ne: null } as V) : AddressResolver.wrapField(f, { $ne: null } as V);

    throw Object.assign(new Error(`Operator '${(ir as { op: string }).op}' cannot be mapped`), {
      code: 'FILTER_OPERATOR_UNSUPPORTED',
      operator: (ir as { op: string }).op,
      field: f,
    });
  }

  private static emitCondition(
    field: string,
    fieldType: FieldType,
    cond: AddressConditionNode,
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
      if (name === 'eq')           return AddressResolver.nest(field, v as V);
      if (name === 'neq')          return AddressResolver.nest(field, { $ne: v as V } as V);
      if (name === 'gt')           return AddressResolver.nest(field, { $gt: v as V } as V);
      if (name === 'gte')          return AddressResolver.nest(field, { $gte: v as V } as V);
      if (name === 'lt')           return AddressResolver.nest(field, { $lt: v as V } as V);
      if (name === 'lte')          return AddressResolver.nest(field, { $lte: v as V } as V);
      if (name === 'in')           return AddressResolver.nest(field, { $in: v as readonly V[] } as V);
      if (name === 'between') {
        const [a, b] = v as readonly [Primitive, Primitive];
        return AddressResolver.mergeAnd([AddressResolver.nest(field, { $gte: a as V } as V), AddressResolver.nest(field, { $lte: b as V } as V)]);
      }
      if (name === 'contains')     return AddressResolver.nest(field, { $like: `%${AddressResolver.likeEscape(String(v))}%` } as V);
      if (name === 'starts_with')  return AddressResolver.nest(field, { $like: `${AddressResolver.likeEscape(String(v))}%` } as V);
      if (name === 'ends_with')    return AddressResolver.nest(field, { $like: `%${AddressResolver.likeEscape(String(v))}` } as V);
      if (name === 'is_null')      return AddressResolver.nest(field, null as V);
      if (name === 'is_not_null')  return AddressResolver.nest(field, { $ne: null } as V);
    } else {
      if (name === 'eq')           return AddressResolver.wrapField(field, v as V);
      if (name === 'neq')          return AddressResolver.wrapField(field, { $ne: v as V } as V);
      if (name === 'gt')           return AddressResolver.wrapField(field, { $gt: v as V } as V);
      if (name === 'gte')          return AddressResolver.wrapField(field, { $gte: v as V } as V);
      if (name === 'lt')           return AddressResolver.wrapField(field, { $lt: v as V } as V);
      if (name === 'lte')          return AddressResolver.wrapField(field, { $lte: v as V } as V);
      if (name === 'in')           return AddressResolver.wrapField(field, { $in: v as readonly V[] } as V);
      if (name === 'between') {
        const [a, b] = v as readonly [Primitive, Primitive];
        return AddressResolver.mergeAnd([AddressResolver.wrapField(field, { $gte: a as V } as V), AddressResolver.wrapField(field, { $lte: b as V } as V)]);
      }
      if (name === 'contains')     return AddressResolver.wrapField(field, { $like: `%${AddressResolver.likeEscape(String(v))}%` } as V);
      if (name === 'starts_with')  return AddressResolver.wrapField(field, { $like: `${AddressResolver.likeEscape(String(v))}%` } as V);
      if (name === 'ends_with')    return AddressResolver.wrapField(field, { $like: `%${AddressResolver.likeEscape(String(v))}` } as V);
      if (name === 'is_null')      return AddressResolver.wrapField(field, null as V);
      if (name === 'is_not_null')  return AddressResolver.wrapField(field, { $ne: null } as V);
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

        return AddressResolver.fromIR(rewrite(ir));
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
    node: AddressFilterNode,
    custom?: CustomOpRegistry,
  ): Expr {
    if (AddressResolver.isGroup(node)) {
      if ('and' in node) {
        const parts = node.and.map((child) => AddressResolver.buildWhere(meta, child, custom)).filter((e) => Object.keys(e).length > 0);
        return AddressResolver.mergeAnd(parts);
      }
      const parts = node.or.map((child) => AddressResolver.buildWhere(meta, child, custom)).filter((e) => Object.keys(e).length > 0);
      return AddressResolver.mergeOr(parts);
    }

    const def = meta[node.field];
    if (!def) {
      throw Object.assign(new Error(`Field '${node.field}' is not filterable`), { code: 'FILTER_FIELD_NOT_ALLOWED', field: node.field });
    }

    const allowed = def.operators as readonly string[];
    return AddressResolver.emitCondition(node.field, def.type, node, custom, allowed);
  }

  private static emitRelationLeaf(
    tailField: string,
    _fieldType: FieldType,
    cond: AddressConditionNode,
  ): Expr {
    const name = cond.op.toLowerCase();
    const hasValue = Object.prototype.hasOwnProperty.call(cond, 'value');
    const v = hasValue ? cond.value : undefined;

    if (name === 'eq')           return AddressResolver.wrapField(tailField, v as V);
    if (name === 'neq')          return AddressResolver.wrapField(tailField, { $ne: v as V } as V);
    if (name === 'gt')           return AddressResolver.wrapField(tailField, { $gt: v as V } as V);
    if (name === 'gte')          return AddressResolver.wrapField(tailField, { $gte: v as V } as V);
    if (name === 'lt')           return AddressResolver.wrapField(tailField, { $lt: v as V } as V);
    if (name === 'lte')          return AddressResolver.wrapField(tailField, { $lte: v as V } as V);
    if (name === 'in')           return AddressResolver.wrapField(tailField, { $in: v as readonly V[] } as V);
    if (name === 'between') {
      const [a, b] = v as readonly [Primitive, Primitive];
      return AddressResolver.mergeAnd([AddressResolver.wrapField(tailField, { $gte: a as V } as V), AddressResolver.wrapField(tailField, { $lte: b as V } as V)]);
    }
    if (name === 'contains')     return AddressResolver.wrapField(tailField, { $like: `%${AddressResolver.likeEscape(String(v))}%` } as V);
    if (name === 'starts_with')  return AddressResolver.wrapField(tailField, { $like: `${AddressResolver.likeEscape(String(v))}%` } as V);
    if (name === 'ends_with')    return AddressResolver.wrapField(tailField, { $like: `%${AddressResolver.likeEscape(String(v))}` } as V);
    if (name === 'is_null')      return AddressResolver.wrapField(tailField, null as V);
    if (name === 'is_not_null')  return AddressResolver.wrapField(tailField, { $ne: null } as V);

    return {};
  }

  private static buildRelationWhereForRoot(
    meta: Readonly<FilterableMap>,
    root: string,
    node: AddressFilterNode,
  ): Expr | undefined {
    if (AddressResolver.isGroup(node)) {
      const children = ('and' in node ? node.and : node.or)
        .map((c) => AddressResolver.buildRelationWhereForRoot(meta, root, c))
        .filter(AddressResolver.isNonEmptyExpr);

      if (children.length === 0) return undefined;
      if (children.length === 1) return children[0]!;
      return ('and' in node) ? AddressResolver.mergeAnd(children) : AddressResolver.mergeOr(children);
    }

    if (!node.field.startsWith(root + '.')) return undefined;

    const tail = node.field.slice(root.length + 1);
    const def  = meta[node.field];
    if (!def) return undefined;

    return AddressResolver.emitRelationLeaf(tail, def.type, node);
  }

  private static buildPopulateWhereMap(
    meta: Readonly<FilterableMap>,
    filter?: AddressFilterInput,
  ): Partial<Record<AddressRelationRoot, Expr>> {
    if (!filter) return {};
    const out: Partial<Record<AddressRelationRoot, Expr>> = {};
    for (const root of Address_RELATIONS as readonly AddressRelationRoot[]) {
      const w = AddressResolver.buildRelationWhereForRoot(meta, root, filter);
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

  private static buildPopulateAndFields(select?: readonly AddressSelectField[]): {
    populate?: readonly AddressRelationRoot[];
    fields?: readonly string[];
  } {
    if (!select || select.length === 0) return {};

    const relSet = new Set<string>(Address_RELATIONS as readonly string[]);
    const populateRoots = new Set<AddressRelationRoot>();
    const scalar: string[] = [];
    const dotted: string[] = [];

    for (const s of select as readonly string[]) {
      const dot = s.indexOf('.');
      if (dot > 0) {
        const root  = s.slice(0, dot) as AddressRelationRoot;
        if (relSet.has(root)) {
          populateRoots.add(root);
          dotted.push(s);
        } else {
          scalar.push(s);
        }
      } else {
        if (relSet.has(s)) {
          populateRoots.add(s as AddressRelationRoot);
        } else {
          scalar.push(s);
        }
      }
    }

    const uniq = (arr: string[]) => Array.from(new Set(arr));
    const fieldsFlat = uniq([...scalar, ...dotted]);

    const result: {
      populate?: readonly AddressRelationRoot[];
      fields?: readonly string[];
    } = {};

    if (populateRoots.size > 0) result.populate = Array.from(populateRoots) as readonly AddressRelationRoot[];
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
        if (!AddressResolver.isRecord(src)) break;

        const isLast = i === keys.length - 1;
        const next = (src as any)[k];

        if (isLast) {
          const maybeArr = AddressResolver.asArray(src);
          if (maybeArr) {
            dst[k] = maybeArr.map((item) => (AddressResolver.isRecord(item) ? (item as any)[k] : undefined));
          } else {
            dst[k] = next;
          }
          continue;
        }

        const arr = AddressResolver.asArray(next);
        if (arr) {
          const tail = keys.slice(i + 1).join('.');
          dst[k] = arr.map((item) => AddressResolver.projectRow(item as object, [tail]));
          break;
        } else {
          if (!AddressResolver.isRecord(dst[k])) dst[k] = {};
          dst = dst[k] as Record<string, unknown>;
          src = next;
        }
      }
    }

    return out;
  }

  /** ---------- Tiny internal immutability helper ---------- */
  private clone<SS extends readonly AddressSelectField[] | undefined = S, PP extends Shape = P>(
    patch: Partial<ResolverState<SS, PP>>,
  ): AddressResolver<T, SS, PP> {
    const next = {
      ...(this.state as unknown as ResolverState<SS, PP>),
      ...(patch as Partial<ResolverState<SS, PP>>),
    } as ResolverState<SS, PP>;
    return new AddressResolver<T, SS, PP>(this.ctx, this.entityName, this.ctor, next);
  }

  /** ---------- Handy condition builder (typed & exactOptionalPropertyTypes-safe) ---------- */
  static cond(field: AddressSelectField, op: Operator): Omit<AddressConditionNode, 'value'>;
  static cond(field: AddressSelectField, op: Operator, value: AddressConditionNode['value']): AddressConditionNode;
  static cond(field: AddressSelectField, op: Operator, value?: AddressConditionNode['value']): AddressConditionNode {
    const base = { field, op } as Omit<AddressConditionNode, 'value'>;
    return value === undefined ? base as AddressConditionNode : { ...base, value };
  }
}
