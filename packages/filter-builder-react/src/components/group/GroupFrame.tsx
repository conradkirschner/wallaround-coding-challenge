import * as React from 'react';

export type GroupFrameProps = {
    groupLabelId: string;
    className?: string;
    testId?: string;
    header: React.ReactNode;
    childrenList: React.ReactNode; // the <ul> of children
    footer: React.ReactNode; // actions
};

export const GroupFrame: React.FC<GroupFrameProps> = ({
                                                          groupLabelId,
                                                          className,
                                                          testId = 'group-frame',
                                                          header,
                                                          childrenList,
                                                          footer,
                                                      }) => {
    return (
        <section
            role="group"
            aria-roledescription="Filter group"
            aria-labelledby={groupLabelId}
            className={`rounded-lg border border-gray-200 p-3 space-y-3 bg-white ${className ?? ''}`}
            data-test-id={testId}
        >
            {header}
            {childrenList}
            {footer}
        </section>
    );
};
