import * as React from 'react';
import { Card } from './Card';
import { MethodToggle, type HttpMethod } from './MethodToggle';

type RequestTesterProps = {
  method: HttpMethod;
  onMethodChange: (m: HttpMethod) => void;

  url: string;
  onUrlChange: (s: string) => void;
  body: string;
  onBodyChange: (s: string) => void;
  isBodyDirty?: boolean;
  onResetBody?: () => void;

  onSend: () => void;
  loading?: boolean;
  error?: string | null;
  success?: string | null;
  getUrlPreview?: string | null; // full GET url preview when method === 'GET'

  testId?: string;
};

export const RequestTester: React.FC<RequestTesterProps> = ({
  method,
  onMethodChange,
  url,
  onUrlChange,
  body,
  onBodyChange,
  isBodyDirty,
  onResetBody,
  onSend,
  loading,
  error,
  success,
  getUrlPreview,
  testId,
}) => {
  return (
    <Card title="Request Tester" data-test-id={testId} ariaLabel="Request Tester">
      <div className="flex items-center gap-2 mb-2">
        <label className="text-xs text-gray-600" htmlFor="req-url">
          URL
        </label>
        <input
          id="req-url"
          type="text"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://api.example.com/search"
          className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm"
          aria-label="Request URL"
          data-test-id={testId ? `${testId}__url` : undefined}
        />
        <MethodToggle
          value={method}
          onChange={onMethodChange}
          ariaLabel="HTTP method"
          testId={testId ? `${testId}__method` : undefined}
        />
        <button
          type="button"
          onClick={onSend}
          disabled={loading || !url}
          className="rounded-md border px-2 py-1 text-xs bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-500 disabled:opacity-60"
          aria-label="Send request"
          data-test-id={testId ? `${testId}__send` : undefined}
        >
          {loading ? 'Sending…' : 'Send'}
        </button>
      </div>

      {method === 'GET' && !!getUrlPreview && (
        <div className="mb-2">
          <div className="text-[11px] text-gray-600 mb-1">Resolved GET URL</div>
          <code
            className="break-words text-[11px]"
            data-test-id={testId ? `${testId}__get-preview` : undefined}
          >
            {getUrlPreview}
          </code>
        </div>
      )}

      {method === 'POST' && (
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] text-gray-600" htmlFor="req-body">
              POST Body (JSON)
            </label>
            <div className="flex items-center gap-2">
              {isBodyDirty ? (
                <span
                  className="text-[11px] text-amber-700"
                  data-test-id={testId ? `${testId}__dirty-hint` : undefined}
                >
                  Edited — you can reset to auto body
                </span>
              ) : null}
              {onResetBody && (
                <button
                  type="button"
                  onClick={onResetBody}
                  className="rounded-md border px-2 py-1 text-[11px] hover:bg-gray-50"
                  aria-label="Reset POST body to auto"
                  data-test-id={testId ? `${testId}__reset-body` : undefined}
                >
                  Reset body
                </button>
              )}
            </div>
          </div>
          <textarea
            id="req-body"
            className="w-full h-40 rounded-md border border-gray-300 px-2 py-1 text-xs font-mono"
            aria-label="POST body JSON editor"
            value={body}
            onChange={(e) => onBodyChange(e.target.value)}
            spellCheck={false}
            data-test-id={testId ? `${testId}__body` : undefined}
          />
        </div>
      )}

      <div className="min-h-[1.25rem]" aria-live="polite">
        {error ? (
          <p
            className="text-xs text-red-700 whitespace-pre-wrap"
            data-test-id={testId ? `${testId}__error` : undefined}
            role="alert"
          >
            {error}
          </p>
        ) : success ? (
          <p
            className="text-xs text-green-700"
            data-test-id={testId ? `${testId}__success` : undefined}
          >
            {success}
          </p>
        ) : null}
      </div>
    </Card>
  );
};
