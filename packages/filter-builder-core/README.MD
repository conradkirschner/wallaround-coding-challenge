# filter-builder-core

> A schema-driven, dataset-agnostic filter engine for composing and serializing nested **AND / OR** queries.  
> Strict TypeScript, tiny API, zero I/O, and **100% test coverage**.

<p align="left">
  <a href="https://img.shields.io/badge/types-TypeScript-3178C6?logo=typescript&logoColor=white"><img alt="TypeScript" src="https://img.shields.io/badge/types-TypeScript-3178C6?logo=typescript&logoColor=white" /></a>
  <a href="https://img.shields.io/badge/esm-only-43B02A"><img alt="ESM Only" src="https://img.shields.io/badge/esm-only-43B02A" /></a>
  <a href="https://img.shields.io/badge/tests-100%25%20coverage-20C997"><img alt="Coverage" src="https://img.shields.io/badge/tests-100%25%20coverage-20C997" /></a>
</p>

---

## ✨ Why this library?

- **Schema-driven** - bring your own fields and per-type operators; no dataset logic baked in.
- **Arbitrary nesting** - compose unlimited `and` / `or` groups with normalized, predictable shape.
- **Strict typing** - no `any`. Exhaustive guards and narrow unions in strict mode.
- **Pure core** - no global state, no I/O, no `fetch`; trivial to test and embed.
- **Transport helpers** - emit GET (single query param) or POST (JSON body) payloads.
- **Production DX** - ESLint (flat config), Prettier, Vitest with enforced 100% coverage.

If you need UI, pair this with a React wrapper. This package focuses on the **engine** (encode/decode/validate/transport), not rendering.

---

## 🎯 Target JSON format

```json
{
  "and": [
    { "field": "age", "operator": "gt", "value": 30 },
    {
      "or": [
        { "field": "role", "operator": "eq", "value": "admin" },
        { "field": "isActive", "operator": "=", "value": true }
      ]
    }
  ]
}
```

> **Grouping rule:** arrays with **2+** items are groups. Single-item groups collapse to the item.

---

## 📦 Install

```bash
npm install filter-builder-core
# or: pnpm add filter-builder-core zod
# or: yarn add filter-builder-core zod
```

> **Runtime:** ESM only, Node ≥ 20

---

## 🚀 Quick start

```ts
import { createSchema, createFilterApi } from 'filter-builder-core';

// 1) Describe your dataset
const schema = createSchema(
  [
    { key: 'age', label: 'Age', type: 'number' },
    { key: 'role', label: 'Role', type: 'string', options: [
      { value: 'admin', label: 'Admin' }, { value: 'user', label: 'User' }
    ]},
    { key: 'isActive', label: 'Active', type: 'boolean' },
    { key: 'createdAt', label: 'Created', type: 'date' }
  ],
  // optional per-type operators (merges with defaults)
  {
    string: ['eq','neq','contains','starts_with','ends_with','in','is_null','is_not_null'],
    number: ['eq','neq','gt','lt','between','in'],
    boolean: ['eq','neq'],
    date: ['eq','neq','before','after','between']
  }
);

// 2) Create API
const api = createFilterApi(schema);

// 3) Decode (wire → canonical), validate, encode (canonical → wire)
const incoming = {
  and: [
    { field: 'age', operator: 'gt', value: 30 },
    { or: [
      { field: 'role', operator: 'eq', value: 'admin' },
      { field: 'isActive', operator: '=', value: true }
    ]}
  ]
};

const canonical = api.decode(incoming);
const validation = api.validate(canonical);
if (!validation.valid) throw new Error(validation.issues.join('\n'));

const target = api.encode(canonical);                // emits '=', '!=' for eq/neq

// 4) Transport helpers
const query = api.toQueryParam(target);              // "filter=%7B%22and%22%3A..."
const url = api.withFilterInUrl('/search', target);  // "/search?filter=..."
```

---

## 🧠 Operators & validation

- **Arity rules (enforced):**
  - `none` → no value  
  - `one` → scalar  
  - `two` → array length **2**  
  - `many` → **non-empty** array
- **Type support:** operator must include the field’s `ValueType`.
- **Group shape:** exactly one of `and`/`or` per group; 1-child groups collapse.

Symbolic aliases like `"="`, `"!="`, `"is null"` are normalized internally.

---

## 🔬 API reference

```ts
// Build-time
createSchema(fields, operatorMap?) => Schema
findField(schema, key) => Field | undefined
findOperator(schema, key) => OperatorDef | undefined

// Runtime
createFilterApi(schema) => {
  schema: Schema
  decode(input: FilterNode): FilterNode          // target → canonical
  encode(input: FilterNode): FilterNode          // canonical → target
  validate(input: FilterNode): ValidationResult  // schema-aware checks
  toQueryParam(input: FilterNode, param='filter'): string
  withFilterInUrl(baseUrl: string, input: FilterNode, param='filter'): string
}
```

---

## ⚙️ Tooling

- **Typecheck:** `npm run typecheck`
- **Tests (100%):** `npm run test` → text, lcov, HTML in `coverage/`
- **Build:** `npm run build` → `dist/` (ESM, declarations)
- **Lint/format:** `npm run lint` / `npm run format`
- **Release:** `npm run release` (lint → format:check → test → build → shrinkwrap → version → publish)

---

## 🤝 Contributing

We welcome contributions! Please:

1. **Fork & branch**: `feat/<scope>-<desc>` or `fix/<scope>-<ticket>`.
2. **Type safety**: no `any`. Strong unions + guards only.
3. **Tests**: keep **100% coverage** (Vitest thresholds enforce this).
4. **Lint/format**: `npm run lint && npm run format:check`.
5. **Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:` …).
6. **PR checklist**:
   - [ ] Public API documented here if changed  
   - [ ] New operator/validation covered by unit tests  
   - [ ] No breaking change without a major bump + migration notes

### Local dev

```bash
npm i
npm run typecheck
npm run test
npm run build
```

---

## 💼 About wallround.de

This library was originally built for **wallround.de** to power schema-driven filtering in energy-efficiency workflows.  
If you’re planning **energy-efficient building renovations** in Germany, check out **WALLROUND** - a platform that helps plan and streamline renovation projects: **https://wallround.de**.

---

## 📝 License

MIT © 2025 wallround.de, Packages that are used have their own License - respect them when using this.
