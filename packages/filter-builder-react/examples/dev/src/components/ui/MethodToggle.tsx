import * as React from 'react';

export type HttpMethod = 'GET' | 'POST';

type MethodToggleProps = {
  value: HttpMethod;
  onChange: (m: HttpMethod) => void;
  testId?: string;
  ariaLabel?: string;
};

export const MethodToggle: React.FC<MethodToggleProps> = ({
  value,
  onChange,
  testId,
  ariaLabel,
}) => {
  const isGet = value === 'GET';
  return (
    <div
      className="inline-flex rounded-md border overflow-hidden"
      role="radiogroup"
      aria-label={ariaLabel ?? 'HTTP method'}
      data-test-id={testId}
    >
      <button
        type="button"
        role="radio"
        aria-checked={isGet}
        className={`px-2 py-1 text-xs ${isGet ? 'bg-indigo-600 text-white' : 'bg-white'} hover:bg-gray-50`}
        onClick={() => onChange('GET')}
        data-test-id={testId ? `${testId}__get` : undefined}
      >
        GET
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={!isGet}
        className={`px-2 py-1 text-xs ${!isGet ? 'bg-indigo-600 text-white' : 'bg-white'} hover:bg-gray-50 border-l`}
        onClick={() => onChange('POST')}
        data-test-id={testId ? `${testId}__post` : undefined}
      >
        POST
      </button>
    </div>
  );
};
