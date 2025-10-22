
/* THIS FILE IS AUTO-GENERATED. DO NOT EDIT.
 *
 * Notes for codegen:
 * - Pass `--selects` with a JSON array of allowed select fields (scalars + dotted).
 * - Pass `--relations` with a JSON array of top-level relation names.
 */

import type { EntityName, FindOptions, FilterQuery } from '@mikro-orm/core';
import type { FilterInput, FilterNode, ConditionNode, Primitive } from 'src/filtering/ast';
import { getFilterableMetadata, type FilterableMap, type FieldType } from 'src/filtering/filterable';
import { CustomOpRegistry, type IR } from 'src/filtering/custom-ops';
import { validateFilter } from 'src/filtering/validate';
import { getSelectableFields } from 'src/filtering/expose';
import { type FilterLimits } from 'src/filtering/limits';
import type { Expr } from './UserFilterQuery';
import type { MikroOrmCtx } from 'src/filtering/runtime/driver';

/** Compile-time selectability (entity-scoped) */
export const User_SELECTABLE = ["address","address.city","address.country","address.postalCode","address.street1","address.street2","age","createdAt","displayName","email","id","isActive","role","updatedAt"] as const;
/** Utility: if A is never, use B */
type Fallback<A, B> = [A] extends [never] ? B : A;
export type UserSelectField = Fallback<typeof User_SELECTABLE[number], string>;

/** Top-level relation roots (entity-scoped) */
export const User_RELATIONS = ["address"] as const;
export type UserRelationRoot = Fallback<typeof User_RELATIONS[number], string>;

/** Operator set derived from @Filterable annotations (entity-scoped) */
export const User_OPS = ["between","contains","ends_with","eq","gt","gte","in","is_not_null","is_null","lt","lte","neq","starts_with"] as const;
/** Internal operator union for this resolver (kept un-exported to avoid cross-entity collisions) */
type Operator = typeof User_OPS[number];

/** ---------- Strongly-typed projection for 'plain' shape ---------- */
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

/** Group guard */
const isGroup = (n: FilterNode): n is { and: readonly FilterNode[] } | { or: readonly FilterNode[] } =>
  Object.prototype.hasOwnProperty.call(n, 'and') || Object.prototype.hasOwnProperty.call(n, 'or');

/** Merge helpers */
const AND = (parts: readonly Expr[]): Expr => ({ $and: parts as Expr[] });
const OR  = (parts: readonly Expr[]): Expr => ({ $or: parts as Expr[] });
const mergeAnd = (parts: readonly Expr[]): Expr => (parts.length === 0 ? {} : parts.length === 1 ? parts[0]! : AND(parts));
const mergeOr  = (parts: readonly Expr[]): Expr => (parts.length === 0 ? {} : parts.length === 1 ? parts[0]! : OR(parts));

/** LIKE escaping */
const likeEscape = (s: string): string => s.replace(/[%_]/g, (m) => '\\' + m);

/** Value type induced from Expr */
type V = Expr[keyof Expr];

/** Build { field: payload } */
const wrapField = (field: string, payload: V): Expr => ({ [field]: payload } as Expr);

/** Build nested object from 'a.b.c' */
function nest(path: string, payload: V): Expr {
  const segs = path.split('.');
  let acc: Record<string, V> = { [segs[segs.length - 1] as string]: payload };
  for (let i = segs.length - 2; i >= 0; i--) acc = { [segs[i] as string]: acc };
  return acc as Expr;
}

/** IR → MikroORM Expr (only ops present in metadata) */
function fromIR(ir: IR): Expr {
  if ('and' in ir) return mergeAnd(ir.and.map(fromIR));
  if ('or'  in ir) return mergeOr(ir.or.map(fromIR));

  const f = ir.field ?? '__FIELD__';
  const dotted = f.includes('.');

   if (ir.op === 'eq')  return dotted ? nest(f, ir.value as V) : wrapField(f, ir.value as V); 
   if (ir.op === 'neq') return dotted ? nest(f, { $ne: ir.value as V } as V) : wrapField(f, { $ne: ir.value as V } as V); 
   if (ir.op === 'gt')  return dotted ? nest(f, { $gt: ir.value as V } as V) : wrapField(f, { $gt: ir.value as V } as V); 
   if (ir.op === 'gte') return dotted ? nest(f, { $gte: ir.value as V } as V) : wrapField(f, { $gte: ir.value as V } as V); 
   if (ir.op === 'lt')  return dotted ? nest(f, { $lt: ir.value as V } as V) : wrapField(f, { $lt: ir.value as V } as V); 
   if (ir.op === 'lte') return dotted ? nest(f, { $lte: ir.value as V } as V) : wrapField(f, { $lte: ir.value as V } as V); 
   if (ir.op === 'in')  return dotted ? nest(f, { $in: ir.values as readonly V[] } as V) : wrapField(f, { $in: ir.values as readonly V[] } as V); 
  
  if (ir.op === 'between') {
    const gte = dotted ? nest(f, { $gte: ir.a as V } as V) : wrapField(f, { $gte: ir.a as V } as V);
    const lte = dotted ? nest(f, { $lte: ir.b as V } as V) : wrapField(f, { $lte: ir.b as V } as V);
    return mergeAnd([gte, lte]);
  }
  
   if (ir.op === 'contains')    return dotted ? nest(f, { $like: `%${likeEscape(String(ir.value))}%` } as V) : wrapField(f, { $like: `%${likeEscape(String(ir.value))}%` } as V); 
   if (ir.op === 'starts_with') return dotted ? nest(f, { $like: `${likeEscape(String(ir.value))}%` } as V) : wrapField(f, { $like: `${likeEscape(String(ir.value))}%` } as V); 
   if (ir.op === 'ends_with')   return dotted ? nest(f, { $like: `%${likeEscape(String(ir.value))}` } as V) : wrapField(f, { $like: `%${likeEscape(String(ir.value))}` } as V); 
   if (ir.op === 'is_null')       return dotted ? nest(f, null as V) : wrapField(f, null as V); 
   if (ir.op === 'is_not_null') return dotted ? nest(f, { $ne: null } as V) : wrapField(f, { $ne: null } as V); 

  throw Object.assign(new Error(`Operator '${(ir as { op: string }).op}' is not enabled by @Filterable metadata`), {
    code: 'FILTER_OPERATOR_UNSUPPORTED',
    operator: (ir as { op: string }).op,
    field: f,
  });
}

/** Condition → Expr (dotted aware, custom IR fallback) */
function emitCondition(
  field: string,
  fieldType: FieldType,
  cond: ConditionNode,
  custom?: CustomOpRegistry,
  defAllowed?: readonly Operator[],
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
  const v = hasValue
    ? (cond as { value: Primitive | readonly Primitive[] | readonly [Primitive, Primitive] | undefined }).value
    : undefined;

  if (field.includes('.')) {
     if (name === 'eq')  return nest(field, v as V); 
     if (name === 'neq') return nest(field, { $ne: v as V } as V); 
     if (name === 'gt')  return nest(field, { $gt: v as V } as V); 
     if (name === 'gte') return nest(field, { $gte: v as V } as V); 
     if (name === 'lt')  return nest(field, { $lt: v as V } as V); 
     if (name === 'lte') return nest(field, { $lte: v as V } as V); 
     if (name === 'in')  return nest(field, { $in: v as readonly V[] } as V); 
    
    if (name === 'between') {
      const [a, b] = v as readonly [Primitive, Primitive];
      return mergeAnd([nest(field, { $gte: a as V } as V), nest(field, { $lte: b as V } as V)]);
    }
    
     if (name === 'contains')    return nest(field, { $like: `%${likeEscape(String(v))}%` } as V); 
     if (name === 'starts_with') return nest(field, { $like: `${likeEscape(String(v))}%` } as V); 
     if (name === 'ends_with')   return nest(field, { $like: `%${likeEscape(String(v))}` } as V); 
     if (name === 'is_null')       return nest(field, null as V); 
     if (name === 'is_not_null') return nest(field, { $ne: null } as V); 
  } else {
     if (name === 'eq')  return wrapField(field, v as V); 
     if (name === 'neq') return wrapField(field, { $ne: v as V } as V); 
     if (name === 'gt')  return wrapField(field, { $gt: v as V } as V); 
     if (name === 'gte') return wrapField(field, { $gte: v as V } as V); 
     if (name === 'lt')  return wrapField(field, { $lt: v as V } as V); 
     if (name === 'lte') return wrapField(field, { $lte: v as V } as V); 
     if (name === 'in')  return wrapField(field, { $in: v as readonly V[] } as V); 
    
    if (name === 'between') {
      const [a, b] = v as readonly [Primitive, Primitive];
      return mergeAnd([wrapField(field, { $gte: a as V } as V), wrapField(field, { $lte: b as V } as V)]);
    }
    
     if (name === 'contains')    return wrapField(field, { $like: `%${likeEscape(String(v))}%` } as V); 
     if (name === 'starts_with') return wrapField(field, { $like: `${likeEscape(String(v))}%` } as V); 
     if (name === 'ends_with')   return wrapField(field, { $like: `%${likeEscape(String(v))}` } as V); 
     if (name === 'is_null')       return wrapField(field, null as V); 
     if (name === 'is_not_null') return wrapField(field, { $ne: null } as V); 
  }

  if (custom) {
    const emitter = custom.get(field, fieldType, name);
    if (emitter) {
      const ir: IR = (() => {
        if (hasValue) {
          const vv = (cond as { value: Primitive | readonly Primitive[] | readonly [Primitive, Primitive] | undefined }).value;
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

      return fromIR(rewrite(ir));
    }
  }

  throw Object.assign(new Error(`Operator '${cond.op}' is not supported for field '${field}'`), {
    code: 'FILTER_OPERATOR_UNSUPPORTED',
    field,
    operator: name,
  });
}

/** Recursively build MikroORM where-expression (internal) */
function buildWhere(
  meta: Readonly<FilterableMap>,
  node: FilterNode,
  custom?: CustomOpRegistry,
): Expr {
  if (isGroup(node)) {
    if ('and' in node) {
      const parts = node.and.map((child) => buildWhere(meta, child, custom)).filter((e) => Object.keys(e).length > 0);
      return mergeAnd(parts);
    }
    const parts = node.or.map((child) => buildWhere(meta, child, custom)).filter((e) => Object.keys(e).length > 0);
    return mergeOr(parts);
  }

  const def = meta[node.field];
  if (!def) {
    throw Object.assign(new Error(`Field '${node.field}' is not filterable`), { code: 'FILTER_FIELD_NOT_ALLOWED', field: node.field });
  }
  const allowed = def.operators.filter((o): o is Operator => (<readonly string[]><unknown>User_OPS).includes(o));
  return emitCondition(node.field, def.type, node, custom, allowed);
}

/** Ensure we don't use the global EM context */
function getScopedEm(ctx: MikroOrmCtx) {
  try {
    const maybe = ctx.em as MikroOrmCtx['em'] & { getContext?: () => void };
    if (typeof maybe.getContext === 'function') { maybe.getContext(); return ctx.em; }
  } catch { /* ignore */ }
  return ctx.em.fork();
}

/**
 * Derive populate roots and a FLAT string[] of fields.
 * Flat fields avoid the MikroORM runtime error "f.startsWith is not a function".
 */
function buildPopulateAndFields(select?: readonly UserSelectField[]): {
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

/** Return shape for 'plain' */
type UserPlain<S extends readonly UserSelectField[] | undefined, T> =
  S extends readonly UserSelectField[] ? PickByPaths<T, S> : Record<string, unknown>;

export interface UserResolveOptions<S extends readonly UserSelectField[] | undefined = readonly UserSelectField[] | undefined> {
  limits?: Partial<FilterLimits>;
  query?: {
    select?: S;
    sort?: ReadonlyArray<{ field: UserSelectField; direction?: 'asc' | 'desc' }>;
    limit?: number;
    offset?: number;
  };
  /** 'plain' (default) = only selected fields; 'entity' = full MikroORM entities */
  shape?: 'plain' | 'entity';
  security?: { requireSelectableForFilter?: boolean };
}

/** Overload 1: ctx + EntityCtor (entity) */
export async function resolveUser<T extends object, S extends readonly UserSelectField[] | undefined = readonly UserSelectField[] | undefined>(
  ctx: MikroOrmCtx,
  entity: new (...args: never[]) => T,
  filter?: FilterInput,
  custom?: CustomOpRegistry,
  options?: UserResolveOptions<S> & { shape: 'entity' },
): Promise<T[]>;
/** Overload 2: ctx + EntityCtor (plain) */
export async function resolveUser<T extends object, S extends readonly UserSelectField[] | undefined = readonly UserSelectField[] | undefined>(
  ctx: MikroOrmCtx,
  entity: new (...args: never[]) => T,
  filter?: FilterInput,
  custom?: CustomOpRegistry,
  options?: UserResolveOptions<S> & { shape?: 'plain' },
): Promise<UserPlain<S, T>[]>;
/** Overload 3: ctx + entityName + ctor (entity) */
export async function resolveUser<T extends object, S extends readonly UserSelectField[] | undefined = readonly UserSelectField[] | undefined>(
  ctx: MikroOrmCtx,
  entity: EntityName<T>,
  entityCtor: new (...args: never[]) => T,
  filter?: FilterInput,
  custom?: CustomOpRegistry,
  options?: UserResolveOptions<S> & { shape: 'entity' },
): Promise<T[]>;
/** Overload 4: ctx + entityName + ctor (plain) */
export async function resolveUser<T extends object, S extends readonly UserSelectField[] | undefined = readonly UserSelectField[] | undefined>(
  ctx: MikroOrmCtx,
  entity: EntityName<T>,
  entityCtor: new (...args: never[]) => T,
  filter?: FilterInput,
  custom?: CustomOpRegistry,
  options?: UserResolveOptions<S> & { shape?: 'plain' },
): Promise<UserPlain<S, T>[]>;

export async function resolveUser<T extends object, S extends readonly UserSelectField[] | undefined = readonly UserSelectField[] | undefined>(
  ctx: MikroOrmCtx,
  a: EntityName<T> | (new (...args: never[]) => T),
  b?: FilterInput | (new (...args: never[]) => T),
  c?: FilterInput | CustomOpRegistry,
  d?: CustomOpRegistry | UserResolveOptions<S>,
  e?: UserResolveOptions<S>,
): Promise<T[] | UserPlain<S, T>[]> {
  let entityName!: EntityName<T>;
  let ctor!: new (...args: never[]) => T;
  let filter: FilterInput | undefined;
  let custom: CustomOpRegistry | undefined;
  let opts: UserResolveOptions<S> | undefined;

  if (typeof b === 'function') {
    entityName = a as EntityName<T>;
    ctor = b as new (...args: never[]) => T;
    filter = c as FilterInput | undefined;
    custom = d as CustomOpRegistry | undefined;
    opts = e as UserResolveOptions<S> | undefined;
  } else {
    entityName = a as EntityName<T>;
    ctor = a as new (...args: never[]) => T;
    filter = b as FilterInput | undefined;
    custom = c as CustomOpRegistry | undefined;
    opts = d as UserResolveOptions<S> | undefined;
  }

  const shape = opts?.shape ?? 'plain';

  const em = getScopedEm(ctx);
  const meta = getFilterableMetadata(ctor);

  if (filter) {
    const selectableRoots: readonly string[] = (() => {
      const s = getSelectableFields(ctor);
      return Array.isArray(s) ? s : Array.from(s as ReadonlySet<string>);
    })();

    validateFilter(meta, filter, opts?.limits, {
      requireSelectableForFilter: Boolean(opts?.security?.requireSelectableForFilter),
      selectable: selectableRoots,
    });
  }

  const where = (filter ? buildWhere(meta, filter, custom) : {}) as FilterQuery<T>;

  const select = opts?.query?.select;
  const orderByRecord =
    opts?.query?.sort?.reduce<Record<string, 'asc' | 'desc'>>((acc, s) => {
      acc[s.field as string] = s.direction ?? 'asc';
      return acc;
    }, {}) ?? undefined;

  const { populate, fields } = buildPopulateAndFields(select);

  const findOptions = {
    ...(typeof opts?.query?.limit === 'number'  ? { limit:  opts.query.limit }  : {}),
    ...(typeof opts?.query?.offset === 'number' ? { offset: opts.query.offset } : {}),
    ...(orderByRecord ? { orderBy: orderByRecord as NonNullable<FindOptions<T>['orderBy']> } : {}),
    ...(populate      ? { populate: populate     as NonNullable<FindOptions<T>['populate']> } : {}),
    ...(fields        ? { fields:   fields       as NonNullable<FindOptions<T>['fields']> }   : {}),
  } satisfies FindOptions<T>;

  const rows = await em.find<T>(entityName, where, findOptions);

  if (shape === 'entity') {
    return rows;
  }

  // Project to *only* the requested fields (plain shape)
  const picked = (() => {
    const sel = (select as readonly string[]) ?? [];
    if (sel.length === 0) return rows.map(() => ({} as any));

    const out: any[] = [];
    for (const row of rows as unknown as Record<string, any>[]) {
      const rec: Record<string, any> = {};
      for (const path of sel) {
        const parts = path.split('.');
        let src: any = row;
        let dst: Record<string, any> = rec;
        for (let i = 0; i < parts.length; i++) {
          const key = parts[i]!;
          if (src == null || typeof src !== 'object') break;
          if (i === parts.length - 1) {
            dst[key] = src[key];
          } else {
            if (dst[key] == null || typeof dst[key] !== 'object') dst[key] = {};
            dst = dst[key] as Record<string, any>;
            src = src[key];
          }
        }
      }
      out.push(rec);
    }
    return out;
  })() as UserPlain<S, T>[];

  return picked;
}
