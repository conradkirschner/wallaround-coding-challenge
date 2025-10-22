---
to: <%= out %>/<%= entity %>FilterQuery.ts
---
/* THIS FILE IS AUTO-GENERATED. DO NOT EDIT. */

// Value shape compatible with MikroORM where expressions
type Value =
  | string
  | number
  | boolean
  | Date
  | null
  | readonly Value[]
  | { readonly [k: string]: Value };

// Local (non-exported) base expression type
type Expr = Readonly<Record<string, Value>>;

// Export an entity-scoped alias to avoid symbol collisions in barrels
export type <%= entity %>Expr = Expr;

const AND = (parts: ReadonlyArray<Expr>): Expr => ({ $and: parts as Expr[] });
const OR  = (parts: ReadonlyArray<Expr>): Expr => ({ $or: parts as Expr[] });

/** Escape % and _ for SQL LIKE (no replaceAll to keep lib target broad) */
const likeEscape = (s: string): string => s.replace(/[%_]/g, (m) => '\\' + m);

/** Parse fields JSON coming from hygen CLI and prep helpers */
<%
  const FIELDS = typeof fields === 'string' ? JSON.parse(fields) : (fields || []);
  // Only scalar top-level fields are emitted; dotted fields (relations) are handled by the resolver’s fallback.
  const SCALARS = FIELDS.filter((f) => !String(f.name).includes('.'));
  function makeId(raw) {
    const id = String(raw).replace(/[^A-Za-z0-9_]/g, '_');
    const reserved = new Set([
      'group','all','any','and','or','in','eq','gt','lt','is',
      'default','export','class','function','var','const','let','type','namespace'
    ]);
    return reserved.has(id) ? `f_${id}` : id;
  }
%>

export namespace <%= entity %>FilterQueryMikroORM {
  export const group = { and: AND, or: OR } as const;
  export const all = (...exprs: ReadonlyArray<Expr>): Expr => AND(exprs);
  export const any = (...exprs: ReadonlyArray<Expr>): Expr => OR(exprs);

  <% for (const f of SCALARS) { const id = makeId(f.name); const fops = new Set(f.operators || []); %>
  <% if (f.type === 'enum') { %>
  export type <%= id %>Enum = <%- (f.enumValues || []).map((v) => `'${v}'`).join(' | ') %>;
  type T_<%= id %> = <%= id %>Enum;
  <% } else if (f.type === 'string') { %>
  type T_<%= id %> = string;
  <% } else if (f.type === 'number') { %>
  type T_<%= id %> = number;
  <% } else if (f.type === 'boolean') { %>
  type T_<%= id %> = boolean;
  <% } else if (f.type === 'date') { %>
  type T_<%= id %> = Date;
  <% } else if (f.type === 'uuid') { %>
  type T_<%= id %> = string;
  <% } else { %>
  // Do not use unknown/any; for unsupported types we expose no usable value type.
  type T_<%= id %> = never;
  <% } %>

  /** Ops for '<%= f.name %>' */
  export const <%= id %> = {
    <% if (fops.has('eq')) { %>eq: (v: T_<%= id %>): Expr => ({ <%= f.name %>: v }),<% } %>
    <% if (fops.has('neq')) { %>neq: (v: T_<%= id %>): Expr => ({ <%= f.name %>: { $ne: v } }),<% } %>
    <% if (fops.has('gt')) { %>gt: (v: T_<%= id %>): Expr => ({ <%= f.name %>: { $gt: v } }),<% } %>
    <% if (fops.has('gte')) { %>gte: (v: T_<%= id %>): Expr => ({ <%= f.name %>: { $gte: v } }),<% } %>
    <% if (fops.has('lt')) { %>lt: (v: T_<%= id %>): Expr => ({ <%= f.name %>: { $lt: v } }),<% } %>
    <% if (fops.has('lte')) { %>lte: (v: T_<%= id %>): Expr => ({ <%= f.name %>: { $lte: v } }),<% } %>
    <% if (fops.has('in')) { %>in: (values: ReadonlyArray<T_<%= id %>>): Expr => ({ <%= f.name %>: { $in: values as readonly Value[] } }),<% } %>
    <% if (fops.has('between')) { %>between: (a: T_<%= id %>, b: T_<%= id %>): Expr => AND([{ <%= f.name %>: { $gte: a } }, { <%= f.name %>: { $lte: b } }]),<% } %>
    <% if (fops.has('contains')) { %>contains: (s: string): Expr => ({ <%= f.name %>: { $like: `%${likeEscape(s)}%` } }),<% } %>
    <% if (fops.has('starts_with')) { %>starts_with: (s: string): Expr => ({ <%= f.name %>: { $like: `${likeEscape(s)}%` } }),<% } %>
    <% if (fops.has('ends_with')) { %>ends_with: (s: string): Expr => ({ <%= f.name %>: { $like: `%${likeEscape(s)}` } }),<% } %>
    <% if (fops.has('is_null')) { %>is_null: (): Expr => ({ <%= f.name %>: null }),<% } %>
    <% if (fops.has('is_not_null')) { %>is_not_null: (): Expr => ({ <%= f.name %>: { $ne: null } }),<% } %>
  } as const;

  <% } // end loop %>
}
