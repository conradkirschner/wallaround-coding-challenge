import * as React from 'react';
import type { HttpMethod } from '../components/ui/MethodToggle';
import type { FilterNode } from 'filter-builder-core';
import { HttpRequestError } from '../errors';
import { pretty } from '../utils/json';

type Params = {
  api: { withFilterInUrl: (url: string, node: FilterNode) => string };
  encoded: FilterNode;
  setRows: (rows: Array<Record<string, unknown>>) => void;
};

export function useRequestTester({ api, encoded, setRows }: Params) {
  const [method, setMethod] = React.useState<HttpMethod>('GET');
  const [url, setUrl] = React.useState('');
  const [bodyDraft, setBodyDraft] = React.useState(() => pretty({ filter: encoded }));
  const [bodyDirty, setBodyDirty] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (method === 'POST' && !bodyDirty) setBodyDraft(pretty({ filter: encoded }));
  }, [encoded, method, bodyDirty]);

  const getUrlPreview = React.useMemo(() => {
    if (method !== 'GET' || !url) return null;
    try {
      return api.withFilterInUrl(url, encoded);
    } catch {
      return null;
    }
  }, [method, url, api, encoded]);

  const resetBody = () => {
    setBodyDirty(false);
    setBodyDraft(pretty({ filter: encoded }));
  };

  const send = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      let res: Response;
      if (!url) throw new HttpRequestError('Please enter a URL.');

      if (method === 'GET') {
        res = await fetch(api.withFilterInUrl(url, encoded), { method: 'GET' });
      } else {
        let payload: unknown;
        try {
          payload = JSON.parse(bodyDraft);
        } catch (e) {
          throw new HttpRequestError(`POST body is not valid JSON: ${(e as Error).message}`);
        }
        res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new HttpRequestError(
          `HTTP ${res.status} ${res.statusText}${text ? ` – ${text}` : ''}`,
          res.status,
        );
      }

      const data = await res.json();
      let next: Array<Record<string, unknown>>;
      if (Array.isArray(data)) next = data;
      else if (Array.isArray((data as any).data)) next = (data as any).data;
      else if (Array.isArray((data as any).items)) next = (data as any).items;
      else next = [data as Record<string, unknown>];

      if (!next.every((x) => typeof x === 'object' && x !== null)) {
        throw new HttpRequestError('Response JSON is not an array of objects.');
      }

      setRows(next);
      setSuccess(`Loaded ${next.length} row(s) from server.`);
    } catch (e) {
      if (e instanceof HttpRequestError) {
        setError(e.message);
      }
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    method,
    setMethod,
    url,
    setUrl,
    bodyDraft,
    setBodyDraft,
    bodyDirty,
    setBodyDirty,
    loading,
    error,
    success,
    getUrlPreview,
    resetBody,
    send,
  };
}
