# Filter Builder — Monorepo

- **`packages/filter-builder-core`** – Schema, Validierung und Domänenlogik 
- **`packages/filter-builder-react`** – React‑UI-Filter Builder zum Erstellen von Filterbäumen, aufbauend auf dem Core ( + Beispiel Anwendung)

---

## Installation & Nutzung

### Voraussetzungen
- Node 20+
- Yarn Classic Workspaces (pnpm/npm Workspaces funktionieren ebenfalls)

### Setup (Monorepo)
Am Repo‑Root:
```bash
yarn install
```

### Build
```bash
# Beide Pakete bauen
yarn workspace filter-builder-core build
yarn workspace filter-builder-react build
```

### Beispiel‑App (Vite) für die Entwicklung
Das React‑Paket enthält eine Vite‑Demo:
```bash
yarn workspace filter-builder-react dev
# startet http://localhost:5173
```

### Einsatz im eigenen Projekt

#### Mini-Preview der Filter Komponente  
- Im ./example/dev befindet sich eine vollständige Implementierung, diese dient zur Veranschaulichung & Testing der Filter Komponente 
```bash
# sobald publiziert:
yarn add filter-builder-core filter-builder-react
```

```tsx
// App.tsx
import * as React from 'react';
import { FilterBuilder } from 'filter-builder-react';
import type { Schema, FilterNode } from 'filter-builder-core';

const schema: Schema = {
  fields: [
    { key: 'name',     label: 'Name',    type: 'string' },
    { key: 'price',    label: 'Preis',   type: 'number' },
    { key: 'isActive', label: 'Aktiv?',  type: 'boolean' },
    { key: 'released', label: 'Release', type: 'date' },
  ],
  operators: [
    { key: 'eq',       label: 'ist',       supportedTypes: ['string','number','boolean','date'], valueArity: 'one' },
    { key: 'neq',      label: 'ist nicht', supportedTypes: ['string','number','boolean','date'], valueArity: 'one' },
    { key: 'contains', label: 'enthält',   supportedTypes: ['string'],                            valueArity: 'one' },
    { key: 'gt',       label: '>',         supportedTypes: ['number','date'],                     valueArity: 'one' },
  ],
};

export default function App() {
  const [filter, setFilter] = React.useState<FilterNode>({
    field: 'name',
    operator: 'contains',
    value: 'foo',
  });

  return <FilterBuilder schema={schema} value={filter} onChange={setFilter} />;
}
```

#### Entwicklung innerhalb des Monorepos
Bei interner Entwicklung werden Pfade über `tsconfig`/Vite‑Aliasse auf Quellcode aufgelöst. Falls Sie die Beispiel‑App erweitern oder ein Nachbarpaket bauen, stellen Sie sicher, dass `filter-builder-core` und `filter-builder-react` korrekt gemappt sind:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "filter-builder-core": ["../filter-builder-core/src/index.ts"],
      "filter-builder-react": ["./src/index.ts"]
    }
  }
}
```

> Das Projekt setzt konsequent auf ESM und strenge TypeScript‑Einstellungen. Halten Sie Ihr Tooling entsprechend konfiguriert (z.B. `"type": "module"` oder bundler‑gestützte Auflösung).

---

## Konfigurations‑API

### Kern‑Typen (`filter-builder-core`)

```ts
export type ValueType = 'string' | 'number' | 'boolean' | 'date';

export interface Field {
  key: string;
  label?: string;
  type: ValueType;
}

export interface OperatorDef {
  key: string;
  label: string;
  supportedTypes: readonly ValueType[];
  /** Nimmt der Operator keinen, einen oder mehrere Werte an? */
  valueArity: 'none' | 'one' | 'many';
}

export interface Schema {
  fields: readonly Field[];
  operators: readonly OperatorDef[];
}

/** Blattknoten (Bedingung) */
export interface ConditionNode {
  field: string;    // Field.key
  operator: string; // OperatorDef.key
  value?: unknown;  // abhängig von operator.valueArity
}

/** Gruppenknoten */
export type AndGroupNode = { and: readonly FilterNode[] };
export type OrGroupNode  = { or: readonly FilterNode[] };
export type FilterNode   = ConditionNode | AndGroupNode | OrGroupNode;

/** Laufzeit‑API */
/**
 * Minimal, explicit programmatic API exposed by the core package.
 *
 * Design tenets:
 * - Pure functions (no I/O)
 * - Clear separation of concerns: this layer handles shape, operators, and validation;
 *   your app decides how/when to transport the data (GET/POST).
 */
export interface FilterApi {
  /** The concrete schema this API instance is bound to. */
  schema: Schema;

  /**
   * Convert **target** JSON into canonical form (normalize operator tokens/shape).
   */
  decode: (input: FilterNode) => FilterNode;

  /**
   * Convert canonical form back to **target** JSON (e.g., `eq` → `"="`), applying
   * the “groups only if ≥ 2 children” rule.
   */
  encode: (input: FilterNode) => FilterNode;

  /**
   * Schema-aware validation of fields, operators, and operator/value arity.
   */
  validate: (input: FilterNode) => ValidationResult;

  /**
   * Build a single URL-safe querystring pair with the serialized target filter.
   */
  toQueryParam: (input: FilterNode, param?: string) => string;

  /**
   * Append the serialized target filter to a base URL (GET mode).
   */
  withFilterInUrl: (baseUrl: string, input: FilterNode, param?: string) => string;
}

```

**Hinweise**
- `supportedTypes` steuert, welche Operatoren zu einem Feld angeboten werden.
- `valueArity` steuert die Value‑Editoren in der UI (inkl. Normalisierung).

### React‑Komponente (`filter-builder-react`)

```ts
export interface FilterBuilderProps {
  schema: Schema;
  value: FilterNode;                  
  onChange(next: FilterNode): void;  

  /**
   * Optional: Value‑Editoren je Typ/Operator anpassen.
   * Teil‑Registry: nicht definierte Einträge fallen auf Defaults zurück.
   */
  inputs?: Partial<ValueInputRegistry>;

  /** Optional: UI schreibgeschützt rendern. */
  readOnly?: boolean;

  /** Optional: Test‑IDs für E2E/CT. */
  testIds?: Partial<{
    root: string;
    condition: string;
    group: string;
    fieldSelect: string;
    operatorSelect: string;
    valueInput: string;
    addCondition: string;
    addGroup: string;
    removeNode: string;
  }>;
}
```

Beispiel für eine **angepasste String‑Eingabe**:
```tsx
import { FilterBuilder, type ValueInputRegistry } from 'filter-builder-react';

const inputs: Partial<ValueInputRegistry> = {
  string: ({ value, onChange }) => (
    <select value={String(value ?? '')} onChange={(e) => onChange(e.target.value)}>
      <option value="">(leer)</option>
      <option value="foo">foo</option>
      <option value="bar">bar</option>
    </select>
  ),
};

<FilterBuilder schema={schema} value={filter} onChange={setFilter} inputs={inputs} />;
```

### Test‑Utilities

Konventionen für Cypress:
- Selektoren per `data-test-id="..."` im DOM
- Custom Command `cy.getByTestId('...')` (wird über unsere Support‑Dateien registriert)

**CT‑Support**: `cypress/support/component.ts`  
**E2E‑Support**: `cypress/support/e2e.ts` (wichtig nicht von `./commands` importieren, bundler issue)

---

## Architekturentscheidungen

### 1) Schema‑First, framework‑agnostischer Core
Trennung von **Modell** (Core) und **View** (React). Der Core
- stellt `Schema`/`Field`/`OperatorDef`/`FilterNode` bereit,
- validiert via `createFilterApi(schema).validate(node)`,
- kann in anderen Projekten ohne Query Editor eingesetzt werden
- 100% Test Coverage + stryker (für mutation test)

### 2) Explizite Value‑Arity
Operatoren deklarieren `valueArity: 'none' | 'one' | 'many'`. Die UI normalisiert Werte entsprechend und verhindert unlogische Editorzustände bzw. zeigt dem Nutzer Fehlermeldungen an.

**Warum:** Weniger implizite Annahmen, einfachere Editor‑Implementierung.

### 3) Kompatibilität über `supportedTypes`
Operatoren geben selbst an, welche Feldtypen sie unterstützen. Die UI filtert Operatoren je nach Feld.

**Warum:** deterministisches Verhalten, einfache Schema‑Audits.

### 4) Kontrollierte React‑Komponente
- `<FilterBuilder />` ist controlled.
- Es war nicht klar definiert welchen Umfang die FilterBuilder Lib haben soll, dementsprechend schlank gehalten

**Warum:** vorhersehbarer State‑Fluss, leichte Persistenz, robust bei Hydration und Undo/Redo.

### 5) Hilfsfunktionen für Gruppen/Bedingungen
- `firstCondition(schema)` ermittelt die erste gültige Bedingung (Feld + kompatibler Operator) oder wirft einen fachlichen Fehler.
- `makeGroup(kind, children)` u.a. Helfer kapseln sichere Baum‑Operationen.

**Warum:** reduziert Fehleranfälligkeit und hält die UI‑Komponenten schlank.

### 6) Teststrategie: Cypress CT + E2E + Vitest
- Für `filter-builder-core` wurde vitest eingesetzt, da hier keine Browser Test absolviert werden müssen => schlanker.  
  - Zusätzlich stryker zum testen der Test (Mutation Test)
- Für `filter-builder-react` wurde Cypress eingesetzt, da wir neben Component Testing auch Browsertest durchführen.


### 7) ESM‑first, strenges TS, Workspace‑Pfade
- ESM als Standard, strikte TS‑Flags.
- Lokale Entwicklung via `paths`‑Mapping; veröffentlichte Builds nutzen Bare‑Imports.

**Warum:** Moderne Bundler bevorzugen ESM; striktes TS entdeckt Annahmefehler früh; Workspaces vereinfachen interne Nutzung.

### 8) Stabile DOM‑Hooks für Tests
`data-test-id` + custom Cypress Befehl (getByTestId())

**Warum:** Stabilität bei Refactorings; weniger fragile Tests als bei Klassen/rollenbasierten Selektoren für diese UI.  
**Hinweis** Wir haben aktuell eine geringe Coverage im `filter-builder-core` dies liegt daran,
dass wir die Spezifikation übersprungen haben und nur ein mit ChatGPT erstellten Auftrag erhalten haben.
Nach erfolgreicher Präsentation wird dies nachgearbeitet.

``` Der Aufwand zur 100% Code Coverage liegt bei 1.5h ```### 

### 9) Für CSS wurde Tailwind genutzt  
- Bevorzugt vom Dev Team, Theme über css properties möglich

### 9) Für CSS wurde Tailwind genutzt
- Bevorzugt vom Dev Team, Theme über css properties möglich

### 10) Als Paketmanager wurde yarn benutzt
- Trotzdem pnpm bevorzugt ist, wurde yarn genutzt - da eine höhere Kompatibilität mit anderen Systemen mitbringt

### 10) Workflow Pipeline & Infrastruktur
- Es ist unklar aktuell auf welchem System die Anwendung laufen wird, daher keine Infrastruktur hinzugefügt.  
- Lokale Entwicklung daher auch ohne Docker DevContainer
---

## Beitrag & Pflege
`aktuell sind keine commit hooks implementiert, dies wird über husky nachgereicht, sobald Weiterentwickelt wird`
- Prettier: `prettier --check`
- Lint: `yarn lint`
- Type‑Check: `yarn tsc -b`
- Tests & Coverage (Core‑Paket):  
  `yarn workspace filter-builder-core test:coverag
  `yarn workspace filter-builder-core mutate
- Tests & Coverage (React‑Paket):  
  `yarn workspace filter-builder-react test:coverage`

Bitte kleine, fokussierte PRs mit CT‑Abdeckung. Bei UI‑Änderungen die Demo für E2E anpassen.

---

## Lizenz

Derzeit intern (ausstehend). Für eine öffentliche Nutzung bitte vorher Rücksprache halten.
