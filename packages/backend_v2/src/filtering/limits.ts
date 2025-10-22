// src/filtering/limits.ts
export interface FilterLimits {
    /** Max nested depth of and/or groups (root = depth 1). */
    maxDepth: number;
    /** Max total nodes (groups + conditions). */
    maxNodes: number;
    /** Max array length for 'in' operator. */
    maxInSize: number;
}

export const DefaultLimits: Readonly<FilterLimits> = {
    maxDepth: 6,
    maxNodes: 200,
    maxInSize: 500,
};

export function mergeLimits(partial?: Partial<FilterLimits>): FilterLimits {
    return { ...DefaultLimits, ...(partial ?? {}) };
}
