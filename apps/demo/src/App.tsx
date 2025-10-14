import * as React from 'react';
import './styles.css';
import { FilterBuilder } from 'filter-builder-react';
import type { FilterNode } from 'filter-builder-core';
import { userApi, productApi } from './datasets';
import { RequestPreview } from './components/RequestPreview';

const initial: FilterNode = {
  and: [
    { field: 'age', operator: 'gt', value: 30 },
    { or: [
      { field: 'role', operator: 'eq', value: 'admin' },
      { field: 'isActive', operator: '=', value: true }
    ] }
  ]
};

export default function App() {
  const [dataset, setDataset] = React.useState<'users' | 'products'>('users');
  const [mode, setMode] = React.useState<'get' | 'post'>('get');
  const [request, setRequest] = React.useState<{ method: string; url: string; body?: unknown }>({
    method: 'GET', url: '/search?filter=%7B%7D'
  });
  const core = dataset === 'users' ? userApi : productApi;

  return (
    <div className="container">
      <h1>Filter Builder — Strict & Lean</h1>

      <div className="toolbar">
        <label>
          <span>Dataset:</span>
          <select aria-label="Dataset" value={dataset} onChange={(e) => setDataset(e.target.value as 'users' | 'products')}>
            <option value="users">Users</option>
            <option value="products">Products</option>
          </select>
        </label>

        <label>
          <span>Transport:</span>
          <select aria-label="Transport mode" value={mode} onChange={(e) => setMode(e.target.value as 'get' | 'post')}>
            <option value="get">GET</option>
            <option value="post">POST</option>
          </select>
        </label>
      </div>

      <div className="panel">
        <FilterBuilder
          core={core}
          initialFilter={initial}
          transport={{ mode, baseUrl: '/search', queryParam: 'filter' }}
          onEmit={(payload) => setRequest({ method: payload.method, url: payload.url ?? '', body: payload.body })}
          aria-label="Filter builder"
        />
      </div>

      <div className="section">
        <h2>Request</h2>
        <RequestPreview method={request.method} url={request.url} body={request.body} />
      </div>
    </div>
  );
}
