---
to: <%= out %>/<%= entity %>FilterQuery.ts
---
<%
  // ========= EJS prelude (not emitted to output) =========
  function parseArg(val, fallback) {
    try {
      if (val === undefined || val === null) return fallback;
      if (typeof val === 'string') return JSON.parse(val);
      return val;
    } catch {
      return fallback;
    }
  }

  // Expected shape for FIELDS:
  // [{ name, type: 'string'|'number'|'boolean'|'date'|'enum', enumValues?: string[], operators: string[], nullable?: boolean }]
  const FIELDS = parseArg(fields, []);
  const ENTITY = String(entity);

  // Fail-fast when null-ops are requested on non-nullable scalar fields
  (function mustBeNullableOpsCheck() {
    for (const f of FIELDS) {
      const ops = new Set(Array.isArray(f.operators) ? f.operators : []);
      const wantsNullOps = ops.has('is_null') || ops.has('is_not_null');
      const isScalar = ['string','number','boolean','date','enum'].includes(f.type);
      const isNullable = Boolean(f.nullable);
      if (wantsNullOps && isScalar && !isNullable) {
        throw new Error(
          `[codegen/${ENTITY}FilterQueryPrisma] Field '${f.name}' is not nullable in Prisma schema, ` +
          `but its @Filterable operators include 'is_null'/'is_not_null'. ` +
          `Either mark the column nullable in Prisma schema or remove those operators from @Filterable.`
        );
      }
    }
  })();

  function tsScalarType(f) {
    switch (f.type) {
      case 'string':  return 'string';
      case 'number':  return 'number';
      case 'boolean': return 'boolean';
      case 'date':    return 'Date | string'; // Prisma DateTime accepts Date|string
      case 'enum':
        if (Array.isArray(f.enumValues) && f.enumValues.length) {
          return f.enumValues.map(v => JSON.stringify(v)).join(' | ');
        }
        return 'string';
      default:        return 'unknown';
    }
  }

  function hasOp(f, op) {
    return Array.isArray(f.operators) && f.operators.includes(op);
  }
%>
/* THIS FILE IS AUTO-GENERATED (PRISMA). DO NOT EDIT. */

import type { Prisma } from '@prisma/client';

/** Local base expression type for this entity */
type Expr = Prisma.<%= entity %>WhereInput;

/** Export an entity-scoped alias to avoid symbol collisions in barrels */
export type <%= entity %>Expr = Expr;

/** Boolean groups */
const AND = (parts: ReadonlyArray<Expr>): Expr => ({ AND: parts as Expr[] });
const OR  = (parts: ReadonlyArray<Expr>): Expr => ({ OR:  parts as Expr[] });

export namespace <%= entity %>FilterQueryPrisma {
  export const group = { and: AND, or: OR } as const;
  export const all = (...exprs: ReadonlyArray<Expr>): Expr => AND(exprs);
  export const any = (...exprs: ReadonlyArray<Expr>): Expr => OR(exprs);

<% for (const f of FIELDS) { const T = `T_${f.name}`; %>
  type <%- T %> = <%- tsScalarType(f) %>;

  /** Prisma comparators for '<%- f.name %>' */
  export const <%- f.name %> = {
<% if (hasOp(f, 'eq')) { %>
    eq:  (v: <%- T %>): Expr => ({ <%- f.name %>: { equals: v } }),
<% } %>
<% if (hasOp(f, 'neq')) { %>
    neq: (v: <%- T %>): Expr => ({ <%- f.name %>: { not: v as any } }),
<% } %>
<% if (hasOp(f, 'gt')) { %>
    gt:  (v: <%- T %>): Expr => ({ <%- f.name %>: { gt: v as any } }),
<% } %>
<% if (hasOp(f, 'gte')) { %>
    gte: (v: <%- T %>): Expr => ({ <%- f.name %>: { gte: v as any } }),
<% } %>
<% if (hasOp(f, 'lt')) { %>
    lt:  (v: <%- T %>): Expr => ({ <%- f.name %>: { lt: v as any } }),
<% } %>
<% if (hasOp(f, 'lte')) { %>
    lte: (v: <%- T %>): Expr => ({ <%- f.name %>: { lte: v as any } }),
<% } %>
<% if (hasOp(f, 'in')) { %>
    // Accept readonly arrays; Prisma wants a mutable array here
    in:  (values: ReadonlyArray<<%- T %>>): Expr => ({
      <%- f.name %>: { in: Array.from(values) }
    }),
<% } %>
<% if (hasOp(f, 'between')) { %>
    between: (a: <%- T %>, b: <%- T %>): Expr => ({
      <%- f.name %>: { gte: a as any, lte: b as any }
    }),
<% } %>
<% if (hasOp(f, 'contains')) { %>
    contains: (s: string): Expr => ({ <%- f.name %>: { contains: s } }),
<% } %>
<% if (hasOp(f, 'starts_with')) { %>
    starts_with: (s: string): Expr => ({ <%- f.name %>: { startsWith: s } }),
<% } %>
<% if (hasOp(f, 'ends_with')) { %>
    ends_with:   (s: string): Expr => ({ <%- f.name %>: { endsWith: s } }),
<% } %>
<% if (hasOp(f, 'is_null') && f.nullable) { %>
    is_null: (): Expr => ({ <%- f.name %>: null }),
<% } %>
<% if (hasOp(f, 'is_not_null') && f.nullable) { %>
    is_not_null: (): Expr => ({ <%- f.name %>: { not: null } }),
<% } %>
  } as const;

<% } // end for FIELDS %>
}
