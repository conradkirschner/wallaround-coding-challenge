import * as React from 'react';
import { type Schema, type FilterNode, createFilterApi } from 'filter-builder-core';
import { filterRows } from '../evaluation';
import { InvalidSchemaOperationError } from '../errors';
import { unionKeys } from '../utils/table';

export function useEvaluation(schema: Schema, decoded: FilterNode, rows: Array<Record<string, unknown>>) {
    const api = React.useMemo(() => createFilterApi(schema), [schema]);

    const validation = api.validate(decoded);
    const encoded = React.useMemo(() => api.encode(decoded), [api, decoded]);
    const qp = React.useMemo(() => api.toQueryParam(encoded), [api, encoded]);

    const evaluation = React.useMemo(() => {
        if (!validation.valid) return { rows: [] as Array<Record<string, unknown>>, error: null as string | null };
        try { return { rows: filterRows(schema, decoded, rows), error: null as string | null }; }
        catch (e) {
            if (e instanceof InvalidSchemaOperationError) return { rows: [], error: e.message };
            return { rows: [], error: 'Unexpected evaluation error.' };
        }
    }, [schema, decoded, rows, validation.valid]);

    const columns = React.useMemo(
        () => unionKeys(evaluation.rows.length ? evaluation.rows : rows),
        [evaluation.rows, rows]
    );

    return { api, validation, encoded, qp, evaluation, columns };
}
