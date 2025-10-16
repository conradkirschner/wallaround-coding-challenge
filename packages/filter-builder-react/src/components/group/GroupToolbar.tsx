import * as React from 'react';
import type { GroupKind } from './helpers';

export type GroupToolbarProps = {
  kind: GroupKind;
  labelId: string;
  onToggleKind: () => void;
  onRemove?: (() => void) | undefined;
  testId?: string | undefined;
};

const KindPill: React.FC<{ kind: GroupKind }> = ({ kind }) => (
  <span
    className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
    aria-label={`Group kind: ${kind.toUpperCase()}`}
  >
    {kind.toUpperCase()}
  </span>
);

export const GroupToolbar: React.FC<GroupToolbarProps> = ({
  kind,
  labelId,
  onToggleKind,
  onRemove,
  testId = 'group-toolbar',
}) => {
  return (
    <header className="flex items-center justify-between" data-test-id={testId}>
      <div className="flex items-center gap-2">
        <span id={labelId} className="text-xs font-semibold text-gray-600">
          Group
        </span>
        <KindPill kind={kind} />
        <button
          type="button"
          onClick={onToggleKind}
          className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
          aria-label="Toggle group kind between AND and OR"
          data-test-id={`${testId}-toggle-kind`}
        >
          Toggle AND/OR
        </button>
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="rounded-md border px-2 py-1 text-xs text-red-700 border-red-200 hover:bg-red-50"
          aria-label="Remove this group"
          data-test-id={`${testId}-remove`}
        >
          Remove
        </button>
      )}
    </header>
  );
};
