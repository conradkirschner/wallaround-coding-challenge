import * as React from 'react';

export type GroupActionsProps = {
    onAddCondition: () => void;
    onAddAndGroup: () => void;
    onAddOrGroup: () => void;
    testId?: string;
};

export const GroupActions: React.FC<GroupActionsProps> = ({
                                                              onAddCondition,
                                                              onAddAndGroup,
                                                              onAddOrGroup,
                                                              testId = 'group-actions',
                                                          }) => {
    return (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t" data-test-id={testId}>
            <button
                type="button"
                onClick={onAddCondition}
                className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                aria-label="Add condition to this group"
                data-test-id={`${testId}-add-condition`}
            >
                + Condition
            </button>
            <button
                type="button"
                onClick={onAddAndGroup}
                className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                aria-label="Add nested AND group"
                data-test-id={`${testId}-add-and-group`}
            >
                + AND group
            </button>
            <button
                type="button"
                onClick={onAddOrGroup}
                className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                aria-label="Add nested OR group"
                data-test-id={`${testId}-add-or-group`}
            >
                + OR group
            </button>
        </div>
    );
};
