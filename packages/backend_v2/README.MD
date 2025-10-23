# filter-me - A framework agnostic filter library 
> This is an Alpha Version - Do not use it in production as it might cause security issues. We will remove this warning once we are sure.
  
For convience this package currently contains too many dependencies (prisma, microorm, nestjs). We will split the library part out of it once we have time.

> 🔴IMPORTANT🔴  
>  
> This Package is not released, as the name might change.
> 
> 🔴DO NOT INSTALL IT FROM NPM / ANYWHERE!🔴 

filter-me is a type-safe, metadata-driven filtering engine for Node/TypeScript.
Annotate your domain models once (@Filterable, @Selectable, @Sortable) and let filter-me compile validated, injection-safe queries for your data layer. 
It ships with adapters for Prisma and MikroORM, supports dotted relation paths, merges relation operators automatically, and handles 
projection, sorting, pagination, and relation-scoped predicates. Custom operators plug in via a small IR*, so you can extend behavior without leaking driver details.
Think of it as a tiny compiler that turns a clean filter AST into efficient, driver-specific queries, fast to integrate, easy to test, and hard to misuse.

If you are interessted why we build it like that, read the architecture design decisions. 

> If you are not the annotation person, we provide a configuration based compile mode (see prisma example) | But still class based yet

*“via a small IR”, what does that mean?

IR stands for Intermediate Representation. In filter-me, it’s just a tiny, driver-agnostic JSON shape that describes what you want to filter, not how the database should express it. Think of it like a neutral checklist the adapters can translate into each ORM’s query syntax.

A simple comparison looks like:
```ts
{ field: 'city', op: 'contains', value: 'York' }
```
A range looks like:
```ts
{ field: 'age', op: 'between', a: 18, b: 30 }
```
You can combine conditions:
```ts
{ and: [
  { field: 'isActive', op: 'eq', value: true },
  { field: 'email', op: 'contains', value: '@example.com' },
] }
```
Adapters (Prisma, MikroORM) take this IR and turn it into their own query objects.
This makes custom operators easy:  
you implement a tiny function that returns IR, and filter-me handles the rest for both adapters, this means -> no ORM/Driver-specific code required.

## How to use

This section shows a minimal, end-to-end flow: annotate a model, generate adapter code, and run a typed, validated query with **Prisma** or **MikroORM**.

> TL;DR: Decorate your entities ➜ run codegen ➜ call the generated `resolve<Entity>` with a `FilterInput`.

---

### 1) Install & enable decorators

```bash
npm i filter-me reflect-metadata
# plus pick your ORM, e.g.:
npm i @prisma/client        
# or:  npm i @mikro-orm/core @mikro-orm/postgresql
```

Enable TS emit for decorators (tsconfig):

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

At your app entrypoint:

```ts
import 'reflect-metadata';
```

---

### 2) Annotate your domain model

```ts
import { Filterable, Selectable, Sortable } from 'filter-me/decorators';
// Add your MicroORM relation here if you use the MicroORM adapter, with prisma keep generate your client first
// Example fields (string + number) and a relation
export class User {
  @Selectable() @Sortable()
  @Filterable({ type: 'string', operators: ['eq','neq','in','contains','starts_with','ends_with'] })
  email!: string;

  @Selectable() @Sortable()
  @Filterable({ type: 'number', operators: ['eq','neq','gt','gte','lt','lte','between','in'] })
  age!: number;
  
  // Allow the Relation for filtering,
  // set the relation kind to 'many' or 'one'
  // the defaultQuantifier is currently used for PrismaORM (might change in future)
  @FilterableRelation(() => Post, { kind: 'many', depth: 1, defaultQuantifier: 'some' })
  address?: Address;
}

export class Address {
  @Selectable() @Sortable()
  @Filterable({ type: 'string', operators: ['eq','neq','in','contains','starts_with','ends_with'] })
  city!: string;
}
```

> Tip: Dotted fields (`address.city`) **inherit/merge** their operator set from the related field. If `Address.city` supports `contains`, then `user.address.city` does too.

---

### 3) Generate adapter files (codegen)

Use the CLI (example for **Prisma**):

```bash
npx filter-me codegen prisma \
  --entity User \
  --out src/generated \
  --relations '["address"]' \
  --selects '["id","email","age","address","address.city"]' \
  --fields '[
    {"name":"email","type":"string","operators":["eq","neq","in","contains","starts_with","ends_with"]},
    {"name":"age","type":"number","operators":["eq","neq","gt","gte","lt","lte","between","in"]},
    {"name":"address.city","type":"string","operators":["eq","neq","in","contains","starts_with","ends_with"]}
  ]'
```

This emits (paths will match your `--out`):

- `src/generated/UserFilterQueryPrisma.ts`
- `src/generated/UserResolver.ts`
### OR run directly (Based on your annotations)
> Use `npm run codegen:filters:microorm` to emit MikroORM adapters with the same inputs.  
> Use `npm run codegen:filters:prisma` to emit Prisma adapters with the same inputs.

---

### 4) Build a filter (the tiny IR / Filter AST)

The filter is just a plain object declaring **what** to match:

```ts
import type { FilterInput } from 'filter-me/ast';

const filter: FilterInput = {
  and: [
    { field: 'email',        op: 'contains', value: '@example.com' },
    { field: 'address.city', op: 'eq',       value: 'Berlin'       },
    { field: 'age',          op: 'between',  value: [18, 30]       },
  ]
};
```

---

### 5A) Query with Prisma

```ts
import { PrismaClient } from '@prisma/client';
import { resolveUser } from './generated/UserResolver';
import type { PrismaCtx } from 'filter-me/runtime/driver';

const prisma = new PrismaClient();
const ctx: PrismaCtx = { client: prisma };

const rows = await resolveUser(
  ctx,
  'User',                         // you can also pass the ctor
  filter,
  /* custom ops */ undefined,
  {
    query: {
      select: ['id','email','age','address.city'],
      sort:   [{ field: 'email', direction: 'asc' }],
      limit:  20,
      offset: 0,
    },
    // 'plain' (default) returns only selected fields; 'entity' returns the full Prisma payload
    shape: 'plain',
    // Optional: validate filter using @Selectable roots
    security: { requireSelectableForFilter: true },
  }
);

console.log(rows);
/*
[
  { id: '...', email: 'a@example.com', age: 23, address: { city: 'Berlin' } },
  ...
]
*/
```

- Dotted selects (e.g. `address.city`) are translated into nested Prisma `select`.
- Dotted filters merge the operators from the related field (no extra config required).
- To filter to-many relations, add them to `--relations` at codegen; the resolver will build relation-scoped `where` for nested selections.

---

### 5B) Query with MikroORM

```ts
import { MikroORM } from '@mikro-orm/core';
import { resolveUser } from './generated/UserResolver';
import type { MikroOrmCtx } from 'filter-me/runtime/driver';

const orm = await MikroORM.init(/* ... */);
const ctx: MikroOrmCtx = { em: orm.em };

const rows = await resolveUser(
  ctx,
  'User',
  filter,
  /* custom ops */ undefined,
  {
    query: {
      select: ['id','email','age','address.city'],
      sort:   [{ field: 'email', direction: 'asc' }],
      limit:  20,
      offset: 0,
    },
    shape: 'plain'
  }
);

console.log(rows);
```

- To avoid runtime errors, the resolver flattens dotted `fields` and derives `populate` roots automatically.
- Relation-scoped `populateWhere` is generated from the same filter for to-many relations.

---

### 6) Add a custom operator (optional)

You can define app-specific operators without touching ORM code. Implement a tiny function that returns IR, then register it:

```ts
import { CustomOpRegistry, type IR } from 'filter-me/custom-ops';

const custom = new CustomOpRegistry()
  .register('email', 'string', 'domain_is', (domain: string): IR => ({
    // __FIELD__ is replaced with the actual field at runtime
    field: '__FIELD__',
    op: 'contains',
    value: `@${domain}`,
  }));

// Usage:
const filterWithCustom: FilterInput = {
  and: [
    { field: 'email', op: 'domain_is', value: 'example.com' },
  ]
};

// Pass `custom` to resolveUser(..., custom, options)
```

---

### 7) Validation & limits

Every `resolve*` validates the filter against your decorators. You can pass limits:

```ts
const rows = await resolveUser(ctx, 'User', filter, undefined, {
  limits: {
    maxAnd: 10,
    maxOr:  10,
    // …other limits you exposed
  },
  // When you expose it to public make sure this is true!
  // Annotate your selectable properties in your class 
  security: { requireSelectableForFilter: true },
});
```

If something’s off, you’ll get clear, structured errors:

```ts
try {
  await resolveUser(ctx, 'User', badFilter);
} catch (err: any) {
  if (err.code === 'FILTER_OPERATOR_UNSUPPORTED') {
    // err.meta.field, err.meta.op, err.meta.allowed
  }
}
```

---

### 8) Common tips

- Keep `--selects` aligned with what your API is allowed to expose.
- Add dotted select roots (e.g. `"address"`) when selecting nested fields (e.g. `"address.city"`).
- For Prisma: pass `relations` with kind `"many"` when you need nested filtering (`where`) on to-many relations.
- For MikroORM: nested filtering is applied via `populateWhere` automatically for to-many roots.

That’s it - decorate, generate, and query.

## Adding a New Adapter

This guide explains how to add your own **adapter** the small, ORM/driver‑specific layer that converts our filtering AST + metadata into a query for your data engine.  
We ship adapters for **MikroORM** and **Prisma**; you can follow the same pattern for any other driver. There is no Limit in implementing drivers  

Future Driver that are planned: 
- [ ] payload cms 
- [ ] directus cms 
- [ ] strapi cms 
- [ ] memory object filter
- [ ] native sql filter
- [ ] native no sql filter

---

### What’s an “adapter” here?

An adapter is a generated per‑entity resolver that:

1. Validates user filters against your entity’s `@Filterable` / `@Selectable` metadata.
2. Translates the filter AST (and any custom ops) into your driver’s `where` shape.
3. Builds `select`, `order/sort`, and relation‑scoped predicates.
4. Executes the query via a driver‑specific **context** (e.g., `ctx.client.user.findMany` for Prisma, or `em.find` for MikroORM).
5. Returns either **plain** (projected) objects or full **entity** payloads.

You implement this once as a **template**, then codegen creates the resolver for each entity.

---

### Prerequisites

- You already use the decorators that power metadata:
    - `@Filterable({ type, operators })`
    - `@Selectable()`, `@Sortable()`
- You’re familiar with these utility modules:
    - `src/filtering/ast` – the filter AST types.
    - `src/filtering/filterable` – metadata readers.
    - `src/filtering/validate` – metadata‑aware validation.
    - `src/filtering/custom-ops` – custom operator registry + IR.
    - `src/filtering/expose` – determines selectable fields.
    - `src/filtering/limits` – optional guardrails for filters.

---

### The moving pieces (mental model)

- **Filter AST**: Nested `and/or` groups containing **conditions** (`field`, `op`, `value`).
- **Metadata**: For each `field` (including dotted relation paths), which **operators** are allowed.
- **Custom Ops → IR**: If an op isn’t a built‑in comparator, your adapter gets an **IR** tree to translate.
- **Adapter responsibilities**: Where/Select/Order mapping + relation scoping + execution.

---

### Quick Checklist

1. **Define a driver context** (how to execute queries) [Add in ./filtering/runtime/driver](/packages/backend_v2/src/filtering/runtime/driver.ts).
2. **Map operators** to your driver’s comparators.
3. **Handle relations** (1:1 vs 1:n) and dotted fields.
4. **Build select** (projection) and **orderBy** (sorting).
5. **Support custom ops** (IR translation).
6. **Implement `resolve<Entity>`** with the overloads and shapes.
7. **Wire up the code generator** (EJS template).
8. **Test**: unit + integration.

---

### 1) Define your driver context

Create a driver‑specific context type in `src/filtering/runtime/driver/<your-adapter>.ts`. It must be passable as the first arg to `resolve<Entity>` and include what you need to run a query.

**Example (pseudo)**

```ts
export interface MyDriverCtx {
  client: { /* your SDK/connection */ };
  // optional: logger, tenant, etc.
}
```

---

### 2) Operator mapping

You need a **wide union** of ops so your switch/case always type‑checks, *and* a **per‑field allowlist** so you only accept operators that metadata allows.

**Guidelines**

- Keep a wide union like:
  ```ts
  type AnyOp =
    | 'eq' | 'neq'
    | 'gt' | 'gte' | 'lt' | 'lte'
    | 'in' | 'between'
    | 'contains' | 'starts_with' | 'ends_with'
    | 'is_null' | 'is_not_null'
    | string; // (for future custom ops)
  ```
- Validate each condition with `def.operators` coming from metadata:
  ```ts
  const allowed = def.operators as readonly string[];
  if (!allowed.includes(op)) throw UNSUPPORTED;
  ```
- Map known ops to your driver’s comparator keys. For strings (`contains`, `starts_with`, `ends_with`) ensure values are strings. For `in`, convert readonly arrays to mutable arrays if your driver needs it.

---

### 3) Relations & dotted fields

- Use relation metadata from `getFilterableRelationsMeta(ctor)`.
- For 1:1 use `{ root: { is: {...} } }` (Prisma) or a nested object (MikroORM).
- For 1:n use a quantifier (`some`/`every`/`none`) if your engine supports it (Prisma), or a nested `populateWhere`/`$and/$or` structure (MikroORM).
- Implement helpers:
    - **Top‑level** conditions with dotted fields → wrap under relation root (e.g., `nestRelWhere` in Prisma).
    - **Relation‑scoped** filter for nested selection:
        - Prisma: build a `RelationWhereMap` and attach `where` in nested select for **to‑many** only.
        - MikroORM: compute a `populateWhere` map keyed by relation roots.

---

### 4) Select & Order

- **Select**:
    - Split requested select fields into **scalar** vs dotted **relation.leaf**.
    - Build driver‑specific `select` (Prisma) or `fields`/`populate` (MikroORM).
    - Avoid emitting unknown dotted roots, ignore to prevent invalid selects.
- **Order**:
    - Top‑level fields are straightforward.
    - For dotted fields, many drivers only support ordering **through 1:1** relations. Skip to‑many ordering (or document it).

---

### 5) Custom operators (IR path)

- If an op is not one of the core ops, consult `CustomOpRegistry`:
  ```ts
  const emitter = custom.get(field, def.type, opName);
  ```
- Call it to obtain an **IR** tree, then translate IR to your driver’s `where` with a `fromIR<Driver>` function.
- Support the placeholder `__FIELD__` in IR by rewriting it to the actual `node.field`.

---

### 6) Implement `resolve<Entity>` API

Follow the same overloads as our built‑ins:

```ts
// entity ctor + shape 'entity' → entities
// entity ctor + default 'plain' → projected objects
// entity name + ctor ... (dual signature)
// entity name only (string‑only smoke path) → uses Domain<Entity> ctor import
```

**Core flow inside your resolver**:

1. Normalize args (ctor, filter, custom, opts).
2. Read metadata (`getFilterableMetadata`, `getFilterableRelationsMeta`).
3. Validate filter with `validateFilter` (pass `selectable` + `limits`).
4. Build `where` (top‑level), relation‑scoped `where` (for nested selects), `select`, `orderBy`, pagination.
5. Execute query via the context/client.
6. Return **entity** rows or reuse driver projection for **plain** rows.

---

### 7) Wire up the template

Place an EJS template under `templates/<your-adapter>/resolver.ts.ejs.t`.  
For convince you can also add a `templates/<your-adapter>/query.ts.ejs.t` file to translate your operators to the DSL. 

**Template receives**:

- `fields`: array from metadata scan, with `{ name, type, operators, enumValues }`
- `selects`: string[] of allowed select fields (scalars + dotted)
- `relations`: relation info (either string[] or `{ name, kind }[]`)

**Export constants**:

- `Entity_SELECTABLE` as `const`
- `Entity_RELATIONS` as `const`
- `Entity_OPS` **merged** (entity field ops + relation‑safe ops).  
  This is important so **dotted relation fields keep their string ops** (e.g., `contains` for `address.city`).

> ⚠️ **Gotcha**: Do not “intersect” the per‑entity exported op set with field allow‑lists; always validate using `def.operators` per field. The exported set exists primarily for typing and convenience.

---

### 8) Testing

**Unit tests**

- Mapping for each op (`eq`, `neq`, `in`, `between`, string ops, nullability).
- Dotted fields across both 1:1 and 1:n relations.
- Custom ops → IR → driver where.
- Validation errors: `FILTER_FIELD_NOT_ALLOWED`, `FILTER_OPERATOR_UNSUPPORTED`.

**Integration tests**
- Seed your database/memory with the objects you want to filter
- Real queries against a test DB / memory  to verify the produced `where/select/orderBy` shapes and the projection behavior (`plain` vs `entity`).
- If entity is not supported, e.g. for in-memory filters, entity is same like plain.

---

### Best practices & pitfalls

- **Wide op union**: Keep `AnyOp` broad (includes `string` for custom ops). Type‑check correctness via:
    - `scalarComparator` (or equivalent) switch on `AnyOp`
    - Per‑field allow‑list from metadata (`def.operators as readonly string[]`).
- **Relations**:
    - Prisma: only to‑many relations support nested `where` inside `select`.
    - Many engines don’t support ordering through to‑many, skip silently or document a clear error.
- **Arrays**:
    - Convert readonly arrays to mutable when the driver requires (e.g., Prisma `in`).
- **Strings**:
    - Coerce to `String(value)` for `contains` / `starts_with` / `ends_with`.
- **Between**:
    - Emit as **two** comparisons (`gte` + `lte`).
- **Nullability**:
    - Map `is_null` → `field: null`, `is_not_null` → `field: { not: null }` (or equivalent in your driver).
- **Projection**:
    - Prisma: reuse driver projection (whatever `select` returns).
    - MikroORM: keep **flat** `fields: string[]` to avoid runtime `f.startsWith` errors; flatten and project manually for `plain`.
- **Quantifiers**:
    - If your driver supports `some/every/none`, read a default quantifier from relation metadata (we attach `defaultQuantifier`); fall back to `some`.

---

### Minimal “Hello Adapter” skeleton (pseudo)

```ts
// src/filtering/runtime/driver/mydriver.ts
export interface MyDriverCtx {
  client: { findMany(args: any): Promise<any[]> };
}
```

```ts
// templates/mydriver/UserResolver.ts (EJS flavor)
import type { FilterInput, FilterNode, ConditionNode, Primitive } from 'src/filtering/ast';
import {
  getFilterableMetadata, getFilterableRelationsMeta, type FilterableMap, type FieldType, type RelationMeta,
} from 'src/filtering/filterable';
import { CustomOpRegistry, type IR } from 'src/filtering/custom-ops';
import { validateFilter } from 'src/filtering/validate';
import { getSelectableFields } from 'src/filtering/expose';
import type { MyDriverCtx } from 'src/filtering/runtime/driver/mydriver';

// 1) constants
export const User_SELECTABLE = ["id","name","address.city"] as const;
export const User_RELATIONS = ["address"] as const;
export const User_OPS = [
  "eq","neq","in","contains","starts_with","ends_with",
  "gt","gte","lt","lte","between","is_null","is_not_null"
] as const;

// 2) AnyOp and comparators (map ops → your driver)
type AnyOp =
  | "eq" | "neq" | "in"
  | "gt" | "gte" | "lt" | "lte" | "between"
  | "contains" | "starts_with" | "ends_with"
  | "is_null" | "is_not_null"
  | string;

function toWhere(field: string, fieldType: FieldType, op: AnyOp, v: unknown) {
  switch (op) {
    case "eq":  return { [field]: { $eq: v } };
    case "neq": return { [field]: { $ne: v } };
    // ...
    case "is_null":     return { [field]: null };
    case "is_not_null": return { [field]: { $ne: null } };
  }
  return {}; // unknown/custom handled via IR path
}

// 3) buildWhere: recurse groups, validate with def.operators, map conditions
function buildWhere(meta: Readonly<FilterableMap>, node: FilterNode, custom?: CustomOpRegistry): Record<string, unknown> {
  // similar to our shipped adapters
}

// 4) resolve overloads + implementation
export async function resolveUser(ctx: MyDriverCtx, /* overloads... */) {
  // normalize args, read metadata, validate, build where/select/order, execute via ctx.client
}
```

Use our Prisma/MikroORM templates as full references for:
- Relation wrapping (`nestRelWhere`)
- Relation‑scoped `where` in nested selects
- IR translation (`fromIR<Driver>`)
- Overloads and TypeScript ergonomics

---

### FAQ

**Q: Do I need to export `Entity_OPS`?**  
Yes, export a broad, merged set (entity ops + relation‑safe ops). This avoids losing string ops on dotted relation fields. We still gate *per field* using `def.operators`.

**Q: How do I support a brand‑new operator?**  
Register it in `CustomOpRegistry` with an emitter that returns IR. Implement IR→driver translation in your adapter’s `fromIR<Driver>`.

**Q: Can I order by `posts.title` (to‑many)?**  
Typically no. We only support dotted ordering through **1:1**. For to‑many, either skip silently or throw a friendly error, document the behavior.

**Q: What is the development status and when can we expect a production version?**  
Currently it is a Alpha version, the maintainer is busy, so don't expect it tomorrow. A Star can help to push this project.

**Q: Is it production ready to use?**  
Read the start of the README.MD