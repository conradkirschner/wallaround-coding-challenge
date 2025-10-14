import * as React from 'react';
import { FilterBuilder } from 'filter-builder-react';
import { createFilterApi, createSchema, type Schema, type FilterNode } from 'filter-builder-core';
import { evaluateTree } from './evaluate';

const schema: Schema = createSchema(
  [
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
  ],
  {
    string: ['eq','neq','contains','starts_with','ends_with','in','is_null','is_not_null'],
    number: ['eq','neq','gt','lt','between','in','is_null','is_not_null'],
    boolean: ['eq','neq','is_null','is_not_null'],
    date: ['eq','neq','before','after','between','is_null','is_not_null']
  }
);

const sampleRows: Array<Record<string, unknown>> = [
  { id: 1, name: 'Alice', role: 'admin', age: 31, country: 'de', isActive: true,  joined: '2021-01-05' },
  { id: 2, name: 'Bob',   role: 'editor', age: 26, country: 'us', isActive: false, joined: '2020-07-22' },
  { id: 3, name: 'Cara',  role: 'viewer', age: 42, country: 'gb', isActive: true,  joined: '2019-11-13' },
  { id: 4, name: 'Dieter',role: 'admin',  age: 29, country: 'de', isActive: true,  joined: '2023-03-18' },
  { id: 5, name: 'Eve',   role: 'editor', age: 35, country: 'fr', isActive: false, joined: '2022-09-09' },
];

export const App: React.FC = () => {
  const api = React.useMemo(() => createFilterApi(schema), []);

  const [tree, setTree] = React.useState<FilterNode>({
    and: [
      { field: 'age', operator: 'gt', value: 25 },
      { or: [
        { field: 'role', operator: 'eq', value: 'admin' },
        { field: 'isActive', operator: 'eq', value: true }
      ]}
    ]
  });

  const decoded = api.decode(tree);
  const encoded = api.encode(decoded);
  const qp = api.toQueryParam(encoded);
  const validation = api.validate(decoded);

  const filtered = React.useMemo(
    () => sampleRows.filter((r) => evaluateTree(r, decoded)),
    [decoded]
  );

  return (
    <div className="mx-auto max-w-5xl p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Filter Builder (Demo)</h1>

      <section className="space-y-3">
        <FilterBuilder schema={schema} value={decoded} onChange={setTree} className="bg-white rounded-lg border p-4" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-lg border bg-white p-3">
            <h2 className="text-sm font-semibold mb-2">Canonical JSON</h2>
            <pre className="text-xs overflow-auto">{JSON.stringify(decoded, null, 2)}</pre>
          </div>
          <div className="rounded-lg border bg-white p-3">
            <h2 className="text-sm font-semibold mb-2">Target JSON</h2>
            <pre className="text-xs overflow-auto">{JSON.stringify(encoded, null, 2)}</pre>
          </div>
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

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Filtered Results</h2>
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-3 py-2 text-left font-medium">ID</th>
                <th className="px-3 py-2 text-left font-medium">Name</th>
                <th className="px-3 py-2 text-left font-medium">Role</th>
                <th className="px-3 py-2 text-left font-medium">Age</th>
                <th className="px-3 py-2 text-left font-medium">Country</th>
                <th className="px-3 py-2 text-left font-medium">Active</th>
                <th className="px-3 py-2 text-left font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={String(r.id)} className="border-t">
                  <td className="px-3 py-1">{String(r.id)}</td>
                  <td className="px-3 py-1">{String(r.name)}</td>
                  <td className="px-3 py-1">{String(r.role)}</td>
                  <td className="px-3 py-1">{String(r.age)}</td>
                  <td className="px-3 py-1">{String(r.country)}</td>
                  <td className="px-3 py-1">{String(r.isActive)}</td>
                  <td className="px-3 py-1">{String(r.joined)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
