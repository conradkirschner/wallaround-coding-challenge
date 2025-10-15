import * as React from 'react';
import type { Schema, FilterNode } from 'filter-builder-core';
import { emitFilterChange } from '../events/emit';
import { FILTER_CHANGE_EVENT, type FilterChangeDetail, type FilterValidation } from '../events/types';

export type UseFilterEmitterOptions = {
    /** Where to emit (defaults to window if present) */
    target?: EventTarget | null;
    /** Optional React callback mirror of the event */
    onEmit?: (detail: FilterChangeDetail) => void;
    /**
     * Avoid duplicate emissions if the signature (encoded+query) hasn't changed.
     * Default: true
     */
    dedupe?: boolean;
};

export function useFilterEmitter(
    args: {
        canonical: FilterNode;
        encoded: FilterNode;
        queryString: string;
        schema: Schema;
        validation: FilterValidation;
    },
    opts: UseFilterEmitterOptions = {}
) {
    const { canonical, encoded, queryString, schema, validation } = args;
    const { target, onEmit, dedupe = true } = opts;

    // Signature to suppress redundant emits (encoded+query is usually enough)
    const sig = React.useMemo(
        () => JSON.stringify({ encoded, queryString }),
        [encoded, queryString]
    );

    const lastSigRef = React.useRef<string | null>(null);

    React.useEffect(() => {
        if (dedupe && lastSigRef.current === sig) return;

        lastSigRef.current = sig;

        const detail: FilterChangeDetail = {
            canonical,
            encoded,
            queryString,
            schema,
            validation,
            timestamp: Date.now(),
        };

        emitFilterChange(detail, target);
        onEmit?.(detail);
    }, [sig, canonical, encoded, queryString, schema, validation, target, onEmit, dedupe]);
}

/** Convenience: subscribe to the custom event (for non-React or other islands). */
export function useFilterEventListener(
    handler: (detail: FilterChangeDetail) => void,
    target?: EventTarget | null
) {
    React.useEffect(() => {
        const tgt = target ?? (typeof window !== 'undefined' ? window : null);
        if (!tgt) return;

        const onEvt = (e: Event) => {
            const ce = e as CustomEvent<FilterChangeDetail>;
            handler(ce.detail);
        };

        tgt.addEventListener(FILTER_CHANGE_EVENT, onEvt as EventListener);
        return () => tgt.removeEventListener(FILTER_CHANGE_EVENT, onEvt as EventListener);
    }, [handler, target]);
}
