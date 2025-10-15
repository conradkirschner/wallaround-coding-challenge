import * as React from 'react';
import { FilterBuilder } from 'filter-builder-react';
import {
  createFilterApi,
  createSchema,
  type Schema,
  type OperatorMap,
  type FilterNode,
  type OperatorDef,
} from 'filter-builder-core';
import { filterRows } from './evaluation';
import { InvalidSchemaOperationError } from './InvalidSchemaOperationError';

// ---- Presets & Demo data ----------------------------------------------------

// Common operator map we’ll use for both presets
const COMMON_OPS: OperatorMap = {
  string: ['eq', 'neq', 'contains', 'starts_with', 'ends_with', 'in', 'is_null', 'is_not_null'],
  number: ['eq', 'neq', 'gt', 'lt', 'between', 'in', 'is_null', 'is_not_null'],
  boolean: ['eq', 'neq', 'is_null', 'is_not_null'],
  date: ['eq', 'neq', 'before', 'after', 'between', 'is_null', 'is_not_null'],
};

// Users preset (your current example)
const usersFields: Schema['fields'] = [
  { key: 'id', label: 'ID', type: 'number' },
  { key: 'name', label: 'Name', type: 'string' },
  {
    key: 'role',
    label: 'Role',
    type: 'string',
    options: [
      { value: 'admin', label: 'Admin' },
      { value: 'editor', label: 'Editor' },
      { value: 'viewer', label: 'Viewer' },
    ],
  },
  { key: 'age', label: 'Age', type: 'number' },
  {
    key: 'country',
    label: 'Country',
    type: 'string',
    options: [
      { value: 'de', label: 'Germany' },
      { value: 'us', label: 'United States' },
      { value: 'gb', label: 'United Kingdom' },
      { value: 'fr', label: 'France' },
    ],
  },
  { key: 'isActive', label: 'Active', type: 'boolean' },
  { key: 'joined', label: 'Joined', type: 'date' },
];

const usersRows: Array<Record<string, unknown>> = [
  { id: 1, name: 'Alice', role: 'admin',  age: 31, country: 'de', isActive: true,  joined: '2021-01-05' },
  { id: 2, name: 'Bob',   role: 'editor', age: 26, country: 'us', isActive: false, joined: '2020-07-22' },
  { id: 3, name: 'Cara',  role: 'viewer', age: 42, country: 'gb', isActive: true,  joined: '2019-11-13' },
  { id: 4, name: 'Dieter',role: 'admin',  age: 29, country: 'de', isActive: true,  joined: '2023-03-18' },
  { id: 5, name: 'Eve',   role: 'editor', age: 35, country: 'fr', isActive: false, joined: '2022-09-09' },
];

const usersSchema = createSchema(usersFields, COMMON_OPS);
const usersDefaultTree: FilterNode = {
  and: [
    { field: 'age', operator: 'gt', value: 25 },
    { or: [
        { field: 'role', operator: 'eq', value: 'admin' },
        { field: 'isActive', operator: 'eq', value: true },
      ]},
  ],
};

// Products preset
const productsFields: Schema['fields'] = [
  { key: 'id', label: 'ID', type: 'number' },
  { key: 'name', label: 'Name', type: 'string' },
  {
    key: 'category',
    label: 'Category',
    type: 'string',
    options: [
      { value: 'furniture', label: 'Furniture' },
      { value: 'books', label: 'Books' },
      { value: 'electronics', label: 'Electronics' },
    ],
  },
  { key: 'price', label: 'Price', type: 'number' },
  { key: 'inStock', label: 'In stock', type: 'boolean' },
  { key: 'createdAt', label: 'Created', type: 'date' },
];

const productsRows: Array<Record<string, unknown>> = [
  { id: 101, name: 'Chair',   category: 'furniture', price: 49.99,  inStock: true,  createdAt: '2024-01-10' },
  { id: 102, name: 'Desk',    category: 'furniture', price: 179.00, inStock: false, createdAt: '2024-02-02' },
  { id: 103, name: 'Novel',   category: 'books',     price: 12.50,  inStock: true,  createdAt: '2023-09-18' },
  { id: 104, name: 'Laptop',  category: 'electronics', price: 899,  inStock: true,  createdAt: '2024-03-01' },
  { id: 105, name: 'Monitor', category: 'electronics', price: 229,  inStock: false, createdAt: '2023-12-11' },
];

const productsSchema = createSchema(productsFields, COMMON_OPS);
const productsDefaultTree: FilterNode = {
  and: [
    { field: 'price', operator: 'between', value: [50, 1000] },
    { field: 'inStock', operator: 'eq', value: true },
  ],
};

// ---- Small helpers ----------------------------------------------------------

function exampleValueFor(type: string): unknown {
  switch (type) {
    case 'string': return 'x';
    case 'number': return 1;
    case 'boolean': return true;
    case 'date': return '2020-01-01';
    default: return 'x';
  }
}

/** Validate a schema by probing one condition per field using the core validator. */
function collectSchemaIssuesWithCore(schema: Schema): string[] {
  const api = createFilterApi(schema);
  if (schema.operators.length === 0) {
    return ['No operators available in schema (operator map resolved to empty set).'];
  }
  const issues: string[] = [];
  for (const f of schema.fields) {
    const op: OperatorDef = schema.operators.find((o) => o.key === 'eq') ?? schema.operators[0];
    const probe: FilterNode = { field: f.key, operator: op.key, value: exampleValueFor(f.type) };
    const res = api.validate(probe);
    if (!res.valid) for (const msg of res.issues) issues.push(`[${f.key}] ${msg}`);
  }
  return issues;
}

/** Union of keys across rows → columns for the flexible result table. */
function unionKeys(rows: Array<Record<string, unknown>>): string[] {
  const keys = new Set<string>();
  for (const r of rows) for (const k of Object.keys(r)) keys.add(k);
  return Array.from(keys);
}

// ---- App --------------------------------------------------------------------

export const App: React.FC = () => {
  // Active schema + API
  const [schema, setSchema] = React.useState<Schema>(usersSchema);
  const api = React.useMemo(() => createFilterApi(schema), [schema]);

  // Canonical tree (what <FilterBuilder/> uses)
  const [tree, setTree] = React.useState<FilterNode>(usersDefaultTree);

  // Active dataset (user-editable)
  const [rows, setRows] = React.useState<Array<Record<string, unknown>>>(usersRows);

  // Derivations
  const decoded = api.decode(tree);
  const encoded = api.encode(decoded);
  const qp = api.toQueryParam(encoded);
  const validation = api.validate(decoded);

  // Evaluate with current schema + rows; catch explicit evaluation errors
  const evaluation = React.useMemo(() => {
    if (!validation.valid) {
      return { rows: [] as Array<Record<string, unknown>>, error: null as string | null };
    }
    try {
      const out = filterRows(schema, decoded, rows);
      return { rows: out, error: null as string | null };
    } catch (e) {
      if (e instanceof InvalidSchemaOperationError) {
        return { rows: [] as Array<Record<string, unknown>>, error: e.message };
      }
      return { rows: [] as Array<Record<string, unknown>>, error: 'Unexpected evaluation error.' };
    }
  }, [schema, decoded, validation.valid, rows]);

  // Columns: derive from current evaluation (fallback to current rows when empty)
  const columns = React.useMemo(
      () => unionKeys(evaluation.rows.length ? evaluation.rows : rows),
      [evaluation.rows, rows],
  );

  // --- Editors: Fields JSON & Operator Map JSON & Rows JSON ------------------

  const [fieldsDraft, setFieldsDraft] = React.useState<string>(() => JSON.stringify(schema.fields, null, 2));
  const [opsDraft, setOpsDraft] = React.useState<string>(() => JSON.stringify(schema.operatorMap, null, 2));
  const [rowsDraft, setRowsDraft] = React.useState<string>(() => JSON.stringify(rows, null, 2));

  const [fieldsError, setFieldsError] = React.useState<string | null>(null);
  const [opsError, setOpsError] = React.useState<string | null>(null);
  const [rowsError, setRowsError] = React.useState<string | null>(null);

  const applyFields = () => {
    try {
      const parsed = JSON.parse(fieldsDraft);
      if (!Array.isArray(parsed)) {
        setFieldsError('Fields JSON must be an array.');
        return;
      }
      let candidate: Schema;
      try {
        candidate = createSchema(parsed as Schema['fields'], schema.operatorMap as OperatorMap);
      } catch (e) {
        setFieldsError(e instanceof Error ? e.message : String(e));
        return;
      }
      const issues = collectSchemaIssuesWithCore(candidate);
      if (issues.length > 0) {
        setFieldsError(issues.join('\n'));
        return;
      }
      setFieldsError(null);
      setSchema(candidate);
      setFieldsDraft(JSON.stringify(candidate.fields, null, 2));
    } catch (e) {
      setFieldsError(e instanceof Error ? e.message : String(e));
    }
  };

  const applyOps = () => {
    try {
      const parsed = JSON.parse(opsDraft) as OperatorMap;
      let candidate: Schema;
      try {
        candidate = createSchema(schema.fields, parsed);
      } catch (e) {
        setOpsError(e instanceof Error ? e.message : String(e));
        return;
      }
      const issues = collectSchemaIssuesWithCore(candidate);
      if (issues.length > 0) {
        setOpsError(issues.join('\n'));
        return;
      }
      setOpsError(null);
      setSchema(candidate);
      setOpsDraft(JSON.stringify(candidate.operatorMap, null, 2));
    } catch (e) {
      setOpsError(e instanceof Error ? e.message : String(e));
    }
  };

  const applyRows = () => {
    try {
      const parsed = JSON.parse(rowsDraft);
      if (!Array.isArray(parsed)) {
        setRowsError('Rows JSON must be an array of objects.');
        return;
      }
      if (!parsed.every((x) => typeof x === 'object' && x !== null)) {
        setRowsError('Each item in Rows JSON must be an object.');
        return;
      }
      setRowsError(null);
      setRows(parsed as Array<Record<string, unknown>>);
      setRowsDraft(JSON.stringify(parsed, null, 2)); // normalize formatting
    } catch (e) {
      setRowsError(e instanceof Error ? e.message : String(e));
    }
  };

  // Keep editors in sync when schema/rows change externally
  React.useEffect(() => {
    setFieldsDraft(JSON.stringify(schema.fields, null, 2));
    setOpsDraft(JSON.stringify(schema.operatorMap, null, 2));
  }, [schema]);
  React.useEffect(() => {
    setRowsDraft(JSON.stringify(rows, null, 2));
  }, [rows]);

  // --- Canonical JSON (editable) with "dirty" guard --------------------------

  const [canonDraft, setCanonDraft] = React.useState<string>(() => JSON.stringify(decoded, null, 2));
  const [canonError, setCanonError] = React.useState<string | null>(null);
  const [canonDirty, setCanonDirty] = React.useState<boolean>(false);

  // Only sync from state → editor when not dirty.
  React.useEffect(() => {
    if (!canonDirty) {
      setCanonDraft(JSON.stringify(decoded, null, 2));
      setCanonError(null);
    }
  }, [decoded, canonDirty]);

  const onCanonChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setCanonDirty(true);
    setCanonDraft(e.target.value);
  };

  const applyCanon = () => {
    try {
      const parsed = JSON.parse(canonDraft) as unknown;
      const node = parsed as FilterNode;

      const res = api.validate(node);
      if (!res.valid) {
        setCanonError(res.issues.join('\n'));
        return;
      }

      const normalized = api.decode(node);
      setTree(normalized);
      setCanonDraft(JSON.stringify(normalized, null, 2));
      setCanonError(null);
      setCanonDirty(false);
    } catch (e) {
      setCanonError(e instanceof Error ? e.message : String(e));
    }
  };

  const resetCanon = () => {
    setCanonDraft(JSON.stringify(decoded, null, 2));
    setCanonError(null);
    setCanonDirty(false);
  };

  // --- Load preset helpers ---------------------------------------------------

  const loadUsersPreset = () => {
    const nextSchema = usersSchema;
    const nextRows = usersRows;
    const nextTree = usersDefaultTree;

    setSchema(nextSchema);
    setRows(nextRows);
    setTree(nextTree);

    // Sync editors to new sources
    setFieldsDraft(JSON.stringify(nextSchema.fields, null, 2));
    setOpsDraft(JSON.stringify(nextSchema.operatorMap, null, 2));
    setRowsDraft(JSON.stringify(nextRows, null, 2));
    setFieldsError(null);
    setOpsError(null);
    setRowsError(null);

    // Reset canonical editor (let useEffect repopulate; also clear dirty)
    setCanonDirty(false);
    setCanonError(null);
  };

  const loadProductsPreset = () => {
    const nextSchema = productsSchema;
    const nextRows = productsRows;
    const nextTree = productsDefaultTree;

    setSchema(nextSchema);
    setRows(nextRows);
    setTree(nextTree);

    setFieldsDraft(JSON.stringify(nextSchema.fields, null, 2));
    setOpsDraft(JSON.stringify(nextSchema.operatorMap, null, 2));
    setRowsDraft(JSON.stringify(nextRows, null, 2));
    setFieldsError(null);
    setOpsError(null);
    setRowsError(null);

    setCanonDirty(false);
    setCanonError(null);
  };

  // ---- UI -------------------------------------------------------------------

  return (
      <div className="mx-auto max-w-6xl p-4 space-y-6">
        <h1 className="text-2xl font-semibold">Filter Builder (Demo)</h1>

        {/* Schema Config: Fields + Operator Map + Rows */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Rows JSON (dataset) */}
          <div className="rounded-lg border bg-white p-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold">Rows JSON</h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 mr-1">Presets:</span>
                <button
                    type="button"
                    onClick={loadUsersPreset}
                    className="rounded-md border px-2 py-1 text-[11px] hover:bg-gray-50"
                    aria-label="Load users preset"
                    title="Load users preset (schema + rows + default filter)"
                >
                  Users
                </button>
                <button
                    type="button"
                    onClick={loadProductsPreset}
                    className="rounded-md border px-2 py-1 text-[11px] hover:bg-gray-50"
                    aria-label="Load products preset"
                    title="Load products preset (schema + rows + default filter)"
                >
                  Products
                </button>
                <button
                    type="button"
                    onClick={applyRows}
                    className="rounded-md border px-2 py-1 text-xs bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-500 ml-2"
                    aria-label="Apply rows JSON"
                >
                  Apply
                </button>
              </div>
            </div>
            <textarea
                className="w-full h-64 rounded-md border border-gray-300 px-2 py-1 text-xs font-mono"
                aria-label="Rows JSON editor"
                value={rowsDraft}
                onChange={(e) => setRowsDraft(e.target.value)}
                spellCheck={false}
            />
            {rowsError ? (
                <p className="mt-2 text-xs text-red-700 whitespace-pre-wrap">{rowsError}</p>
            ) : (
                <p className="mt-2 text-xs text-green-700">Rows OK</p>
            )}
          </div>
          {/* Fields JSON */}
          <div className="rounded-lg border bg-white p-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold">Fields JSON</h2>
              <button
                  type="button"
                  onClick={applyFields}
                  className="rounded-md border px-2 py-1 text-xs bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-500"
                  aria-label="Apply fields JSON"
              >
                Apply
              </button>
            </div>
            <textarea
                className="w-full h-64 rounded-md border border-gray-300 px-2 py-1 text-xs font-mono"
                aria-label="Fields JSON editor"
                value={fieldsDraft}
                onChange={(e) => setFieldsDraft(e.target.value)}
                spellCheck={false}
            />
            {fieldsError ? (
                <p className="mt-2 text-xs text-red-700 whitespace-pre-wrap">{fieldsError}</p>
            ) : (
                <p className="mt-2 text-xs text-green-700">Schema fields OK</p>
            )}
          </div>

          {/* Operator Map JSON */}
          <div className="rounded-lg border bg-white p-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold">Operator Map JSON</h2>
              <button
                  type="button"
                  onClick={applyOps}
                  className="rounded-md border px-2 py-1 text-xs bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-500"
                  aria-label="Apply operator map JSON"
              >
                Apply
              </button>
            </div>
            <textarea
                className="w-full h-64 rounded-md border border-gray-300 px-2 py-1 text-xs font-mono"
                aria-label="Operator Map JSON editor"
                value={opsDraft}
                onChange={(e) => setOpsDraft(e.target.value)}
                spellCheck={false}
            />
            {opsError ? (
                <p className="mt-2 text-xs text-red-700 whitespace-pre-wrap">{opsError}</p>
            ) : (
                <p className="mt-2 text-xs text-green-700">Operator map OK</p>
            )}
          </div>

        </section>

        {/* Filter Builder + Diagnostics */}
        <section className="space-y-3">
          <FilterBuilder
              schema={schema}
              value={decoded}
              onChange={setTree}
              className="bg-white rounded-lg border p-4"
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Canonical JSON (editable) */}
            <div className="rounded-lg border bg-white p-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold">Canonical JSON (editable)</h2>
                <div className="flex gap-2">
                  {canonDirty && (
                      <span className="text-xs text-amber-700 self-center">
                    Edited — press <strong>Apply</strong> to see changes
                  </span>
                  )}
                  <button
                      type="button"
                      onClick={resetCanon}
                      className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                      aria-label="Reset canonical JSON editor"
                  >
                    Reset
                  </button>
                  <button
                      type="button"
                      onClick={applyCanon}
                      className="rounded-md border px-2 py-1 text-xs bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-500"
                      aria-label="Apply canonical JSON"
                  >
                    Apply
                  </button>
                </div>
              </div>
              <textarea
                  className="w-full h-64 rounded-md border border-gray-300 px-2 py-1 text-xs font-mono"
                  aria-label="Canonical JSON editor"
                  value={canonDraft}
                  onChange={onCanonChange}
                  spellCheck={false}
              />
              {canonError ? (
                  <p className="mt-2 text-xs text-red-700 whitespace-pre-wrap">{canonError}</p>
              ) : (
                  <p className="mt-2 text-xs text-green-700">
                    {canonDirty ? 'Draft has un-applied edits' : 'Filter JSON OK'}
                  </p>
              )}
            </div>

            {/* Target JSON */}
            <div className="rounded-lg border bg-white p-3">
              <h2 className="text-sm font-semibold mb-2">Target JSON</h2>
              <pre className="text-xs overflow-auto">{JSON.stringify(encoded, null, 2)}</pre>
            </div>

            {/* Query param + validation */}
            <div className="rounded-lg border bg-white p-3">
              <h2 className="text-sm font-semibold mb-2">GET Query Param</h2>
              <code className="break-words text-xs">{qp}</code>
              <div className="mt-2 text-xs">
              <span className={validation.valid ? 'text-green-700' : 'text-red-700'}>
                {validation.valid ? 'Valid' : 'Invalid'} ({validation.issues.length} issues)
              </span>
                {!validation.valid && (
                    <ul className="list-disc ml-5 mt-1">
                      {validation.issues.map((i, idx) => <li key={idx}>{i}</li>)}
                    </ul>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Filtered results (flexible columns) */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold">Filtered Results</h2>
          <div className="overflow-x-auto rounded-lg border bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
              <tr>
                {columns.map((k) => (
                    <th key={k} className="px-3 py-2 text-left font-medium">{k}</th>
                ))}
              </tr>
              </thead>
              <tbody>
              {evaluation.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="border-t">
                    {columns.map((k) => (
                        <td key={k} className="px-3 py-1">{String(row[k] ?? '')}</td>
                    ))}
                  </tr>
              ))}
              {(!validation.valid || evaluation.error) && (
                  <tr className="border-t">
                    <td className="px-3 py-2 text-xs text-amber-700" colSpan={columns.length}>
                      {!validation.valid
                          ? 'Results hidden because current filter is invalid.'
                          : evaluation.error}
                    </td>
                  </tr>
              )}
              {validation.valid && !evaluation.error && evaluation.rows.length === 0 && (
                  <tr className="border-t">
                    <td className="px-3 py-2 text-xs text-gray-500" colSpan={columns.length}>
                      No rows match the current filter.
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
  );
};
