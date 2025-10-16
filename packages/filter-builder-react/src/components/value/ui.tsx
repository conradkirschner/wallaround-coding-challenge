import * as React from 'react';
import type { OneHandlers, TwoHandlers, ManyHandlers } from './useValueEditor';

export const NoValuePill: React.FC<{ testId?: string }> = ({ testId }) => (
  <span className="text-gray-500 text-sm" data-test-id={testId}>
    No value
  </span>
);

export const OneValue: React.FC<{ h: OneHandlers; testId?: string }> = ({ h, testId }) => {
  switch (h.mode) {
    case 'boolean':
      return (
        <div className="flex items-center gap-2" data-test-id={testId}>
          <label htmlFor={h.controlId} className="sr-only">
            {h.ariaLabel}
          </label>
          <h.Checkbox
            id={h.controlId}
            checked={h.checked}
            onChange={h.onBool}
            aria-label={h.ariaLabel}
          />
        </div>
      );
    case 'select':
      return (
        <div className="min-w-[12rem]" data-test-id={testId}>
          <label htmlFor={h.controlId} className="sr-only">
            {h.ariaLabel}
          </label>
          <select
            id={h.controlId}
            aria-label={h.ariaLabel}
            className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm bg-white"
            value={h.value}
            onChange={(e) => h.onSelect(e.target.value)}
          >
            <option value="">—</option>
            {h.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );
    case 'number':
      return (
        <div className="min-w-[10rem]" data-test-id={testId}>
          <label htmlFor={h.controlId} className="sr-only">
            {h.ariaLabel}
          </label>
          <h.NumberInput
            id={h.controlId}
            value={h.value}
            onChange={h.onNumber}
            aria-label={h.ariaLabel}
          />
        </div>
      );
    case 'date':
      return (
        <div className="min-w-[12rem]" data-test-id={testId}>
          <label htmlFor={h.controlId} className="sr-only">
            {h.ariaLabel}
          </label>
          <h.DateInput
            id={h.controlId}
            value={h.value}
            onChange={h.onDate}
            aria-label={h.ariaLabel}
          />
        </div>
      );
    case 'string':
      return (
        <div className="min-w-[12rem]" data-test-id={testId}>
          <label htmlFor={h.controlId} className="sr-only">
            {h.ariaLabel}
          </label>
          <h.Text id={h.controlId} value={h.value} onChange={h.onText} aria-label={h.ariaLabel} />
        </div>
      );
  }
};

export const TwoValue: React.FC<{ h: TwoHandlers; testId?: string }> = ({ h, testId }) => {
  return (
    <div className="flex items-center gap-2" data-test-id={testId}>
      <OneValue h={h.a} />
      <span className="text-xs text-gray-500">to</span>
      <OneValue h={h.b} />
    </div>
  );
};

export const ManyValue: React.FC<{ h: ManyHandlers; testId?: string }> = ({ h, testId }) => {
  if (h.mode === 'checkboxes') {
    return (
      <div className="flex flex-wrap gap-2" data-test-id={testId}>
        {h.options.map((opt) => (
          <label key={opt.value} className="inline-flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              checked={h.selected.includes(opt.value)}
              onChange={() => h.onToggle(opt.value)}
              aria-label={`${h.ariaLabelBase}: ${opt.label}`}
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full min-w-[16rem]" data-test-id={testId}>
      <label htmlFor={h.controlId} className="sr-only">
        {h.ariaLabel}
      </label>
      <textarea
        id={h.controlId}
        className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
        placeholder="Comma-separated values"
        value={h.csv}
        onChange={(e) => h.onCsv(e.target.value)}
        aria-label={h.ariaLabel}
        rows={2}
      />
    </div>
  );
};
