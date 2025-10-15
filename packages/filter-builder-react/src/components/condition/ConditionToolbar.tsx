import * as React from 'react';

export type ConditionToolbarProps = {
  onRemove?: () => void;
  testId?: string;
};

export const ConditionToolbar: React.FC<ConditionToolbarProps> = ({
  onRemove,
  testId = 'condition-toolbar',
}) => {
  return (
    <div className="flex items-center justify-between" data-test-id={testId}>
      <div className="text-sm font-medium" aria-label="Condition header">
        Condition
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="rounded-md border px-2 py-1 text-xs text-red-700 border-red-200 hover:bg-red-50"
          aria-label="Remove condition"
          data-test-id={`${testId}-remove`}
        >
          Remove
        </button>
      )}
    </div>
  );
};
