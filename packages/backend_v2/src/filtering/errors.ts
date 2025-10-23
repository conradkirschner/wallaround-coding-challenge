// src/filtering/errors.ts
export type FilterErrorCode =
    | 'FILTER_INVALID_SHAPE'
    | 'FILTER_FIELD_NOT_ALLOWED'
    | 'FILTER_OPERATOR_UNSUPPORTED'
    | 'FILTER_VALUE_INVALID'
    | 'FILTER_FIELD_NOT_SELECTABLE'
    | 'FILTER_COMPLEXITY_EXCEEDED';

export class FilterError extends Error {
    readonly code: FilterErrorCode;
    readonly details?: Record<string, unknown> | undefined;

    constructor(code: FilterErrorCode, message: string, details?: Record<string, unknown>) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'FilterError';
    }
}
