# filter-me ,  Architecture & Design Decisions

This document captures the architectural choices and trade‑offs behind **filter-me**. It’s aimed at developers extending the library (new adapters, operators, or templates) and reviewers assessing implications.

---

## 1) Goals & Non‑Goals

**Goals**
- Provide a **single, metadata-driven filtering model** that compiles to different data layers (e.g., Prisma, MikroORM) without application code rewriting.
- Offer a **safe, typed** API surface: only operators explicitly allowed by `@Filterable` are permitted at runtime.
- Support **strong projection controls** (select/sort) and **relation-aware filters** (dotted fields).
- Enable **custom operators** in a consistent way via a small **IR (Intermediate Representation)**.
- Keep generated code **idiomatic** for each adapter to leverage native capabilities (e.g., Prisma `where`, MikroORM `populateWhere`).

**Non‑Goals**
- Being a generic ORM query builder. We intentionally **compile** our domain filter AST to adapter‑native queries rather than reimplement an ORM.
- Full SQL expressiveness. We constrain to safe, predictable operators surfaced by metadata.

---

## 2) Architecture Overview

```
Decorators (@Filterable, @Selectable, @Sortable)
              │
              ▼
        Metadata (per Entity)
              │
              ├── Validation (limits, allowed ops, security)
              │
 Filter AST (FilterInput) ──► Custom Operator Registry (optional)
              │                      │
              │                      ▼
              └────────────► Adapter IR (small, typed)
                                     │
                        ┌────────────┴────────────┐
                        ▼                         ▼
                 Prisma Resolver           MikroORM Resolver
              (typed where/select)       (typed where/populateWhere)
```

**Why IR?**  
The IR is a tiny, adapter‑agnostic shape (`and`, `or`, `{field, op, value}` or specialized forms like `between`) that makes **custom operators** portable and keeps adapters small. Adapters map IR to their native query DSLs.

---

## 3) Core Concepts

### 3.1 Filter AST
- User‑facing input parsed as a tree of **groups** (`and`/`or`) and **conditions** (`{ field, op, value }`).
- Fields may be **dotted** (e.g., `address.city`) to target relation properties.

### 3.2 IR (Intermediate Representation)
- Minimal, stable surface so **custom operators** emit **IR** instead of adapter‑specific shapes.
- Adapters translate IR to native queries (Prisma `where`, MikroORM `FilterQuery`).

### 3.3 Adapters
- Each adapter implements:
    - Comparator mapping (operators → native keys).
    - Relation handling (nesting, quantifiers).
    - Selection / ordering rules and limitations.
- We ship **Prisma** and **MikroORM** adapters with **codegen templates**.

### 3.4 Code Generation (Templates)
- We generate **entity‑scoped** filter resolvers to keep types precise and performance predictable.
- EJS templates emit TypeScript tailored to the entity’s metadata (operators, relations, selectables).

### 3.5 Validation & Limits
- `validateFilter` uses decorator metadata to **allowlist** fields/operators and enforce optional limits (depth, breadth).
- Security option: **requireSelectableForFilter** (only filter on fields that are selectable).

---

## 4) Key Design Decisions

### 4.1 Codegen over Dynamic Builders
**Decision:** Prefer code generation per entity.  
**Why:** Static types (no “stringly‑typed” utilities), smaller runtime surface, better tree‑shaking, smaller → performance benefit, easier debugging.  
**Trade‑off:** Need a generation step; template quality matters.

### 4.2 Adapter Boundary via IR
**Decision:** Custom operators produce IR; adapters translate IR → native query.  
**Why:** Keeps custom logic adapter‑agnostic, reduces duplication, and isolates ORM specifics.  
**Trade‑off:** IR must remain small and versioned carefully.

### 4.3 Operator Allowlist (Including Dotted Relations)
**Decision:** Allowed operators for a dotted field (e.g., `address.city`) are the **union** of:
- The root relation operator set (if any), and
- The target field operator set from its entity metadata.

**Why:** If `city` allows `contains`, then `address.city` must also allow `contains`.  
**Implementation:** The resolver computes a per‑field allowed set using the metadata lookup (`getFilterableMetadata`) and merges relation target operators for dotted paths.

### 4.4 Prisma Typing: `AnyOp` / `MappableOp` Strategy
**Decision:** Use a wide `AnyOp` union for the comparator switch, then a strict `MappableOp` for mapping operations that correspond 1:1 to Prisma comparator keys.  
**Why:** Avoids TypeScript “unreachable case” and “not comparable to type” errors while keeping mapping **type‑safe**.  
**Extra:** `toMutableArray` wraps `readonly` arrays so they’re compatible with Prisma’s `Enumerable`.

### 4.5 Nullability & `between`
- `is_null` / `is_not_null` are only enabled for **nullable** fields. We **fail fast** at codegen time if a non‑nullable field requests these operators.
- `between` translates to **`gte` AND `lte`** in both adapters:
    - Prisma: `{ AND: [ { f: { gte: a } }, { f: { lte: b } } ] }`
    - MikroORM: `$gte` + `$lte` composed with `$and`.

### 4.6 Relation Handling
- **Prisma**
    - Dotted fields are nested via `nestRelWhere`.
    - To‑many filtering in nested `select` uses relation‑scoped `where` (only for `many` relations).
    - Dotted **orderBy** is supported for 1:1; skipped for to‑many.
- **MikroORM**
    - Dotted fields become nested objects via `nest`.
    - `populateWhere` is built from the same filter AST per relation root.

### 4.7 Projection Shapes
- **`shape: 'entity'`** returns native ORM payloads (Prisma rows, MikroORM entities).
- **`shape: 'plain'`** returns only selected fields; on Prisma we reuse the ORM projection; on MikroORM we **project** the in‑memory rows into a shallow object graph.

### 4.8 Error Model
- Consistent error codes:
    - `FILTER_FIELD_NOT_ALLOWED`
    - `FILTER_OPERATOR_UNSUPPORTED`
- Friendly `meta` payloads include `field`, `op`, and `allowed` sets.

### 4.9 Performance Considerations
- Minimal object churn at runtime; heavy lifting is performed **once** at codegen.
- Use of `Set` / `Array.from` for deduplication and Prisma array compatibility.
- For MikroORM `plain` projection, we only traverse selected paths.

### 4.10 Compatibility & Versioning
- Templates are **semantically versioned** with the library.
- IR additions are **backward compatible** when possible; breaking changes are called out in release notes.

---

## 5) Alternatives Considered

1. **Dynamic Runtime Builder Only**
    - **Pros:** No codegen step; fewer files.
    - **Cons:** We lose strong typing, risk broader runtime surface, higher cognitive load for devs, and performance costs.
    - **Decision:** Rejected in favor of codegen.

2. **Direct Adapter APIs from Custom Operators**
    - **Pros:** Slightly faster, fewer translations.
    - **Cons:** Locks custom logic to a single adapter, duplicates logic across adapters.
    - **Decision:** Rejected; IR keeps us portable.

3. **Single Monolithic Operator Set**
    - **Pros:** Simple mental model.
    - **Cons:** Some fields need different operators (e.g., strings vs. numbers, nullable vs. non‑nullable).
    - **Decision:** Per‑field operator sets derived from metadata.

---

## 6) Testing Strategy (Planned)

- **Template smoke tests**: generate resolvers for sample entities and run type checks.
- **Golden tests**: compare generated code against expected snapshots.
- **Runtime tests**:
    - Validation errors for unsupported fields/operators.
    - Dotted fields: nested where/select.
    - `between`, `is_null`, `is_not_null` behavior.
    - Prisma `in` with `readonly` arrays.
    - MikroORM `populateWhere` and flattened fields.
- **Adapter parity tests**: ensure Prisma and MikroORM produce equivalent logical results for the same filter AST.

---

## 7) Known Limitations

- **Complex quantifiers** (e.g., `none`, `every`) are adapter‑specific; current templates default to reasonable behavior (Prisma: `some`; MikroORM: standard nested predicate).
- **Deep selects** in MikroORM `plain` projection are shallow by design, intended for API response shaping, not full entity graphs.
- **Ordering across to‑many** is adapter‑constrained: Prisma disallows some shapes; we skip unsafe forms in generated code.

---

## 8) Extensibility Guidelines

- **New adapter**: implement:
    - Comparator mapping (switch with `AnyOp`/`MappableOp`-style typing if applicable).
    - Dotted field nesting & relation quantifiers.
    - Selection / ordering semantics.
    - Relation-scoped filtering (`populateWhere`/nested `where`).
    - Overload signatures for *plain*/*entity* payloads.
- **New operator**:
    1. Extend metadata to allowlist it per field.
    2. Add IR emission (custom operator registry or core mapper).
    3. Teach each adapter how to translate the new IR to native query DSL.
    4. Update templates and tests.

---

## 9) Migration & Upgrade Path

- Template changes follow semver.
- When upgrading:
    - Re‑generate resolvers (codegen step).
    - Scan release notes for behavioral changes (especially relation quantifiers and new comparator keys).
    - Run type checks; most issues will be caught at compile time.

---

## 10) Glossary

- **AST (Filter AST):** Input tree of groups/conditions, dotted fields allowed.
- **IR:** Minimal intermediate format emitted by custom operators and consumed by adapters.
- **Adapter:** A bridge that converts IR/AST into the target ORM’s query DSL.
- **Allowlist:** Per‑field operator set from `@Filterable` metadata.
- **Relation root:** The first token in a dotted path (e.g., `address` in `address.city`).
- **Quantifier:** How adapters evaluate to‑many relations (e.g., Prisma’s `some`).

---

## 11) Appendix: Small but Important Choices

- **`toMutableArray`** for Prisma `in` ensures compatibility with `Enumerable<T>`.
- **Wide `AnyOp`** union keeps the comparator `switch` exhaustive; strict mapping via `MappableOp` prevents assigning non‑mappable ops to Prisma comparator keys.
- **Merging relation operator sets** fixes “operator unsupported” for dotted scalar fields (`address.city` inherits string ops like `contains`).
- **Fail‑fast nullability check** at codegen prevents runtime surprises for `is_null`/`is_not_null`.
- **We did not separate the library yet for better testing**
---

If you have questions or want to propose a new operator/adapter, open a discussion with a short problem statement and the target adapter(s).  
Happy filtering!