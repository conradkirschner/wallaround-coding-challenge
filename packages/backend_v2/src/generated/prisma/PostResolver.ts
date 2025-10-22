
/* THIS FILE IS AUTO-GENERATED (PRISMA). DO NOT EDIT.
 *
 * Notes:
 * - API mirrors the MikroORM resolver (plus two convenience overloads for the string-only call form).
 * - When only the entity name string is passed, we import the domain ctor to read decorator metadata.
 */

import type { Prisma, PrismaClient } from '@prisma/client';
import type { FilterInput, FilterNode, ConditionNode, Primitive } from 'src/filtering/ast';
import {
  getFilterableMetadata,
  getFilterableRelationsMeta,
  type FilterableMap,
  type FieldType,
  type RelationMeta,
} from 'src/filtering/filterable';
import { CustomOpRegistry, type IR } from 'src/filtering/custom-ops';
import { validateFilter } from 'src/filtering/validate';
import { getSelectableFields } from 'src/filtering/expose';
import { type FilterLimits } from 'src/filtering/limits';
import type { PrismaCtx } from 'src/filtering/runtime/driver';
// Domain ctor import to support string-only calls:
import { Post as DomainPost } from 'src/domain/post.entity';

/** Compile-time selectability (entity-scoped) */
export const Post_SELECTABLE = ["author","content","createdAt","id","published","title","updatedAt"] as const;
/** Utility: if A is never, use B */
type Fallback<A, B> = [A] extends [never] ? B : A;
export type PostSelectField = Fallback<typeof Post_SELECTABLE[number], string>;

/** Top-level relation roots (entity-scoped) */
export const Post_RELATIONS = [] as const;
export type PostRelationRoot = Fallback<typeof Post_RELATIONS[number], string>;

/** Operator set (entity-scoped; merged entity + relation-safe) */
export const Post_OPS = ["between","contains","ends_with","eq","gt","gte","in","is_not_null","is_null","lt","lte","neq","starts_with"] as const;
/** Keep a local Operator type; not used to gate per-field allow-lists */
type Operator = typeof Post_OPS[number];

/** ---------- Strongly-typed projection helpers ---------- */
type UnionToIntersection<U> =
  (U extends unknown ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

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

/** ===== Comparator mappers (Prisma) ===== */
/** Wide op union so switch/case always type-checks; allowlist enforces per-field support */
type AnyOp =
  | 'eq' | 'neq'
  | 'gt' | 'gte' | 'lt' | 'lte'
  | 'in' | 'between'
  | 'contains' | 'starts_with' | 'ends_with'
  | 'is_null' | 'is_not_null';

type MappableOp = Exclude<AnyOp, 'between' | 'is_null' | 'is_not_null'>;

type PrismaComparatorKey =
  | 'equals' | 'not'
  | 'gt' | 'gte' | 'lt' | 'lte'
  | 'in'
  | 'contains' | 'startsWith' | 'endsWith';

function toMutableArray(v: readonly unknown[] | unknown | undefined): unknown[] | undefined {
  if (Array.isArray(v)) return Array.from(v);
  return undefined;
}

function scalarComparator(_fieldType: FieldType, op: AnyOp, value?: Primitive | readonly Primitive[] | readonly [Primitive, Primitive]) {
  switch (op) {
    case 'eq':          return { equals: value };
    case 'neq':         return { not: value as unknown };
    case 'gt':          return { gt: value as unknown };
    case 'gte':         return { gte: value as unknown };
    case 'lt':          return { lt: value as unknown };
    case 'lte':         return { lte: value as unknown };
    case 'in':          return { in: toMutableArray(value as readonly unknown[]) };
    case 'between': {
      const [a, b] = value as readonly [Primitive, Primitive];
      return { gte: a as unknown, lte: b as unknown };
    }
    case 'contains':    return { contains: String(value) };
    case 'starts_with': return { startsWith: String(value) };
    case 'ends_with':   return { endsWith: String(value) };
    case 'is_null':     return null;
    case 'is_not_null': return { not: null };
  }
}

/** Wrap a dotted condition under the relation root for top-level where */
function nestRelWhere(
  relMeta: RelationMeta,
  path: string,
  leaf: Record<string, unknown> | null,
): Record<string, unknown> {
  const dot = path.indexOf('.');
  const root = path.slice(0, dot);
  const tail = path.slice(dot + 1);

  const meta = relMeta[root] ?? { kind: 'one' as const };
  if (meta.kind === 'one') {
    // 1:1 — Prisma uses { root: { is: ... } }
    return { [root]: { is: leaf ?? { [tail]: null } } } as Record<string, unknown>;
  }
  // to-many — use default quantifier (fallback to 'some')
  const quant = meta.defaultQuantifier ?? 'some';
  return { [root]: { [quant]: leaf ?? { [tail]: null } } } as Record<string, unknown>;
}

/** Condition → Prisma where (for top-level entity; dotted-aware) */
function emitConditionPrisma(
  relMeta: RelationMeta,
  field: string,
  fieldType: FieldType,
  cond: ConditionNode,
  defAllowed?: readonly string[], // allow any string (incl. custom ops)
): Prisma.PostWhereInput {
  const name = cond.op.toLowerCase() as AnyOp | string;

  if (defAllowed && !(defAllowed as readonly string[]).includes(name)) {
    throw Object.assign(new Error(`Operator '${name}' is not allowed for field '${field}'`), {
      code: 'FILTER_OPERATOR_UNSUPPORTED',
      meta: { field, op: name, allowed: defAllowed },
    });
  }

  const hasValue = Object.prototype.hasOwnProperty.call(cond, 'value');
  const v = hasValue
    ? (cond as { value: Primitive | readonly Primitive[] | readonly [Primitive, Primitive] | undefined }).value
    : undefined;

  // If it's a known core op, try to map immediately; otherwise fall through for custom handling.
  const op = name as AnyOp;

  if (!field.includes('.')) {
    const cmp = scalarComparator(fieldType, op as AnyOp, v as any);
    if (cmp !== undefined) return (cmp === null ? { [field]: null } : { [field]: cmp }) as Prisma.PostWhereInput;
  } else {
    const cmp = scalarComparator(fieldType, op as AnyOp, v as any);
    if (cmp !== undefined) {
      const tail = field.slice(field.indexOf('.') + 1);
      const leaf = cmp === null ? null : { [tail]: cmp } as Record<string, unknown> | null;
      return nestRelWhere(relMeta, field, leaf) as Prisma.PostWhereInput;
    }
  }

  // Unknown/custom op → return undefined (caller will try registry/custom path)
  return {} as unknown as Prisma.PostWhereInput;
}

/** IR → Prisma where translation (custom ops path) */
const KEY_MAP: Record<MappableOp, PrismaComparatorKey> = {
  eq: 'equals',
  neq: 'not',
  gt: 'gt',
  gte: 'gte',
  lt: 'lt',
  lte: 'lte',
  in: 'in',
  contains: 'contains',
  starts_with: 'startsWith',
  ends_with: 'endsWith',
} as const;

function fromIRPrisma(relMeta: RelationMeta, ir: IR): Prisma.PostWhereInput {
  if ('and' in ir) return { AND: ir.and.map((x) => fromIRPrisma(relMeta, x)) };
  if ('or'  in ir) return { OR:  ir.or.map((x) => fromIRPrisma(relMeta, x)) };

  const f = ir.field ?? '__FIELD__';
  const op = ir.op.toLowerCase() as AnyOp | string;

  if (op === 'between') {
    const b = ir as Extract<IR, { op: 'between' }>;
    if (!f.includes('.')) {
      return { AND: [{ [f]: { gte: b.a } }, { [f]: { lte: b.b } }] } as Prisma.PostWhereInput;
    }
    const leaf = f.split('.')[1]!;
    return {
      AND: [
        nestRelWhere(relMeta, f, { [leaf]: { gte: b.a } }),
        nestRelWhere(relMeta, f, { [leaf]: { lte: b.b } }),
      ],
    } as Prisma.PostWhereInput;
  }

  if (op === 'is_null') {
    return f.includes('.') ? nestRelWhere(relMeta, f, null) as Prisma.PostWhereInput
                           : ({ [f]: null } as Prisma.PostWhereInput);
  }
  if (op === 'is_not_null') {
    const leaf = f.includes('.') ? f.split('.')[1]! : f;
    const payload = { [leaf]: { not: null } } as Record<string, unknown>;
    return f.includes('.') ? nestRelWhere(relMeta, f, payload) as Prisma.PostWhereInput
                           : ({ [f]: { not: null } } as Prisma.PostWhereInput);
  }

  // Map remaining ops to Prisma comparator keys (typed)
  const key = KEY_MAP[op as MappableOp];

  let val: unknown;
  switch (op) {
    case 'contains':
    case 'starts_with':
    case 'ends_with': {
      const v = (ir as Extract<IR, { op: 'contains' | 'starts_with' | 'ends_with' }>).value;
      val = String(v);
      break;
    }
    case 'in': {
      const v = (ir as Extract<IR, { op: 'in' }>).values as readonly unknown[];
      val = Array.from(v);
      break;
    }
    default: {
      val = (ir as Extract<IR, { op: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' }>).value;
    }
  }

  if (!f.includes('.')) {
    return { [f]: { [key]: val } } as Prisma.PostWhereInput;
  }
  const leafName = f.split('.')[1]!;
  return nestRelWhere(relMeta, f, { [leafName]: { [key]: val } }) as Prisma.PostWhereInput;
}

/** Recursively build Prisma where from the filter AST (top-level entity) */
function buildWherePrisma(
  relMeta: RelationMeta,
  meta: Readonly<FilterableMap>,
  node: FilterNode,
  custom?: CustomOpRegistry,
): Prisma.PostWhereInput {
  if (isGroup(node)) {
    if ('and' in node) return { AND: node.and.map((c) => buildWherePrisma(relMeta, meta, c, custom)) };
    return { OR: node.or.map((c) => buildWherePrisma(relMeta, meta, c, custom)) };
  }

  const def = meta[node.field];
  if (!def) {
    throw Object.assign(new Error(`Field '${node.field}' is not filterable`), {
      code: 'FILTER_FIELD_NOT_ALLOWED',
      meta: { field: node.field },
    });
  }

  // IMPORTANT: use the field’s own operators directly (no intersection that would drop relation/custom ops)
  const allowed = def.operators as readonly string[];

  // Try core-ops path first (if it returns a non-empty object)
  try {
    const expr = emitConditionPrisma(relMeta, node.field, def.type, node, allowed);
    if (expr && Object.keys(expr as Record<string, unknown>).length > 0) return expr;
  } catch (e) {
    // If emitConditionPrisma threw due to allow-list, bubble up (custom ops won't help)
    throw e;
  }

  // Custom op path
  if (custom) {
    const emitter = custom.get(node.field, def.type, node.op.toLowerCase());
    if (emitter) {
      const hasValue = Object.prototype.hasOwnProperty.call(node, 'value');
      const ir: IR = (() => {
        if (hasValue) {
          const vv = (node as { value: Primitive | readonly Primitive[] | readonly [Primitive, Primitive] | undefined }).value;
          if (Array.isArray(vv)) {
            if (vv.length === 2 && 0 in vv && 1 in vv) return (emitter as (a: Primitive, b: Primitive) => IR)(vv[0] as Primitive, vv[1] as Primitive);
            return (emitter as (arr: readonly Primitive[]) => IR)(vv as readonly Primitive[]);
          }
          return (emitter as (a: Primitive) => IR)(vv as Primitive);
        }
        return (emitter as () => IR)();
      })();

      const rewrite = (nodeIR: IR): IR => {
        if ('and' in nodeIR) return { and: nodeIR.and.map(rewrite) };
        if ('or'  in nodeIR) return { or:  nodeIR.or.map(rewrite) };
        return (nodeIR as { field?: string }).field === '__FIELD__'
          ? ({ ...(nodeIR as Exclude<IR, { and: readonly IR[] } | { or: readonly IR[] }>), field: node.field } as IR)
          : nodeIR;
      };

      return fromIRPrisma(relMeta, rewrite(ir));
    }
  }

  throw Object.assign(new Error(`Operator '${node.op}' is not supported for field '${node.field}'`), {
    code: 'FILTER_OPERATOR_UNSUPPORTED',
    meta: { field: node.field, op: node.op },
  });
}

/* =====================  Relation-scoped where  ===================== */

/** Leaf emitter for a relation-scoped condition (field is tail inside relation) */
function emitRelationLeafPrisma(
  tailField: string,
  _fieldType: FieldType,
  cond: ConditionNode,
): Record<string, unknown> | null {
  const op = cond.op.toLowerCase() as AnyOp | string;
  const hasValue = Object.prototype.hasOwnProperty.call(cond, 'value');
  const v = hasValue
    ? (cond as { value: Primitive | readonly Primitive[] | readonly [Primitive, Primitive] | undefined }).value
    : undefined;

  switch (op) {
    case 'eq':  return { [tailField]: { equals: v } };
    case 'neq': return { [tailField]: { not: v as unknown } };
    case 'gt':  return { [tailField]: { gt: v as unknown } };
    case 'gte': return { [tailField]: { gte: v as unknown } };
    case 'lt':  return { [tailField]: { lt: v as unknown } };
    case 'lte': return { [tailField]: { lte: v as unknown } };
    case 'in':  return { [tailField]: { in: toMutableArray(v as readonly unknown[]) } };
    case 'between': {
      const [a, b] = v as readonly [Primitive, Primitive];
      return { AND: [{ [tailField]: { gte: a as unknown } }, { [tailField]: { lte: b as unknown } }] };
    }
    case 'contains':    return { [tailField]: { contains: String(v) } };
    case 'starts_with': return { [tailField]: { startsWith: String(v) } };
    case 'ends_with':   return { [tailField]: { endsWith: String(v) } };
    case 'is_null':     return { [tailField]: null };
    case 'is_not_null': return { [tailField]: { not: null } };
    default:            return null;
  }
}

/** Prune the filter AST to a single relation root and build a Prisma where for the relation model */
function buildRelationWhereForRoot(
  meta: Readonly<FilterableMap>,
  root: string,
  node: FilterNode,
): Record<string, unknown> | undefined {
  if (isGroup(node)) {
    const children = ('and' in node ? node.and : node.or)
      .map((c) => buildRelationWhereForRoot(meta, root, c))
      .filter((x): x is Record<string, unknown> => Boolean(x));

    if (children.length === 0) return undefined;
    if (children.length === 1) return children[0];

    return ('and' in node) ? { AND: children } : { OR: children };
  }

  if (!node.field.startsWith(root + '.')) return undefined;

  const tail = node.field.slice(root.length + 1);
  const def  = meta[node.field];
  if (!def) return undefined;

  const leaf = emitRelationLeafPrisma(tail, def.type, node);
  return leaf ?? undefined;
}

/** Relation where map (ONLY for to-many relations) */
type PostRelationWhereMap = {

};

function buildRelationWhereMap(
  meta: Readonly<FilterableMap>,
  filter?: FilterInput,
): Partial<PostRelationWhereMap> {
  if (!filter) return {};
  const out: Partial<PostRelationWhereMap> = {};

  return out;
}

/* =====================  Select & order builders  ===================== */

/** Build Prisma "select" and apply relation-scoped where (only for to-many) */
function buildSelect(
  select: readonly PostSelectField[] | undefined,
  relWhere: Partial<PostRelationWhereMap>,
): Prisma.PostSelect | undefined {
  if (!select || select.length === 0) return undefined;

  const obj: Prisma.PostSelect = {};
  const scalar: string[] = [];


  for (const s of select as readonly string[]) {
    const dot = s.indexOf('.');
    if (dot < 0) { scalar.push(s); continue; }
    const root = s.slice(0, dot);
    const leaf = s.slice(dot + 1);
    switch (root) {

      default:
        // Unknown dotted root — ignore to avoid invalid select keys like "a.b"
        break;
    }
  }

  for (const s of scalar) (obj as Record<string, unknown>)[s] = true;



  return obj;
}

/** Build Prisma orderBy (top-level + dotted 1:1; skip dotted to-many) */
function buildOrderBy(
  sorts: ReadonlyArray<{ field: PostSelectField; direction?: 'asc' | 'desc' }> | undefined,
  relMeta: RelationMeta,
): Prisma.Enumerable<Prisma.PostOrderByWithRelationInput> | undefined {
  if (!sorts || sorts.length === 0) return undefined;
  const out: Prisma.PostOrderByWithRelationInput[] = [];

  for (const s of sorts) {
    const f = s.field as string;
    const dir = s.direction ?? 'asc';
    const dot = f.indexOf('.');
    if (dot < 0) {
      out.push({ [f]: dir } as Prisma.PostOrderByWithRelationInput);
      continue;
    }
    const root = f.slice(0, dot);
    const leaf = f.slice(dot + 1);
    const meta = relMeta[root];

    if (meta?.kind === 'one') {
      // nested orderBy for 1:1 only
      out.push({ [root]: { [leaf]: dir } } as unknown as Prisma.PostOrderByWithRelationInput);
    }
  }
  return out.length ? out : undefined;
}

/** Return shape for 'plain' */
type PostPlain<S extends readonly PostSelectField[] | undefined, T> =
  S extends readonly PostSelectField[] ? PickByPaths<T, S> : Record<string, unknown>;

export interface PostResolveOptions<S extends readonly PostSelectField[] | undefined = readonly PostSelectField[] | undefined> {
  limits?: Partial<FilterLimits>;
  query?: {
    select?: S;
    sort?: ReadonlyArray<{ field: PostSelectField; direction?: 'asc' | 'desc' }>;
    limit?: number;
    offset?: number;
  };
  /** 'plain' (default) returns only selected fields; 'entity' returns Prisma payloads */
  shape?: 'plain' | 'entity';
  security?: { requireSelectableForFilter?: boolean };
}

/** Lightweight alias to mirror MikroORM signatures */
type PrismaEntityName<T> = string;

/* ========================= Overloads ========================= */
/** 1) ctx + Ctor (entity) */
export async function resolvePost<T extends object, S extends readonly PostSelectField[] | undefined = readonly PostSelectField[] | undefined>(
  ctx: PrismaCtx,
  entity: new (...args: never[]) => T,
  filter?: FilterInput,
  custom?: CustomOpRegistry,
  options?: PostResolveOptions<S> & { shape: 'entity' },
): Promise<Awaited<ReturnType<PrismaClient['post']['findMany']>>>;
/** 2) ctx + Ctor (plain) */
export async function resolvePost<T extends object, S extends readonly PostSelectField[] | undefined = readonly PostSelectField[] | undefined>(
  ctx: PrismaCtx,
  entity: new (...args: never[]) => T,
  filter?: FilterInput,
  custom?: CustomOpRegistry,
  options?: PostResolveOptions<S> & { shape?: 'plain' },
): Promise<PostPlain<S, T>[]>;
/** 3) ctx + entityName + Ctor (entity) */
export async function resolvePost<T extends object, S extends readonly PostSelectField[] | undefined = readonly PostSelectField[] | undefined>(
  ctx: PrismaCtx,
  entity: PrismaEntityName<T>,
  entityCtor: new (...args: never[]) => T,
  filter?: FilterInput,
  custom?: CustomOpRegistry,
  options?: PostResolveOptions<S> & { shape: 'entity' },
): Promise<Awaited<ReturnType<PrismaClient['post']['findMany']>>>;
/** 4) ctx + entityName + Ctor (plain) */
export async function resolvePost<T extends object, S extends readonly PostSelectField[] | undefined = readonly PostSelectField[] | undefined>(
  ctx: PrismaCtx,
  entity: PrismaEntityName<T>,
  entityCtor: new (...args: never[]) => T,
  filter?: FilterInput,
  custom?: CustomOpRegistry,
  options?: PostResolveOptions<S> & { shape?: 'plain' },
): Promise<PostPlain<S, T>[]>;
/** 5) ctx + entityName ONLY (entity) */
export async function resolvePost<T extends object, S extends readonly PostSelectField[] | undefined = readonly PostSelectField[] | undefined>(
  ctx: PrismaCtx,
  entity: PrismaEntityName<T>,
  filter?: FilterInput,
  custom?: CustomOpRegistry,
  options?: PostResolveOptions<S> & { shape: 'entity' },
): Promise<Awaited<ReturnType<PrismaClient['post']['findMany']>>>;
/** 6) ctx + entityName ONLY (plain) */
export async function resolvePost<T extends object, S extends readonly PostSelectField[] | undefined = readonly PostSelectField[] | undefined>(
  ctx: PrismaCtx,
  entity: PrismaEntityName<T>,
  filter?: FilterInput,
  custom?: CustomOpRegistry,
  options?: PostResolveOptions<S> & { shape?: 'plain' },
): Promise<PostPlain<S, T>[]>;

/* ====================== Implementation ====================== */
export async function resolvePost<T extends object, S extends readonly PostSelectField[] | undefined = readonly PostSelectField[] | undefined>(
  ctx: PrismaCtx,
  a: PrismaEntityName<T> | (new (...args: never[]) => T),
  b?: FilterInput | (new (...args: never[]) => T),
  c?: FilterInput | CustomOpRegistry,
  d?: CustomOpRegistry | PostResolveOptions<S>,
  e?: PostResolveOptions<S>,
) {
  // Normalize to: ctor, filter, custom, opts (support ctor form, string+ctor, string-only)
  let ctor!: new (...args: never[]) => T;
  let filter: FilterInput | undefined;
  let custom: CustomOpRegistry | undefined;
  let opts: PostResolveOptions<S> | undefined;

  if (typeof a === 'function') {
    // (ctx, ctor, filter?, custom?, opts?)
    ctor   = a;
    filter = b as FilterInput | undefined;
    custom = c as CustomOpRegistry | undefined;
    opts   = d as PostResolveOptions<S> | undefined;
  } else {
    if (typeof b === 'function') {
      // (ctx, 'Entity', ctor, filter?, custom?, opts?)
      ctor   = b as new (...args: never[]) => T;
      filter = c as FilterInput | undefined;
      custom = d as CustomOpRegistry | undefined;
      opts   = e as PostResolveOptions<S> | undefined;
    } else {
      // (ctx, 'Entity', filter?, custom?, opts?)  ← smoke test form
      ctor   = DomainPost as unknown as new (...args: never[]) => T;
      filter = b as FilterInput | undefined;
      custom = c as CustomOpRegistry | undefined;
      opts   = d as PostResolveOptions<S> | undefined;
    }
  }

  const shape = opts?.shape ?? 'plain';

  // Decorator metadata & relations
  const meta    = getFilterableMetadata(ctor);
  const relMeta = getFilterableRelationsMeta(ctor);

  // Validate against decorators
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

  // Where (top-level)
  const where: Prisma.PostWhereInput = filter
    ? buildWherePrisma(relMeta, meta, filter, custom)
    : {};

  // Relation-scoped where map (used to filter relation payloads in select)
  const relWhere = buildRelationWhereMap(meta, filter);

  // Projection / order / pagination
  const select  = buildSelect(opts?.query?.select, relWhere);
  const orderBy = buildOrderBy(opts?.query?.sort, relMeta);
  const take    = typeof opts?.query?.limit  === 'number' ? opts!.query!.limit  : undefined;
  const skip    = typeof opts?.query?.offset === 'number' ? opts!.query!.offset : undefined;

  const args: Prisma.PostFindManyArgs = {
    ...(Object.keys(where).length ? { where } : {}),
    ...(select ? { select } : {}),
    ...(orderBy ? { orderBy } : {}),
    ...(typeof take === 'number' ? { take } : {}),
    ...(typeof skip === 'number' ? { skip } : {}),
  };

  const rows = await ctx.client.post.findMany(args);

  if (shape === 'entity') return rows;
  // Prisma already projects by select → reuse payload as "plain"
  return rows as unknown as PostPlain<S, T>[];
}
