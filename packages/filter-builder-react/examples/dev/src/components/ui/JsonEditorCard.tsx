import * as React from 'react';
import { Card } from './Card';

type JsonEditorCardProps = {
  title: string;
  value: string;
  onChange: (next: string) => void;
  onApply?: () => void;
  onReset?: () => void;
  error?: string | null;
  okLabel?: string;
  dirtyHint?: string;
  isDirty?: boolean;
  testId?: string;
  ariaLabel?: string;
  extraActionsLeft?: React.ReactNode; // e.g. preset buttons
};

export const JsonEditorCard: React.FC<JsonEditorCardProps> = ({
  title,
  value,
  onChange,
  onApply,
  onReset,
  error,
  okLabel = 'OK',
  dirtyHint,
  isDirty,
  testId,
  ariaLabel,
  extraActionsLeft,
}) => {
  const errorId = testId ? `${testId}__error` : undefined;

  return (
    <Card
      title={title}
      ariaLabel={ariaLabel ?? title}
      data-test-id={testId}
      actions={
        <>
          {extraActionsLeft}
          {isDirty && dirtyHint ? (
            <span
              className="text-xs text-amber-700"
              aria-live="polite"
              data-test-id={testId ? `${testId}__dirty-hint` : undefined}
            >
              {dirtyHint}
            </span>
          ) : null}
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
              aria-label={`Reset ${title}`}
              data-test-id={testId ? `${testId}__btn-reset` : undefined}
            >
              Reset
            </button>
          )}
          {onApply && (
            <button
              type="button"
              onClick={onApply}
              className="rounded-md border px-2 py-1 text-xs bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-500"
              aria-label={`Apply ${title}`}
              data-test-id={testId ? `${testId}__btn-apply` : undefined}
            >
              Apply
            </button>
          )}
        </>
      }
    >
      <textarea
        className="w-full h-64 rounded-md border border-gray-300 px-2 py-1 text-xs font-mono"
        aria-label={`${title} editor`}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        data-test-id={testId ? `${testId}__textarea` : undefined}
      />
      {error ? (
        <p
          id={errorId}
          className="mt-2 text-xs text-red-700 whitespace-pre-wrap"
          role="alert"
          data-test-id={testId ? `${testId}__error` : undefined}
        >
          {error}
        </p>
      ) : (
        <p
          className="mt-2 text-xs text-green-700"
          data-test-id={testId ? `${testId}__ok` : undefined}
        >
          {isDirty ? 'Draft has un-applied edits' : okLabel}
        </p>
      )}
    </Card>
  );
};
