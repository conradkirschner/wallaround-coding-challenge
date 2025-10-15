import type { Schema, FilterNode } from 'filter-builder-core';

export const FILTER_CHANGE_EVENT = 'filter-builder:change' as const;

export type FilterValidation = {
  valid: boolean;
  issues: string[];
};

export type FilterChangeDetail = {
  /** Canonical (decoded) filter JSON */
  canonical: FilterNode;
  /** Encoded/target filter JSON */
  encoded: FilterNode;
  /** Query string the API helper produced (e.g. ?filter=...) */
  queryString: string;
  /** Active schema used to build/validate the filter */
  schema: Schema;
  /** Validator result for the canonical node */
  validation: FilterValidation;
  /** Emission timestamp (ms since epoch) */
  timestamp: number;
};
