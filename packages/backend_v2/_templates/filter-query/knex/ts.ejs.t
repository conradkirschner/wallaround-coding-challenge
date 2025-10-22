---
to: <%= out %>/knex/<%= entity %>FilterQuery.ts
---
/* THIS FILE IS AUTO-GENERATED. DO NOT EDIT. */

/**
 * Minimal structural type to avoid coupling to knex types,
 * while keeping full type-safety (no any/unknown casts).
 */
export type QB = {
  where(col: string, op: string, val: unknown): QB;
  andWhere(col: string, op: string, val: unknown): QB;
  orWhere(col: string, op: string, val: unknown): QB;
  whereNull(col: string): QB;
  whereNotNull(col: string): QB;
  whereIn(col: string, values: readonly unknown[]): QB;
  whereBetween(col: string, range: readonly [unknown, unknown]): QB;
};

type Apply = (qb: QB) => QB;

const like = (pattern: string): [string, string] => ['like', pattern];

const escapeLike = (s: string): string =>
  s.replaceAll('%', '\\%').replaceAll('_', '\\_');

<%
  const FIELDS = JSON.parse(fields);
  const tsType = (t) => {
    switch (t) {
      case 'number': return 'number';
      case 'boolean': return 'boolean';
      case 'date': return 'Date';
      case 'uuid': return 'string';
      case 'enum': return 'Enum';
      default: return 'string';
    }
  };
%>
export namespace <%= entity %>FilterQueryKnex {

<% FIELDS.forEach((f) => { %>
  <% if (f.type === 'enum') { %>
  export type <%= f.name %>Enum = <%- f.enumValues.map(v => `'${v}'`).join(' | ') || "string" %>;
  type Enum = <%= f.name %>Enum;
  <% } %>
  export const <%= f.name %> = {
  <% if (f.operators.includes('eq')) { %>
    eq: (v: <%= tsType(f.type) %>): Apply => (qb) => qb.where('<%= f.name %>', '=', v),
  <% } %>
  <% if (f.operators.includes('neq')) { %>
    neq: (v: <%= tsType(f.type) %>): Apply => (qb) => qb.where('<%= f.name %>', '!=', v),
  <% } %>
  <% if (f.operators.includes('gt')) { %>
    gt: (v: <%= tsType(f.type) %>): Apply => (qb) => qb.where('<%= f.name %>', '>', v),
  <% } %>
  <% if (f.operators.includes('gte')) { %>
    gte: (v: <%= tsType(f.type) %>): Apply => (qb) => qb.where('<%= f.name %>', '>=', v),
  <% } %>
  <% if (f.operators.includes('lt')) { %>
    lt: (v: <%= tsType(f.type) %>): Apply => (qb) => qb.where('<%= f.name %>', '<', v),
  <% } %>
  <% if (f.operators.includes('lte')) { %>
    lte: (v: <%= tsType(f.type) %>): Apply => (qb) => qb.where('<%= f.name %>', '<=', v),
  <% } %>
  <% if (f.operators.includes('in')) { %>
    in: (values: ReadonlyArray<<%= tsType(f.type) %>>): Apply => (qb) => qb.whereIn('<%= f.name %>', values),
  <% } %>
  <% if (f.operators.includes('between')) { %>
    between: (a: <%= tsType(f.type) %>, b: <%= tsType(f.type) %>): Apply => (qb) => qb.whereBetween('<%= f.name %>', [a, b] as const),
  <% } %>
  <% if (f.operators.includes('contains')) { %>
    contains: (needle: string): Apply => (qb) => qb.where('<%= f.name %>', ...like(`%${escapeLike(needle)}%`)),
  <% } %>
  <% if (f.operators.includes('starts_with')) { %>
    starts_with: (prefix: string): Apply => (qb) => qb.where('<%= f.name %>', ...like(`${escapeLike(prefix)}%`)),
  <% } %>
  <% if (f.operators.includes('ends_with')) { %>
    ends_with: (suffix: string): Apply => (qb) => qb.where('<%= f.name %>', ...like(`%${escapeLike(suffix)}`)),
  <% } %>
  <% if (f.operators.includes('is_null')) { %>
    is_null: (): Apply => (qb) => qb.whereNull('<%= f.name %>'),
  <% } %>
  <% if (f.operators.includes('is_not_null')) { %>
    is_not_null: (): Apply => (qb) => qb.whereNotNull('<%= f.name %>'),
  <% } %>
  } as const;

<% }); %>

  export const group = {
    and:
      (...apps: ReadonlyArray<Apply>) =>
      (qb: QB): QB =>
        apps.reduce((acc, fn) => fn(acc), qb),
    or:
      (...apps: ReadonlyArray<Apply>) =>
      (qb: QB): QB => {
        // emulate OR by nesting orWhere chains
        let first = true;
        for (const fn of apps) {
          if (first) {
            // first as AND
            qb = fn(qb);
            first = false;
          } else {
            // re-apply using orWhere via function that assumes where(...) inside fn
            const prev = qb;
            qb = {
              ...prev,
              where: (col: string, op: string, val: unknown) => prev.orWhere(col, op, val),
              andWhere: (col: string, op: string, val: unknown) => prev.orWhere(col, op, val),
              orWhere: (col: string, op: string, val: unknown) => prev.orWhere(col, op, val),
              whereNull: (c: string) => prev.orWhere(c, 'is', null),
              whereNotNull: (c: string) => prev.orWhere(c, 'is not', null),
              whereIn: (c: string, v: readonly unknown[]) => prev.orWhere(c, 'in', v as unknown as unknown[]),
              whereBetween: (c: string, r: readonly [unknown, unknown]) => prev.orWhere(c, 'between', r as unknown as unknown[]),
            };
            qb = fn(qb);
            qb = prev;
          }
        }
        return qb;
      },
  } as const;
}
