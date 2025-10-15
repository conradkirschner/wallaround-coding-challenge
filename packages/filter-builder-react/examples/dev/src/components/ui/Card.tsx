import * as React from 'react';

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
    'data-test-id'?: string;
    title?: string;
    actions?: React.ReactNode;
    ariaLabel?: string;
};

export const Card: React.FC<CardProps> = ({
                                              className = '',
                                              children,
                                              title,
                                              actions,
                                              'data-test-id': testId,
                                              ariaLabel,
                                              ...rest
                                          }) => (
    <section
        role="region"
        aria-label={ariaLabel ?? title}
        data-test-id={testId}
        className={`rounded-lg border bg-white p-3 ${className}`}
        {...rest}
    >
        {(title || actions) && (
            <div className="flex items-center justify-between mb-2">
                {title ? <h2 className="text-sm font-semibold">{title}</h2> : <div />}
                {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
            </div>
        )}
        {children}
    </section>
);
