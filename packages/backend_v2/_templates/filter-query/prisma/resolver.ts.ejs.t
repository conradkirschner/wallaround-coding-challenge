---
to: <%= out %>/<%= entity %>Resolver.ts
---
<%
/* ========= EJS prelude ========= */
function parseArg(val, fallback) {
  try {
    if (val === undefined || val === null) return fallback;
    if (typeof val === 'string') return JSON.parse(val);
    return val;
  } catch (_) {
    return fallback;
  }
}

// Provided by generator (scripts/generate-filter-queries.ts)
const FIELDS          = parseArg(fields, []);      // [{ name, type, operators, enumValues }]
const SELECTS         = parseArg(selects, []);     // string[]
// New: rich relation metadata (root → kind + defaultQuantifier)
// e.g. { "address": { "kind":"one" }, "posts": { "kind":"many", "defaultQuantifier":"some" }, "tags": { "kind":"many", "defaultQuantifier":"some" } }
const REL_META        = parseArg(relationsMeta, {}); // object map
// If legacy "relations" (array) was provided, coerce to kind:'one' default
const RELATIONS_ARRAY = parseArg(relations, []);
for (const r of (Array.isArray(RELATIONS_ARRAY) ? RELATIONS_ARRAY : [])) {
  if (!REL_META[r]) REL_META[r] = { kind: 'one' };
}

// Distinct, sorted operator list across all fields
const ALL_OPS = Array.from(new Set(
  FIELDS.flatMap(f => Array.isArray(f.operators) ? f.operators : [])
)).sort();

// Helper — emit code only if op is present in ALL_OPS
const hasOp = (op) => ALL_OPS.includes(op);
/* ================================= */
%>
/* THIS FILE IS AUTO-GENERATED. DO NOT EDIT. */

import type { Prisma, PrismaClient } from '@prisma/client';
import type { FilterInput, FilterNode, ConditionNode, Primitive } from 'src/filtering/ast';
import { getFilterableMetadata, type FilterableMap, type FieldType } from 'src/filtering/filterable';
import { CustomOpRegistry, type IR } from 'src/filtering/custom-ops';
import { validateFilter } from 'src/filtering/validate';
import { getSelectableFields } from 'src/filtering/expose';
import { type FilterLimits } from 'src/filtering/limits';

import type {
  Where_<%= entity %>,
  OrderBy_<%= entity %>,
  Select_<%= entity %>,
  Quantifier_<%= entity %>,
  ResultFromSelect_<%= entity %>,
} from './<%= entity %>PrismaQuery';

/** Compile-time selectability (provided by codegen) */
export const SELECTABLE_<%= entity %> = <%- JSON.stringify(SELECTS) %> as const;
/** Utility: if A is never, use B */
type Fallback<A, B> = [A] extends [never] ? B : A;
export type SelectField_<%= entity %> = Fallback<typeof SELECTABLE_<%= entity %>[number], string>;

/** Relation meta (kind & default quantifier) */
export const REL_META_<%= entity %> = <%- JSON.stringify(REL_META) %> as const;
export type RelationRoot_<%= entity %> = keyof typeof REL_META_<%= entity %>;

/** Operator union derived from @Filterable annotations (entity-scoped to avoid collisions) */
export const OPS_<%= entity %> = <%- JSON.stringify(ALL_OPS) %> as const;
export type Operator_<%= entity %> = typeof OPS_<%= entity %>[number];

/** Group guard */
const isGroup = (n: FilterNode): n is { and: readonly FilterNode[] } | { or: readonly FilterNode[] } =>
  Object.prototype.hasOwnProperty.call(n, 'and') || Object.prototype.hasOwnProperty.call(n, 'or');

/** LIKE escaping (no replaceAll to keep lib targets broad) */
const likeEscape = (s: string): string => s.replace(/[%_]/g, (m) => '\\' + m);

/** Build Prisma scalar filter node for a leaf (per operator) */
function scalarToPrisma(field: string, op: string, value: Primitive | readonly Primitive[] | readonly [Primitive, Primitive] | undefined) {
  <% if (hasOp('eq')) { %>
  if (op === 'eq')       return { [field]: { equals: value as Primitive | null } };
  <% } %>
  <% if (hasOp('neq')) { %>
  if (op === 'neq')      return { [field]: { not: value as Primitive | null } };
  <% } %>
  <% if (hasOp('gt')) { %>
  if (op === 'gt')       return { [field]: { gt: value as Primitive } };
  <% } %>
  <% if (hasOp('gte')) { %>
  if (op === 'gte')      return { [field]: { gte: value as Primitive } };
  <% } %>
  <% if (hasOp('lt')) { %>
  if (op === 'lt')       return { [field]: { lt: value as Primitive } };
  <% } %>
  <% if (hasOp('lte')) { %>
  if (op === 'lte')      return { [field]: { lte: value as Primitive } };
  <% } %>
  <% if (hasOp('in')) { %>
  if (op === 'in')       return { [field]: { in: value as readonly Primitive[] } };
  <% } %>
  <% if (hasOp('between')) { %>
  if (op === 'between')  { const [a, b] = value as readonly [Primitive, Primitive]; return { [field]: { gte: a, lte: b } }; }
  <% } %>
  <% if (hasOp('contains')) { %>
  if (op === 'contains') return { [field]: { contains: String(value) } };
  <% } %>
  <% if (hasOp('starts_with')) { %>
  if (op === 'starts_with') return { [field]: { startsWith: String(value) } };
  <% } %>
  <% if (hasOp('ends_with')) { %>
  if (op === 'ends_with') return { [field]: { endsWith: String(value) } };
  <% } %>
  <% if (hasOp('is_null')) { %>
  if (op === 'is_null')  return { [field]: { equals: null } };
  <% } %>
  <% if (hasOp('is_not_null')) { %>
  if (op === 'is_not_null') return { [field]: { not: null } };
  <% } %>
  throw Object.assign(new Error(`Operator '${op}' not enabled for field '${field}'`), {
    code: 'FILTER_OPERATOR_UNSUPPORTED',
    meta: { field, op },
  });
}

/** Parse a path segment possibly carrying a quantifier suffix: "posts:every" → { name:"posts", q:"every" } */
function parseSegment(seg: string): { name: string; q?: 'some' | 'every' | 'none' } {
  const idx = seg.indexOf(':');
  if (idx < 0) return { name: seg };
  const name = seg.slice(0, idx);
  const q = seg.slice(idx + 1) as 'some' | 'every' | 'none';
  return { name, q };
}

/** Wrap a leaf where object through relation segments using REL_META (handles 1:1, 1:n, n:n) */
function wrapThroughRelations_<%= entity %>(
  fieldPath: string,
  leaf: Record<string, unknown>,
): Where_<%= entity %> {
  const parts = fieldPath.split('.');
  if (parts.length < 2) return leaf as Where_<%= entity %>;

  // all but the last segment are relations; last is scalar field name we've already used in leaf
  const relSegs = parts.slice(0, -1);
  let acc: Record<string, unknown> = leaf;

  for (let i = relSegs.length - 1; i >= 0; i--) {
    const { name, q } = parseSegment(relSegs[i]!);
    const meta = (REL_META_<%= entity %> as Record<string, { kind: 'one' | 'many'; defaultQuantifier?: Quantifier_<%= entity %> }>)[name];
    if (!meta) {
      throw Object.assign(new Error(`Unknown relation root '${name}' in path '${fieldPath}'`), {
        code: 'FILTER_RELATION_UNKNOWN', meta: { relation: name, path: fieldPath },
      });
    }

    if (meta.kind === 'one') {
      // to-one: Prisma uses { is: { ... } } for filtering child fields
      acc = { [name]: { is: acc } };
    } else {
      // to-many / n:n
      const quant: Quantifier_<%= entity %> = q ?? (meta.defaultQuantifier ?? 'some');
      acc = { [name]: { [quant]: acc } };
    }
  }

  return acc as Where_<%= entity %>;
}

/** IR → Prisma where (only emits ops present in @Filterable metadata) */
function fromIR_<%= entity %>(ir: IR): Where_<%= entity %> {
  if ('and' in ir) return { AND: ir.and.map(fromIR_<%= entity %>) as Where_<%= entity %>[] };
  if ('or'  in ir) return { OR:  ir.or.map(fromIR_<%= entity %>) as Where_<%= entity %>[] };

  const f = ir.field ?? '__FIELD__';
  const dotted = f.includes('.');
  const op = ir.op;

  // leaf scalar → Prisma scalar filter
  const leaf = (() => {
    <% if (hasOp('eq')) { %> if (op === 'eq')  return scalarToPrisma(dotted ? f.split('.').at(-1)! : f, 'eq',  ir.value); <% } %>
    <% if (hasOp('neq')) { %> if (op === 'neq') return scalarToPrisma(dotted ? f.split('.').at(-1)! : f, 'neq', ir.value); <% } %>
    <% if (hasOp('gt')) { %> if (op === 'gt')  return scalarToPrisma(dotted ? f.split('.').at(-1)! : f, 'gt',  ir.value); <% } %>
    <% if (hasOp('gte')) { %> if (op === 'gte') return scalarToPrisma(dotted ? f.split('.').at(-1)! : f, 'gte', ir.value); <% } %>
    <% if (hasOp('lt')) { %> if (op === 'lt')  return scalarToPrisma(dotted ? f.split('.').at(-1)! : f, 'lt',  ir.value); <% } %>
    <% if (hasOp('lte')) { %> if (op === 'lte') return scalarToPrisma(dotted ? f.split('.').at(-1)! : f, 'lte', ir.value); <% } %>
    <% if (hasOp('in')) { %> if (op === 'in')  return scalarToPrisma(dotted ? f.split('.').at(-1)! : f, 'in',  ir.values as readonly Primitive[]); <% } %>
    <% if (hasOp('between')) { %> if (op === 'between') return scalarToPrisma(dotted ? f.split('.').at(-1)! : f, 'between', [ir.a, ir.b] as readonly [Primitive, Primitive]); <% } %>
    <% if (hasOp('contains')) { %> if (op === 'contains') return scalarToPrisma(dotted ? f.split('.').at(-1)! : f, 'contains', ir.value); <% } %>
    <% if (hasOp('starts_with')) { %> if (op === 'starts_with') return scalarToPrisma(dotted ? f.split('.').at(-1)! : f, 'starts_with', ir.value); <% } %>
    <% if (hasOp('ends_with')) { %> if (op === 'ends_with') return scalarToPrisma(dotted ? f.split('.').at(-1)! : f, 'ends_with', ir.value); <% } %>
    <% if (hasOp('is_null')) { %> if (op === 'is_null') return scalarToPrisma(dotted ? f.split('.').at(-1)! : f, 'is_null', undefined); <% } %>
    <% if (hasOp('is_not_null')) { %> if (op === 'is_not_null') return scalarToPrisma(dotted ? f.split('.').at(-1)! : f, 'is_not_null', undefined); <% } %>
    throw Object.assign(new Error(`Operator '${op}' not enabled by @Filterable metadata`), {
      code: 'FILTER_OPERATOR_UNSUPPORTED', meta: { field: f, op }
    });
  })();

  if (!dotted) return leaf as Where_<%= entity %>;
  return wrapThroughRelations_<%= entity %>(f, leaf);
}

/** Condition → Prisma where (generic, dotted aware, custom IR fallback) */
function emitCondition_<%= entity %>(
  field: string,
  fieldType: FieldType,
  cond: ConditionNode,
  custom?: CustomOpRegistry,
  defAllowed?: readonly Operator_<%= entity %>[],
): Where_<%= entity %> {
  const name = cond.op.toLowerCase();
  if (defAllowed && !(defAllowed as readonly string[]).includes(name)) {
    throw Object.assign(new Error(`Operator '${name}' is not allowed for field '${field}'`), {
      code: 'FILTER_OPERATOR_UNSUPPORTED',
      meta: { field, op: name, allowed: defAllowed },
    });
  }

  const hasValue = Object.prototype.hasOwnProperty.call(cond, 'value');
  if (custom) {
    const emitter = custom.get(field, fieldType, name);
    if (emitter) {
      // compute IR with provided value shape
      const ir: IR = (() => {
        if (hasValue) {
          const v = (cond as { value: Primitive | readonly Primitive[] | readonly [Primitive, Primitive] | undefined }).value;
          if (Array.isArray(v)) {
            if (v.length === 2 && 0 in v && 1 in v) return (emitter as (a: Primitive, b: Primitive) => IR)(v[0] as Primitive, v[1] as Primitive);
            return (emitter as (arr: readonly Primitive[]) => IR)(v as readonly Primitive[]);
          }
          return (emitter as (a: Primitive) => IR)(v as Primitive);
        }
        return (emitter as () => IR)();
      })();

      // __FIELD__ → actual dotted field
      const rewrite = (node: IR): IR => {
        if ('and' in node) return { and: node.and.map(rewrite) };
        if ('or'  in node) return { or:  node.or.map(rewrite) };
        return (node as { field?: string }).field === '__FIELD__'
          ? ({ ...(node as Exclude<IR, { and: readonly IR[] } | { or: readonly IR[] }>), field } as IR)
          : node;
      };

      return fromIR_<%= entity %>(rewrite(ir));
    }
  }

  // Fall back to direct mapping → IR shim for a single condition
  const ir: IR = Object.prototype.hasOwnProperty.call(cond, 'value')
    ? { field, op: cond.op as IR['op'], value: (cond as { value: any }).value }
    : { field, op: cond.op as IR['op'] };

  return fromIR_<%= entity %>(ir);
}

/** Recursively build Prisma where-input from the filter AST */
export function buildWhere_<%= entity %>(
  meta: Readonly<FilterableMap>,
  node: FilterNode,
  custom?: CustomOpRegistry,
): Where_<%= entity %> {
  if (isGroup(node)) {
    if ('and' in node) return { AND: node.and.map((child) => buildWhere_<%= entity %>(meta, child, custom)) as Where_<%= entity %>[] };
    return { OR: node.or.map((child) => buildWhere_<%= entity %>(meta, child, custom)) as Where_<%= entity %>[] };
  }

  const def = meta[node.field];
  if (!def) {
    throw Object.assign(new Error(`Field '${node.field}' is not filterable`), {
      code: 'FILTER_FIELD_NOT_ALLOWED',
      meta: { field: node.field },
    });
  }
  const allowed = def.operators.filter((o): o is Operator_<%= entity %> => (OPS_<%= entity %> as readonly string[]).includes(o));
  return emitCondition_<%= entity %>(node.field, def.type, node, custom, allowed);
}

/** Build Prisma "select" tree from flat select paths (strict projection; no extra fields) */
function buildSelectTree_<%= entity %>(select?: readonly SelectField_<%= entity %>[]): Select_<%= entity %> | undefined {
  if (!select || select.length === 0) return undefined;
  const out: Record<string, unknown> = {};

  for (const p of (select as readonly string[])) {
    const parts = p.split('.');
    let cursor: Record<string, unknown> = out;

    for (let i = 0; i < parts.length; i++) {
      const raw = parts[i]!;
      const { name } = parseSegment(raw);

      if (i === parts.length - 1) {
        cursor[name] = true; // scalar at leaf
      } else {
        const child = (cursor[name] ??= { select: {} }) as { select: Record<string, unknown> };
        cursor = child.select;
      }
    }
  }

  return out as Select_<%= entity %>;
}

/** orderBy: reject paths crossing a 'many' segment; allow scalars or through 'one' only */
function buildOrderBy_<%= entity %>(orders?: ReadonlyArray<{ field: SelectField_<%= entity %>; direction?: 'asc' | 'desc' }>): OrderBy_<%= entity %>[] | undefined {
  if (!orders || orders.length === 0) return undefined;

  const result: OrderBy_<%= entity %>[] = [];

  for (const ord of orders as ReadonlyArray<{ field: string; direction?: 'asc' | 'desc' }>) {
    const parts = ord.field.split('.');
    const dir = ord.direction ?? 'asc';

    // If any non-leaf segment is a 'many', reject (Prisma cannot order by a to-many chain without aggregates)
    for (let i = 0; i < parts.length - 1; i++) {
      const { name } = parseSegment(parts[i]!);
      const meta = (REL_META_<%= entity %> as Record<string, { kind: 'one' | 'many'; defaultQuantifier?: 'some' | 'every' | 'none' }>)[name];
      if (meta && meta.kind === 'many') {
        throw Object.assign(new Error(`Cannot order by to-many path '${ord.field}'`), {
          code: 'ORDER_BY_UNSUPPORTED',
          meta: { field: ord.field },
        });
      }
    }

    // Build nested orderBy object
    let acc: Record<string, unknown> = {};
    let curr = acc;
    for (let i = 0; i < parts.length - 1; i++) {
      const { name } = parseSegment(parts[i]!);
      const next: Record<string, unknown> = {};
      curr[name] = next;
      curr = next;
    }
    curr[parts[parts.length - 1]!] = dir;
    result.push(acc as OrderBy_<%= entity %>);
  }

  return result.length ? result : undefined;
}

/** Resolve options (entity-scoped, with strongly-typed select list) */
export interface ResolveOptions_<%= entity %><S extends readonly SelectField_<%= entity %>[] = readonly SelectField_<%= entity %>[]> {
  limits?: Partial<FilterLimits>;
  query?: {
    select?: S;
    sort?: ReadonlyArray<{ field: SelectField_<%= entity %>; direction?: 'asc' | 'desc' }>;
    limit?: number;   // maps to Prisma "take"
    offset?: number;  // maps to Prisma "skip"
  };
  security?: { requireSelectableForFilter?: boolean };
}

/** Compute the plain result type from the "select" list */
type PlainResult_<%= entity %><S extends readonly SelectField_<%= entity %>[] | undefined> =
  ResultFromSelect_<%= entity %><Prisma.<%= entity %>GetPayload<{ select: {} }>, Fallback<S, readonly []>>;

/** Main resolver (Prisma) — returns plain projected objects only (by design, Prisma has no entity class) */
export async function resolvePrisma<%= entity %><S extends readonly SelectField_<%= entity %>[] = readonly SelectField_<%= entity %>[]>(
  prisma: PrismaClient,
  filter?: FilterInput,
  custom?: CustomOpRegistry,
  options?: ResolveOptions_<%= entity %><S>,
): Promise<PlainResult_<%= entity %><S>[]> {
  const meta = getFilterableMetadata((null as unknown) as Function); // meta is global (decorators) — ctor unused in Prisma
  // ^ In your project, getFilterableMetadata accepts ctor; if you require ctor, pass the actual class in your generator
  // or adapt getFilterableMetadata to accept an entity token. Keeping this line to preserve framework-agnostic flow.

  // Validate the filter against @Filterable + selectable policy
  if (filter) {
    const selectableRoots: readonly string[] = (() => {
      const s = getSelectableFields((null as unknown) as Function);
      return Array.isArray(s) ? s : Array.from(s as ReadonlySet<string>);
    })();

    validateFilter(meta, filter, options?.limits, {
      requireSelectableForFilter: Boolean(options?.security?.requireSelectableForFilter),
      selectable: selectableRoots,
    });
  }

  const where: Where_<%= entity %> = filter ? buildWhere_<%= entity %>(meta, filter, custom) : {};

  const selectTree = buildSelectTree_<%= entity %>(options?.query?.select);
  const orderBy    = buildOrderBy_<%= entity %>(options?.query?.sort);
  const take       = typeof options?.query?.limit === 'number'  ? options!.query!.limit  : undefined;
  const skip       = typeof options?.query?.offset === 'number' ? options!.query!.offset : undefined;

  // NOTE: We intentionally use `findMany({ where, select })` only; includes are not used so we never over-fetch.
  const rows = await (prisma as any).<%= entity.charAt(0).toLowerCase() + entity.slice(1) %>.findMany({
    ...(Object.keys(where).length ? { where } : {}),
    ...(selectTree ? { select: selectTree } : {}),
    ...(orderBy ? { orderBy } : {}),
    ...(typeof take === 'number' ? { take } : {}),
    ...(typeof skip === 'number' ? { skip } : {}),
  });

  return rows as PlainResult_<%= entity %><S>[];
}
