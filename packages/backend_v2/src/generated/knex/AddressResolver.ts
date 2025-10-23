
/* THIS FILE IS AUTO-GENERATED (KNEX/SQL). DO NOT EDIT.
 *
 * Notes:
 * - Framework-agnostic SQL builder using your adapter capabilities for table/column names.
 * - 1:1 dotted fields are realized via LEFT JOINs; 1:n filters use EXISTS subqueries.
 * - 1:n selections are stitched via secondary queries (keeps things portable).
 */

import type { FilterInput, FilterNode, ConditionNode, Primitive } from 'src/filtering/ast';
import {
  getFilterableMetadata,
  type FilterableMap,
  type FieldType,
} from 'src/filtering/filterable';
import { CustomOpRegistry, type IR } from 'src/filtering/custom-ops';
import { validateFilter } from 'src/filtering/validate';
import { getSelectableFields } from 'src/filtering/expose';
import { type FilterLimits } from 'src/filtering/limits';

import type { KnexCtx } from 'src/filtering/runtime/driver';
import type {
  SqlCapabilities,
  SqlMapping,
} from 'src/filtering/runtime/adapter/adapter-sql';

// Domain ctor import to support string-only calls:
import { Address as DomainAddress } from 'src/domain/address.entity';

/** Compile-time selectability (entity-scoped) */
export const Address_SELECTABLE = ["city","country","createdAt","id","postalCode","street1","street2","updatedAt"] as const;
/** Utility: if A is never, use B */
type Fallback<A, B> = [A] extends [never] ? B : A;
export type AddressSelectField = Fallback<typeof Address_SELECTABLE[number], string>;

/** Top-level relation roots (entity-scoped) */
export const Address_RELATIONS = [] as const;
export type AddressRelationRoot = Fallback<typeof Address_RELATIONS[number], string>;

/** Operator set (entity-scoped; merged entity + relation-safe) */
export const Address_OPS = ["between","contains","ends_with","eq","gt","gte","in","is_not_null","is_null","lt","lte","neq","starts_with"] as const;

/** ---------- Projection helpers ---------- */
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

/** LIKE escaping (for pattern payload; ESCAPE handling is dialect-specific and added via raw when needed) */
const likeEscape = (s: string): string => s.replace(/[%_]/g, (m) => '\\' + m);

/** Make a safe SQL alias for a dotted path */
const aliasOf = (path: string) => path.replace(/\./g, '__');

/** Collect dotted roots from a list of paths */
const dottedRoots = (paths: readonly string[]) =>
  Array.from(new Set(paths.filter((p) => p.includes('.')).map((p) => p.slice(0, p.indexOf('.')))));

/** Return shape for 'plain' */
type AddressPlain<S extends readonly AddressSelectField[] | undefined, T> =
  S extends readonly AddressSelectField[] ? PickByPaths<T, S> : Record<string, unknown>;

export interface AddressResolveOptions<S extends readonly AddressSelectField[] | undefined = readonly AddressSelectField[] | undefined> {
  limits?: Partial<FilterLimits>;
  query?: {
    select?: S;
    sort?: ReadonlyArray<{ field: AddressSelectField; direction?: 'asc' | 'desc' }>;
    limit?: number;
    offset?: number;
  };
  /** 'plain' only for SQL adapter (no ORM entities) */
  shape?: 'plain';
  security?: { requireSelectableForFilter?: boolean };
}

/* ======================================================================
 *                         Mapping helpers
 * ====================================================================== */

function requireCaps(ctx: KnexCtx): SqlCapabilities {
  const caps = (ctx as any)?.caps as SqlCapabilities | undefined;
  if (!caps || typeof caps.getMapping !== 'function') {
    throw Object.assign(new Error('SQL capabilities not available on ctx. Did you create sqlCtx via knexCtx(db, caps)?'), {
      code: 'SQL_CAPABILITIES_MISSING',
    });
  }
  return caps;
}

function requireMapping(caps: SqlCapabilities, ctor: Function): SqlMapping {
  return caps.getMapping(ctor);
}

type JoinKind = 'one';
type JoinPlan = Record<string, { kind: JoinKind; alias: string }>;

function planJoinsForSelect(select: readonly string[] | undefined): Set<string> {
  if (!select) return new Set();
  return new Set(dottedRoots(select as readonly string[]));
}

function planJoinsForFilter(meta: Readonly<FilterableMap>, filter?: FilterInput): Set<string> {
  const out = new Set<string>();
  if (!filter) return out;

  const visit = (node: FilterNode): void => {
    if (isGroup(node)) {
      const children = ('and' in node ? node.and : node.or);
      for (const c of children) visit(c);
      return;
    }
    if (node.field.includes('.')) {
      const root = node.field.slice(0, node.field.indexOf('.'));
      out.add(root);
    }
  };
  visit(filter as FilterNode);
  return out;
}

/** Resolve column reference for a path (root scalar or dotted 1:1 leaf) */
function resolveColumn(mapping: SqlMapping, joins: JoinPlan, path: string): { tableAlias: string; column: string } {
  const dot = path.indexOf('.');
  if (dot < 0) {
    const col = mapping.columns[path];
    if (!col) throw Object.assign(new Error(`Unknown scalar field '${path}' in SQL mapping of ${mapping.table}`), { code: 'SQL_COLUMN_MISSING', meta: { field: path } });
    return { tableAlias: 't0', column: col };
  }
  const root = path.slice(0, dot);
  const leaf = path.slice(dot + 1);
  const rel = mapping.relations?.[root];
  if (!rel) throw Object.assign(new Error(`Unknown relation '${root}' in SQL mapping of ${mapping.table}`), { code: 'SQL_RELATION_MISSING', meta: { root } });
  if (rel.kind !== 'one') throw Object.assign(new Error(`Selection/sort on to-many relation '${root}' requires stitching (not a direct column).`), { code: 'SQL_TOMANY_DIRECT_ACCESS' });
  const col = (rel.columns || {})[leaf];
  if (!col) throw Object.assign(new Error(`Unknown related scalar '${root}.${leaf}' in mapping.`), { code: 'SQL_COLUMN_MISSING', meta: { field: path } });
  const jp = joins[root];
  if (!jp) throw Object.assign(new Error(`Missing join plan for relation '${root}'`), { code: 'SQL_JOIN_PLAN_MISSING', meta: { root } });
  return { tableAlias: jp.alias, column: col };
}

/* ======================================================================
 *                         WHERE builders (root)
 * ====================================================================== */

type AnyOp =
  | 'eq' | 'neq'
  | 'gt' | 'gte' | 'lt' | 'lte'
  | 'in' | 'between'
  | 'contains' | 'starts_with' | 'ends_with'
  | 'is_null' | 'is_not_null';

function applyComparator(knex: any, qb: any, colRef: any, _fieldType: FieldType, op: AnyOp, v: any) {
  switch (op) {
    case 'eq':  return qb.where(colRef, '=', v);
    case 'neq': return qb.where(colRef, '<>', v);
    case 'gt':  return qb.where(colRef, '>', v);
    case 'gte': return qb.where(colRef, '>=', v);
    case 'lt':  return qb.where(colRef, '<', v);
    case 'lte': return qb.where(colRef, '<=', v);
    case 'in':  return qb.whereIn(colRef, Array.isArray(v) ? v : []);
    case 'between': {
      const [a, b] = v as readonly [Primitive, Primitive];
      return qb.whereBetween(colRef, [a, b]);
    }
    case 'contains': {
      const patt = `%${likeEscape(String(v))}%`;
      return qb.where(colRef, 'like', patt);
    }
    case 'starts_with': {
      const patt = `${likeEscape(String(v))}%`;
      return qb.where(colRef, 'like', patt);
    }
    case 'ends_with': {
      const patt = `%${likeEscape(String(v))}`;
      return qb.where(colRef, 'like', patt);
    }
    case 'is_null':     return qb.whereNull(colRef);
    case 'is_not_null': return qb.whereNotNull(colRef);
  }
}

/** Apply a single condition to qb; handles root scalar, 1:1 leaf; 1:n uses EXISTS on the related table */
function applyCondition(
  knex: any,
  qb: any,
  meta: Readonly<FilterableMap>,
  mapping: SqlMapping,
  joins: JoinPlan,
  cond: ConditionNode,
  custom: CustomOpRegistry | undefined,
) {
  const name = cond.op.toLowerCase() as AnyOp | string;
  const def = meta[cond.field];
  if (!def) {
    throw Object.assign(new Error(`Field '${cond.field}' is not filterable`), {
      code: 'FILTER_FIELD_NOT_ALLOWED',
      meta: { field: cond.field },
    });
  }

  // allow-list check (operators are stored as strings in metadata)
  const allowed = def.operators as readonly string[];
  if (!allowed.includes(name)) {
    throw Object.assign(new Error(`Operator '${name}' is not allowed for '${cond.field}'`), {
      code: 'FILTER_OPERATOR_UNSUPPORTED',
      meta: { field: cond.field, op: name, allowed },
    });
  }

  const hasValue = Object.prototype.hasOwnProperty.call(cond, 'value');
  const v = hasValue ? (cond as any).value : undefined;

  // Try to map core ops; if not dotted or dotted-one, use columns directly.
  if (!cond.field.includes('.')) {
    const { tableAlias, column } = resolveColumn(mapping, joins, cond.field);
    return applyComparator(knex, qb, knex.raw('??.??', [tableAlias, column]), def.type, name as AnyOp, v);
  }

  const root = cond.field.slice(0, cond.field.indexOf('.'));
  const rel  = mapping.relations?.[root];
  if (!rel) throw Object.assign(new Error(`Relation '${root}' not found in mapping`), { code: 'SQL_RELATION_MISSING', meta: { root } });

  if (rel.kind === 'one') {
    const { tableAlias, column } = resolveColumn(mapping, joins, cond.field);
    return applyComparator(knex, qb, knex.raw('??.??', [tableAlias, column]), def.type, name as AnyOp, v);
  }

  // to-many: use EXISTS
  const leaf = cond.field.slice(cond.field.indexOf('.') + 1);
  const col = (rel.columns || {})[leaf];
  if (!col) throw Object.assign(new Error(`Unknown related scalar '${cond.field}' in mapping.`), { code: 'SQL_COLUMN_MISSING', meta: { field: cond.field } });

  return qb.whereExists(function existsSub(this: any) {
    this.from({ r: rel.table })
      .whereRaw('??.?? = ??.??', ['r', rel.join.foreign, 't0', rel.join.local]);

    applyComparator(knex, this, knex.raw('??.??', ['r', col]), def.type, name as AnyOp, v);
  });
}

function applyNode(
  knex: any,
  qb: any,
  meta: Readonly<FilterableMap>,
  mapping: SqlMapping,
  joins: JoinPlan,
  node: FilterNode,
  custom: CustomOpRegistry | undefined,
) {
  if (isGroup(node)) {
    if ('and' in node) {
      qb.where(function andGroup(this: any) {
        for (const c of node.and) applyNode(knex, this, meta, mapping, joins, c, custom);
      });
      return;
    }
    qb.where(function orGroup(this: any) {
      node.or.forEach((c, i) => {
        if (i === 0) applyNode(knex, this, meta, mapping, joins, c, custom);
        else this.orWhere(function orSub(this: any) {
          applyNode(knex, this, meta, mapping, joins, c, custom);
        });
      });
    });
    return;
  }

  // If custom emitter exists for this op, route via IR
  const def = meta[node.field];
  const opName = node.op.toLowerCase();
  const emitter = def ? custom?.get(node.field, def.type, opName) : undefined;

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

    const rewrite = (n: IR): IR => {
      if ('and' in n) return { and: n.and.map(rewrite) };
      if ('or'  in n) return { or:  n.or.map(rewrite) };
      return (n as { field?: string }).field === '__FIELD__'
        ? ({ ...(n as Exclude<IR, { and: readonly IR[] } | { or: readonly IR[] }>), field: node.field } as IR)
        : n;
    };

    return fromIRToSql(knex, qb, meta, mapping, joins, rewrite(ir), undefined);
  }

  // Core-op path
  applyCondition(knex, qb, meta, mapping, joins, node, custom);
}

/* ======================================================================
 *                         Custom ops (IR) → SQL
 * ====================================================================== */

function fromIRToSql(
  knex: any,
  qb: any,
  meta: Readonly<FilterableMap>,
  mapping: SqlMapping,
  joins: JoinPlan,
  ir: IR,
  _caps: SqlCapabilities | undefined,
) {
  if ('and' in ir) {
    qb.where(function andIR(this: any) {
      ir.and.forEach((n) => fromIRToSql(knex, this, meta, mapping, joins, n, _caps));
    });
    return;
  }
  if ('or' in ir) {
    qb.where(function orIR(this: any) {
      ir.or.forEach((n, i) => {
        if (i === 0) fromIRToSql(knex, this, meta, mapping, joins, n, _caps);
        else this.orWhere(function orSub(this: any) {
          fromIRToSql(knex, this, meta, mapping, joins, n, _caps);
        });
      });
    });
    return;
  }

  // Leaf: convert IR to a condition and reuse applyCondition
  const field = ir.field!;
  const op = ir.op.toLowerCase() as AnyOp;

  if (op === 'between') {
    const [a, b] = [ (ir as any).a, (ir as any).b ];
    applyCondition(knex, qb, meta, mapping, joins, { field, op: 'between', value: [a,b] } as any, undefined);
    return;
  }
  if (op === 'is_null' || op === 'is_not_null') {
    applyCondition(knex, qb, meta, mapping, joins, { field, op } as any, undefined);
    return;
  }

  const val = (ir as any).value ?? (ir as any).values;
  applyCondition(knex, qb, meta, mapping, joins, { field, op, value: val } as any, undefined);
}

/* ======================================================================
 *                         Relation-scoped (to-many) stitching
 * ====================================================================== */

/** Build per-root relation where (only leaves of that relation) */
function relationTailFilter(meta: Readonly<FilterableMap>, root: string, filter?: FilterInput): Array<ConditionNode | { or: ConditionNode[] } | { and: ConditionNode[] }> {
  if (!filter) return [];
  const out: Array<any> = [];

  const collect = (node: FilterNode): any | undefined => {
    if (isGroup(node)) {
      const arr = ('and' in node ? node.and : node.or)
        .map(collect).filter(Boolean) as any[];
      if (!arr.length) return undefined;
      return ('and' in node) ? { and: arr } : { or: arr };
    }
    if (!node.field.startsWith(root + '.')) return undefined;
    const tail = node.field.slice(root.length + 1);
    const def = meta[node.field];
    if (!def) return undefined;
    return { field: tail, op: node.op, value: (node as any).value };
  };

  const top = collect(filter as FilterNode);
  if (!top) return out;

  const flatten = (n: any) => {
    if ('and' in n || 'or' in n) out.push(n);
    else out.push(n as ConditionNode);
  };
  flatten(top);
  return out;
}

/* ======================================================================
 *                         Main resolve()
 * ====================================================================== */

/** Overload 1: ctx + Ctor (plain) */
export async function resolveAddress<T extends object, S extends readonly AddressSelectField[] | undefined = readonly AddressSelectField[] | undefined>(
  ctx: KnexCtx,
  entity: new (...args: never[]) => T,
  filter?: FilterInput,
  custom?: CustomOpRegistry,
  options?: AddressResolveOptions<S> & { shape?: 'plain' },
): Promise<AddressPlain<S, T>[]>;
/** Overload 2: ctx + entityName + Ctor (plain) */
export async function resolveAddress<T extends object, S extends readonly AddressSelectField[] | undefined = readonly AddressSelectField[] | undefined>(
  ctx: KnexCtx,
  entity: string,
  entityCtor: new (...args: never[]) => T,
  filter?: FilterInput,
  custom?: CustomOpRegistry,
  options?: AddressResolveOptions<S> & { shape?: 'plain' },
): Promise<AddressPlain<S, T>[]>;

export async function resolveAddress<T extends object, S extends readonly AddressSelectField[] | undefined = readonly AddressSelectField[] | undefined>(
  ctx: KnexCtx,
  a: string | (new (...args: never[]) => T),
  b?: FilterInput | (new (...args: never[]) => T),
  c?: FilterInput | CustomOpRegistry,
  d?: CustomOpRegistry | AddressResolveOptions<S>,
  e?: AddressResolveOptions<S>,
) {
  // Normalize to: ctor, filter, custom, opts (support ctor form and string+ctor)
  let ctor!: new (...args: never[]) => T;
  let filter: FilterInput | undefined;
  let custom: CustomOpRegistry | undefined;
  let opts: AddressResolveOptions<S> | undefined;

  if (typeof a === 'function') {
    // (ctx, ctor, filter?, custom?, opts?)
    ctor   = a;
    filter = b as FilterInput | undefined;
    custom = c as CustomOpRegistry | undefined;
    opts   = d as AddressResolveOptions<S> | undefined;
  } else {
    if (typeof b === 'function') {
      // (ctx, 'Entity', ctor, filter?, custom?, opts?)
      ctor   = b as new (...args: never[]) => T;
      filter = c as FilterInput | undefined;
      custom = d as CustomOpRegistry | undefined;
      opts   = e as AddressResolveOptions<S> | undefined;
    } else {
      // (ctx, 'Entity', filter?, custom?, opts?)  ← string-only entry; resolve metadata via domain import
      ctor   = DomainAddress as unknown as new (...args: never[]) => T;
      filter = b as FilterInput | undefined;
      custom = c as CustomOpRegistry | undefined;
      opts   = d as AddressResolveOptions<S> | undefined;
    }
  }

  const shape = opts?.shape ?? 'plain';
  if (shape !== 'plain') {
    throw Object.assign(new Error(`SQL resolver supports only 'plain' shape.`), { code: 'SQL_SHAPE_UNSUPPORTED' });
  }

  const caps = requireCaps(ctx);
  const mapping = requireMapping(caps, ctor);

  const knex: any = (ctx as any).knex;
  if (!knex) throw Object.assign(new Error('Knex instance missing on ctx.'), { code: 'KNEX_MISSING' });

  // Decorator metadata & validation
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

  const select = (opts?.query?.select as readonly string[] | undefined) ?? [];
  const sorts  = opts?.query?.sort ?? [];
  const limit  = typeof opts?.query?.limit  === 'number' ? opts!.query!.limit  : undefined;
  const offset = typeof opts?.query?.offset === 'number' ? opts!.query!.offset : undefined;

  // Plan joins (1:1 only) needed by select/sort/filter
  const neededRoots = new Set<string>([
    ...planJoinsForSelect(select),
    ...planJoinsForFilter(meta, filter),
    ...dottedRoots(sorts.map(s => s.field as string)),
  ]);
  const joinPlan: JoinPlan = {};
  for (const r of neededRoots) {
    const rel = mapping.relations?.[r];
    if (rel && rel.kind === 'one') {
      joinPlan[r] = { kind: 'one', alias: `r_${r}` };
    }
  }

  // Build base query
  const qb = knex({ t0: mapping.table });

  // Apply joins for 1:1
  for (const [root, jp] of Object.entries(joinPlan)) {
    const rel = mapping.relations![root]!;
    qb.leftJoin({ [jp.alias]: rel.table }, knex.raw('??.??', ['t0', rel.join.local]), knex.raw('??.??', [jp.alias, rel.join.foreign]));
  }

  // Always select root PK for stitching (hidden)
  const pkAlias = '__pk__';
  qb.select({ [pkAlias]: knex.raw('??.??', ['t0', mapping.primaryKey]) });

  // Build select columns for root scalars and 1:1 leaves
  const selectPaths: string[] = Array.isArray(select) ? Array.from(new Set(select as string[])) : [];
  const toManyRootsSelected = new Set<string>(dottedRoots(selectPaths).filter((r) => (mapping.relations?.[r]?.kind === 'many')));

  const aliasToPath: Record<string, string> = {};
  for (const p of selectPaths) {
    if (!p.includes('.')) {
      const col = mapping.columns[p];
      if (!col) continue;
      const a = aliasOf(p);
      aliasToPath[a] = p;
      qb.select({ [a]: knex.raw('??.??', ['t0', col]) });
      continue;
    }
    const root = p.slice(0, p.indexOf('.'));
    const rel  = mapping.relations?.[root];
    if (!rel) continue;
    if (rel.kind === 'one') {
      const leaf = p.slice(p.indexOf('.') + 1);
      const col = (rel.columns || {})[leaf];
      if (!col) continue;
      const a = aliasOf(p);
      const jp = joinPlan[root];
      if (!jp) continue; // defensive: join may not be planned (e.g. bad mapping); skip
      aliasToPath[a] = p;
      qb.select({ [a]: knex.raw('??.??', [jp.alias, col]) });
    }
    // to-many leaves are loaded later (stitching)
  }

  // WHERE from filter (supports custom ops via IR fallback)
  if (filter) {
    applyNode(knex, qb, meta, mapping, joinPlan, filter as FilterNode, custom);
  }

  // ORDER BY (root + 1:1 only)
  for (const s of sorts) {
    const f = s.field as string;
    const dir = (s.direction ?? 'asc') as 'asc' | 'desc';
    try {
      const { tableAlias, column } = resolveColumn(mapping, joinPlan, f);
      qb.orderBy([{ column: knex.raw('??.??', [tableAlias, column]) as any, order: dir }]);
    } catch {
      // ignore unsupported sorts (e.g., to-many)
    }
  }

  if (typeof limit === 'number')  qb.limit(limit);
  if (typeof offset === 'number') qb.offset(offset);

  const rows: Array<Record<string, unknown>> = await qb;

  // Build a projection object from row using aliasToPath
  const projectRow = (row: Record<string, unknown>): Record<string, unknown> => {
    const out: Record<string, unknown> = {};
    for (const [alias, path] of Object.entries(aliasToPath)) {
      const val = (row as any)[alias];
      const keys = path.split('.');
      let dst = out;
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i]!;
        const last = i === keys.length - 1;
        if (last) {
          dst[k] = val;
        } else {
          if (typeof dst[k] !== 'object' || dst[k] == null) dst[k] = {};
          dst = dst[k] as Record<string, unknown>;
        }
      }
    }
    return out;
  };

  const base: Array<{ __pk__: string | number; data: Record<string, unknown> }> =
    rows.map((r) => ({ __pk__: (r as any)[pkAlias], data: projectRow(r) }));

  // Stitch to-many selections per root relation
  if (toManyRootsSelected.size > 0 && base.length > 0) {
    const ids = base.map(r => r.__pk__);
    for (const root of toManyRootsSelected) {
      const rel = mapping.relations![root]!;
      // Which leaves were requested under this root?
      const leaves = Array.from(new Set(selectPaths
        .filter((p) => p.startsWith(root + '.'))
        .map((p) => p.slice(p.indexOf('.') + 1))));

      if (leaves.length === 0) continue;

      // Build child query
      const cq = knex({ r: rel.table })
        .select([
          knex.raw('?? as __fk__', ['r.' + rel.join.foreign]),
          ...leaves.map((leaf) => {
            const col = (rel.columns || {})[leaf];
            if (!col) throw Object.assign(new Error(`Unknown related scalar '${root}.${leaf}' in mapping.`), { code: 'SQL_COLUMN_MISSING', meta: { field: `${root}.${leaf}` } });
            return knex.raw('?? as ??', ['r.' + col, aliasOf(leaf)]);
          }),
        ])
        .whereIn(knex.raw('??', ['r.' + rel.join.foreign]), ids as any[]);

      // Apply relation-scoped filter (if any leaves present in filter)
      const relCond = relationTailFilter(meta, root, filter);
      if (relCond.length) {
        cq.where(function relGroup(this: any) {
          for (const n of relCond) {
            if ('and' in n || 'or' in n) {
              const group = n as any;
              if ('and' in group) {
                this.where(function subAnd(this: any) {
                  for (const leafNode of group.and as ConditionNode[]) {
                    const col = (rel.columns || {})[leafNode.field];
                    if (!col) continue;
                    const defLeaf = meta[`${root}.${leafNode.field}`];
                    if (!defLeaf) continue;
                    applyComparator(knex, this, knex.raw('??.??', ['r', col]), defLeaf.type, leafNode.op as AnyOp, (leafNode as any).value);
                  }
                });
              } else {
                this.where(function subOr(this: any) {
                  (group.or as ConditionNode[]).forEach((leafNode: ConditionNode, i: number) => {
                    const col = (rel.columns || {})[leafNode.field];
                    if (!col) return;
                    const defLeaf = meta[`${root}.${leafNode.field}`];
                    if (!defLeaf) return;
                    if (i === 0) {
                      applyComparator(knex, this, knex.raw('??.??', ['r', col]), defLeaf.type, leafNode.op as AnyOp, (leafNode as any).value);
                    } else {
                      this.orWhere(function orL(this: any) {
                        applyComparator(knex, this, knex.raw('??.??', ['r', col]), defLeaf.type, leafNode.op as AnyOp, (leafNode as any).value);
                      });
                    }
                  });
                });
              }
            } else {
              const leafNode = n as ConditionNode;
              const col = (rel.columns || {})[leafNode.field];
              if (!col) continue;
              const defLeaf = meta[`${root}.${leafNode.field}`];
              if (!defLeaf) continue;
              applyComparator(knex, this, knex.raw('??.??', ['r', col]), defLeaf.type, leafNode.op as AnyOp, (leafNode as any).value);
            }
          }
        });
      }

      const childRows: Array<Record<string, unknown>> = await cq;

      // Group by foreign key
      const grouped: Record<string | number, any[]> = {};
      for (const cr of childRows) {
        const fk = (cr as any).__fk__;
        const obj: Record<string, unknown> = {};
        for (const leaf of leaves) obj[leaf] = (cr as any)[aliasOf(leaf)];
        (grouped[fk] ||= []).push(obj);
      }

      // Attach to parents
      for (const item of base) {
        const arr = grouped[item.__pk__] || [];
        item.data[root] = arr;
      }
    }
  }

  // Strip __pk__ and return data only
  return base.map((r) => r.data) as AddressPlain<S, T>[];
}
