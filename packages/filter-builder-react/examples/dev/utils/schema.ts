import { createFilterApi, type Schema, type OperatorDef, type FilterNode } from 'filter-builder-core';

export function exampleValueFor(type: string): unknown {
    switch (type) {
        case 'string': return 'x';
        case 'number': return 1;
        case 'boolean': return true;
        case 'date': return '2020-01-01';
        default: return 'x';
    }
}

export function collectSchemaIssuesWithCore(schema: Schema): string[] {
    const api = createFilterApi(schema);
    if (schema.operators.length === 0) return ['No operators available in schema (operator map resolved to empty set).'];
    const issues: string[] = [];
    for (const f of schema.fields) {
        const op: OperatorDef = schema.operators.find((o) => o.key === 'eq') ?? schema.operators[0];
        const probe: FilterNode = { field: f.key, operator: op.key, value: exampleValueFor(f.type) };
        const res = api.validate(probe);
        if (!res.valid) for (const msg of res.issues) issues.push(`[${f.key}] ${msg}`);
    }
    return issues;
}
