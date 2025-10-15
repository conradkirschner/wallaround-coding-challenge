import {Field} from "filter-builder-core";

export class NoOperationError extends Error {
    constructor(public fields: readonly Field[]) {
        super(`No operators available for field types: ${Array.from(new Set(fields.map((f) => f.type))).join(', ') || '(none)'}. ` +
            `Check your schema's operatorMap.`);
        this.name = 'NoOperationError';

    }
}