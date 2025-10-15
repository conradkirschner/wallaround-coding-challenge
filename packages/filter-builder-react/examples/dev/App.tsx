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
import { Card } from './components/ui/Card';
import { JsonEditorCard } from './components/ui/JsonEditorCard';
import { ResultsTable } from './components/ui/ResultsTable';
import { RequestTester } from './components/ui/RequestTester';
import type { HttpMethod } from './components/ui/MethodToggle';

// ---------- Presets & common operator map ------------------------------------

const COMMON_OPS: OperatorMap = {
  string: ['eq', 'neq', 'contains', 'starts_with', 'ends_with', 'in', 'is_null', 'is_not_null'],
  number: ['eq', 'neq', 'gt', 'lt', 'between', 'in', 'is_null', 'is_not_null'],
  boolean: ['eq', 'neq', 'is_null', 'is_not_null'],
  date: ['eq', 'neq', 'before', 'after', 'between', 'is_null', 'is_not_null'],
};

const usersFields: Schema['fields'] = [
  { key: 'id', label: 'ID', type: 'number' },
  { key: 'name', label: 'Name', type: 'string' },
  { key: 'role', label: 'Role', type: 'string', options: [
      { value: 'admin', label: 'Admin' },
      { value: 'editor', label: 'Editor' },
      { value: 'viewer', label: 'Viewer' },
    ]},
  { key: 'age', label: 'Age', type: 'number' },
  { key: 'country', label: 'Country', type: 'string', options: [
      { value: 'de', label: 'Germany' },
      { value: 'us', label: 'United States' },
      { value: 'gb', label: 'United Kingdom' },
      { value: 'fr', label: 'France' },
    ]},
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

const productsFields: Schema['fields'] = [
  { key: 'id', label: 'ID', type: 'number' },
  { key: 'name', label: 'Name', type: 'string' },
  { key: 'category', label: 'Category', type: 'string', options: [
      { value: 'furniture', label: 'Furniture' },
      { value: 'books', label: 'Books' },
      { value: 'electronics', label: 'Electronics' },
    ]},
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

// ---------- Smart helpers (validation, columns) ------------------------------

function exampleValueFor(type: string): unknown {
  switch (type) {
    case 'string': return 'x';
    case 'number': return 1;
    case 'boolean': return true;
    case 'date': return '2020-01-01';
    default: return 'x';
  }
}

function collectSchemaIssuesWithCore(schema: Schema): string[] {
  const api = createFilterApi(schema);
  if (schema.operators.length === 0) return ['No operators available in schema (operator map resolved to empty set).'];
  const issues: string[] = [];
  for (const f of schema.fields) {
    const op: OperatorDef = schema.operators.find((o) => o.key === 'eq') ?? schema.operators[0];
    const probe: FilterNode = { field: f.key, operator: op.key, value: exampleValueFor(f.type) };
    const res = api.validate(probe);
    if (!res.valid) for (const msg of res.issues) issues.push(`[${f.key}] ${msg}`);
  }
  return issues;
}

function unionKeys(rows: Array<Record<string, unknown>>): string[] {
  const keys = new Set<string>();
  for (const r of rows) for (const k of Object.keys(r)) keys.add(k);
  return Array.from(keys);
}

// ---------- App (smart) ------------------------------------------------------

export const App: React.FC = () => {
  // Active schema + API
  const [schema, setSchema] = React.useState<Schema>(usersSchema);
  const api = React.useMemo(() => createFilterApi(schema), [schema]);

  // Canonical filter tree
  const [tree, setTree] = React.useState<FilterNode>(usersDefaultTree);

  // Active dataset
  const [rows, setRows] = React.useState<Array<Record<string, unknown>>>(usersRows);

  // Derived
  const decoded = api.decode(tree);
  const encoded = api.encode(decoded);
  const qp = api.toQueryParam(encoded);
  const validation = api.validate(decoded);

  // Evaluation
  const evaluation = React.useMemo(() => {
    if (!validation.valid) return { rows: [] as Array<Record<string, unknown>>, error: null as string | null };
    try {
      return { rows: filterRows(schema, decoded, rows), error: null as string | null };
    } catch (e) {
      if (e instanceof InvalidSchemaOperationError) return { rows: [], error: e.message };
      return { rows: [], error: 'Unexpected evaluation error.' };
    }
  }, [schema, decoded, validation.valid, rows]);

  const columns = React.useMemo(
      () => unionKeys(evaluation.rows.length ? evaluation.rows : rows),
      [evaluation.rows, rows],
  );

  // Editors (smart state)
  const [fieldsDraft, setFieldsDraft] = React.useState<string>(() => JSON.stringify(schema.fields, null, 2));
  const [opsDraft, setOpsDraft] = React.useState<string>(() => JSON.stringify(schema.operatorMap, null, 2));
  const [rowsDraft, setRowsDraft] = React.useState<string>(() => JSON.stringify(rows, null, 2));
  const [fieldsError, setFieldsError] = React.useState<string | null>(null);
  const [opsError, setOpsError] = React.useState<string | null>(null);
  const [rowsError, setRowsError] = React.useState<string | null>(null);

  const [canonDraft, setCanonDraft] = React.useState<string>(() => JSON.stringify(decoded, null, 2));
  const [canonError, setCanonError] = React.useState<string | null>(null);
  const [canonDirty, setCanonDirty] = React.useState<boolean>(false);

  React.useEffect(() => {
    setFieldsDraft(JSON.stringify(schema.fields, null, 2));
    setOpsDraft(JSON.stringify(schema.operatorMap, null, 2));
  }, [schema]);

  React.useEffect(() => {
    setRowsDraft(JSON.stringify(rows, null, 2));
  }, [rows]);

  React.useEffect(() => {
    if (!canonDirty) {
      setCanonDraft(JSON.stringify(decoded, null, 2));
      setCanonError(null);
    }
  }, [decoded, canonDirty]);

  // Apply handlers (smart)
  const applyFields = () => {
    try {
      const parsed = JSON.parse(fieldsDraft);
      if (!Array.isArray(parsed)) return setFieldsError('Fields JSON must be an array.');
      let candidate: Schema;
      try {
        candidate = createSchema(parsed as Schema['fields'], schema.operatorMap as OperatorMap);
      } catch (e) { return setFieldsError(e instanceof Error ? e.message : String(e)); }
      const issues = collectSchemaIssuesWithCore(candidate);
      if (issues.length > 0) return setFieldsError(issues.join('\n'));
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
      } catch (e) { return setOpsError(e instanceof Error ? e.message : String(e)); }
      const issues = collectSchemaIssuesWithCore(candidate);
      if (issues.length > 0) return setOpsError(issues.join('\n'));
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
      if (!Array.isArray(parsed)) return setRowsError('Rows JSON must be an array of objects.');
      if (!parsed.every((x) => typeof x === 'object' && x !== null)) {
        return setRowsError('Each item in Rows JSON must be an object.');
      }
      setRowsError(null);
      setRows(parsed as Array<Record<string, unknown>>);
      setRowsDraft(JSON.stringify(parsed, null, 2));
    } catch (e) {
      setRowsError(e instanceof Error ? e.message : String(e));
    }
  };

  const onCanonChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setCanonDirty(true);
    setCanonDraft(e.target.value);
  };

  const applyCanon = () => {
    try {
      const node = JSON.parse(canonDraft) as FilterNode;
      const res = api.validate(node);
      if (!res.valid) return setCanonError(res.issues.join('\n'));
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

  // Presets
  const loadPreset = (preset: 'users' | 'products') => {
    const nextSchema = preset === 'users' ? usersSchema : productsSchema;
    const nextRows   = preset === 'users' ? usersRows   : productsRows;
    const nextTree   = preset === 'users' ? usersDefaultTree : productsDefaultTree;

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

  // -------------------- Request Tester (smart) --------------------------------

  const [reqMethod, setReqMethod] = React.useState<HttpMethod>('GET');
  const [reqUrl, setReqUrl] = React.useState<string>('');
  const [reqBodyDraft, setReqBodyDraft] = React.useState<string>(() =>
      JSON.stringify({ filter: encoded }, null, 2)
  );
  const [reqBodyDirty, setReqBodyDirty] = React.useState(false);
  const [reqLoading, setReqLoading] = React.useState(false);
  const [reqError, setReqError] = React.useState<string | null>(null);
  const [reqSuccess, setReqSuccess] = React.useState<string | null>(null);

  // Keep POST body in sync with filter unless user edited it
  React.useEffect(() => {
    if (reqMethod === 'POST' && !reqBodyDirty) {
      setReqBodyDraft(JSON.stringify({ filter: encoded }, null, 2));
    }
  }, [encoded, reqMethod, reqBodyDirty]);

  const getUrlPreview = React.useMemo(() => {
    if (reqMethod !== 'GET' || !reqUrl) return null;
    try {
      return api.withFilterInUrl(reqUrl, encoded);
    } catch {
      return null;
    }
  }, [reqMethod, reqUrl, api, encoded]);

  const resetReqBody = () => {
    setReqBodyDirty(false);
    setReqBodyDraft(JSON.stringify({ filter: encoded }, null, 2));
  };

  const sendRequest = async () => {
    setReqLoading(true);
    setReqError(null);
    setReqSuccess(null);
    try {
      let response: Response;

      if (reqMethod === 'GET') {
        if (!reqUrl) throw new Error('Please enter a URL.');
        const fullUrl = api.withFilterInUrl(reqUrl, encoded);
        response = await fetch(fullUrl, { method: 'GET' });
      } else {
        if (!reqUrl) throw new Error('Please enter a URL.');
        let payload: unknown;
        try {
          payload = JSON.parse(reqBodyDraft);
        } catch (e) {
          throw new Error(`POST body is not valid JSON: ${(e as Error).message}`);
        }
        response = await fetch(reqUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`HTTP ${response.status} ${response.statusText}${text ? ` – ${text}` : ''}`);
      }

      const data = await response.json();

      // Normalize to array of objects for our rows
      let nextRows: Array<Record<string, unknown>>;
      if (Array.isArray(data)) {
        nextRows = data as Array<Record<string, unknown>>;
      } else if (Array.isArray((data as any).data)) {
        nextRows = (data as any).data;
      } else if (Array.isArray((data as any).items)) {
        nextRows = (data as any).items;
      } else {
        // last resort: wrap object into array
        nextRows = [data as Record<string, unknown>];
      }

      if (!nextRows.every((x) => typeof x === 'object' && x !== null)) {
        throw new Error('Response JSON is not an array of objects.');
      }

      setRows(nextRows);
      setReqSuccess(`Loaded ${nextRows.length} row(s) from server.`);
    } catch (e) {
      setReqError(e instanceof Error ? e.message : String(e));
    } finally {
      setReqLoading(false);
    }
  };

  // ---------------------- UI (dumb components wired) -------------------------

  return (
      <div className="mx-auto max-w-6xl p-4 space-y-6" data-test-id="app-root">
        <h1 className="text-2xl font-semibold" aria-label="Filter Builder Demo">Filter Builder (Demo)</h1>

        {/* Request Tester */}
        <RequestTester
            method={reqMethod}
            onMethodChange={(m) => { setReqMethod(m); if (m === 'POST' && !reqBodyDirty) resetReqBody(); }}
            url={reqUrl}
            onUrlChange={setReqUrl}
            body={reqBodyDraft}
            onBodyChange={(s) => { setReqBodyDirty(true); setReqBodyDraft(s); }}
            isBodyDirty={reqBodyDirty}
            onResetBody={resetReqBody}
            onSend={sendRequest}
            loading={reqLoading}
            error={reqError}
            success={reqSuccess}
            getUrlPreview={getUrlPreview}
            testId="request-tester"
        />

        {/* Schema Config: Rows + Fields + Operator Map */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <JsonEditorCard
              title="Rows JSON"
              value={rowsDraft}
              onChange={setRowsDraft}
              onApply={applyRows}
              error={rowsError}
              okLabel="Rows OK"
              testId="rows-editor"
              extraActionsLeft={
                <>
                  <span className="text-[10px] text-gray-500 mr-1" aria-hidden>Presets:</span>
                  <button
                      type="button"
                      onClick={() => loadPreset('users')}
                      className="rounded-md border px-2 py-1 text-[11px] hover:bg-gray-50"
                      aria-label="Load Users preset (schema + rows + filter)"
                      data-test-id="btn-preset-users"
                  >
                    Users
                  </button>
                  <button
                      type="button"
                      onClick={() => loadPreset('products')}
                      className="rounded-md border px-2 py-1 text-[11px] hover:bg-gray-50"
                      aria-label="Load Products preset (schema + rows + filter)"
                      data-test-id="btn-preset-products"
                  >
                    Products
                  </button>
                </>
              }
          />

          <JsonEditorCard
              title="Fields JSON"
              value={fieldsDraft}
              onChange={setFieldsDraft}
              onApply={applyFields}
              error={fieldsError}
              okLabel="Schema fields OK"
              testId="fields-editor"
          />

          <JsonEditorCard
              title="Operator Map JSON"
              value={opsDraft}
              onChange={setOpsDraft}
              onApply={applyOps}
              error={opsError}
              okLabel="Operator map OK"
              testId="ops-editor"
          />
        </section>

        {/* Filter Builder + Diagnostics */}
        <section className="space-y-3">
          <div data-test-id="filter-builder" aria-label="Filter builder">
            <FilterBuilder
                schema={schema}
                value={decoded}
                onChange={setTree}
                className="bg-white rounded-lg border p-4"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <JsonEditorCard
                title="Canonical JSON (editable)"
                value={canonDraft}
                onChange={onCanonChange}
                onApply={applyCanon}
                onReset={resetCanon}
                error={canonError}
                okLabel="Filter JSON OK"
                dirtyHint="Edited — press Apply to see changes"
                isDirty={canonDirty}
                testId="canonical-editor"
            />

            <Card title="Target JSON" data-test-id="target-json" ariaLabel="Target JSON">
            <pre className="text-xs overflow-auto" aria-label="Target JSON pre">
              {JSON.stringify(encoded, null, 2)}
            </pre>
            </Card>

            <Card title="GET Query Param" data-test-id="query-param" ariaLabel="GET Query Param">
              <code className="break-words text-xs" aria-label="Query parameter">{qp}</code>
              <div className="mt-2 text-xs" aria-live="polite">
              <span
                  className={validation.valid ? 'text-green-700' : 'text-red-700'}
                  data-test-id="validation-summary"
                  aria-label={validation.valid ? 'Filter valid' : 'Filter invalid'}
              >
                {validation.valid ? 'Valid' : 'Invalid'} ({validation.issues.length} issues)
              </span>
                {!validation.valid && (
                    <ul className="list-disc ml-5 mt-1" data-test-id="validation-issues">
                      {validation.issues.map((i, idx) => <li key={idx}>{i}</li>)}
                    </ul>
                )}
              </div>
            </Card>
          </div>
        </section>

        {/* Filtered results */}
        <ResultsTable
            title="Filtered Results"
            rows={evaluation.rows}
            columns={columns}
            validationMessage={
              !validation.valid
                  ? 'Results hidden because current filter is invalid.'
                  : evaluation.error
            }
            testId="results"
        />
      </div>
  );
};
