import * as React from 'react';

export type ConditionFrameProps = {
  header: React.ReactNode;
  children: React.ReactNode;
  className: string | undefined;
  testId?: string;
};

export const ConditionFrame: React.FC<ConditionFrameProps> = ({
  header,
  children,
  className,
  testId = 'condition-frame',
}) => {
  return (
    <section
      className={`rounded-md border p-3 space-y-2 bg-white ${className ?? ''}`}
      data-test-id={testId}
    >
      {header}
      {children}
    </section>
  );
};
