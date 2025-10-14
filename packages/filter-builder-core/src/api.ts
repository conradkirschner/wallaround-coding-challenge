import { decodeTarget, encodeTarget } from './convert.js';
import type { FilterApi, FilterNode, Schema } from './types.js';
import { validateNode } from './validate.js';

/**
 * Build a single URL-safe query string pair for a filter payload.
 *
 * Contract:
 * - Accepts a **target**-shape filter (already denormalized, e.g. `eq` → `"="`).
 * - Parameter name provided by caller; API wrapper supplies default `"filter"`.
 */
const toQueryParam = (target: FilterNode, param: string): string =>
  `${param}=${encodeURIComponent(JSON.stringify(target))}`;

/**
 * Produce a complete URL with the filter payload appended as a single query parameter.
 * - Appends using `'?'` or `'&'` depending on whether `baseUrl` already contains a query.
 */
const withFilterInUrl = (baseUrl: string, target: FilterNode, param: string): string =>
  `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${toQueryParam(target, param)}`;

/**
 * Factory for the minimal, explicit **core API** used by the React wrapper and external callers.
 */
export function createFilterApi(schema: Schema): FilterApi {
  return {
    schema,
    decode: decodeTarget,
    encode: encodeTarget,
    validate: (input: FilterNode) => validateNode(input, schema),

    // Provide defaults here (not in the module-level helpers), so mutants on defaults can't survive.
    toQueryParam: (input: FilterNode, param?: string) => toQueryParam(input, param ?? 'filter'),
    withFilterInUrl: (baseUrl: string, input: FilterNode, param?: string) =>
      withFilterInUrl(baseUrl, input, param ?? 'filter'),
  };
}
