import * as React from 'react';
export function RequestPreview({ method, url, body }: { method: string; url: string; body?: unknown }) {
  return (
    <div className="panel" role="region" aria-label="Request preview">
      <div><span className="badge">{method}</span> <code>{url}</code></div>
      {body ? <pre aria-label="request-body">{JSON.stringify(body, null, 2)}</pre> : null}
    </div>
  );
}
