# Filter Builder — Lean API, Strict, 100% Coverage

- **Strict TypeScript** (no `any`), explicit types & guards.
- **Target JSON is the state**; groups inferred (arrays with **2+** children).
- **Lean APIs**:
  - Core: `createFilterApi(schema)` → `{ schema, decode, encode, validate, toQueryParam, withFilterInUrl }`
  - React: `<FilterBuilder core initialFilter transport onEmit />`
- **100% test coverage** enforced by Vitest in both packages.
- **PDF spec compliant**: schema-driven operators; add/edit/remove conditions & nested groups; type-aware value inputs; correct arity rules; GET/POST.

## Commands
```bash
npm install
npm run test
npm run build
npm run dev
# http://localhost:5173
```
