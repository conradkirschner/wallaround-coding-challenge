import { decodeTarget, encodeTarget } from './convert';
import type { FilterApi, FilterNode, Schema } from './types';
import { validateNode } from './validate';

/**
 * Build a single URL-safe query string pair for a filter payload.
 *
 * Rationale:
 * - We keep the entire filter as **one** parameter (default: `filter`), JSON-encoded then
 *   `encodeURIComponent`-escaped. This avoids lossy ad-hoc key/value flattening and preserves
 *   full fidelity for nested `and`/`or` groups.
 *
 * Contract:
 * - Accepts a **target**-shape filter (already denormalized, e.g. `eq` → `"="`).
 * - Parameter name is configurable to fit different backends.
 *
 * @param target - Filter in the **target** JSON format.
 * @param param - Querystring key to use (defaults to `"filter"`).
 * @returns A string like: `filter=%7B%22and%22%3A...%7D`
 */
const toQueryParam = (target: FilterNode, param: string = 'filter'): string =>
  `${param}=${encodeURIComponent(JSON.stringify(target))}`;

/**
 * Produce a complete URL with the filter payload appended as a single query parameter.
 *
 * Design notes:
 * - Appends using `'?'` or `'&'` depending on whether `baseUrl` already contains a query.
 * - Leaves routing decisions to the consumer; this helper is intentionally small and pure.
 *
 * @param baseUrl - The base path or absolute URL (e.g. `"/search"`).
 * @param target  - Filter in the **target** JSON format.
 * @param param   - Querystring key to use (defaults to `"filter"`).
 * @returns The composed URL, e.g. `/search?filter=%7B...%7D`
 */
const withFilterInUrl = (baseUrl: string, target: FilterNode, param: string = 'filter'): string =>
  `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${toQueryParam(target, param)}`;

/**
 * Factory for the minimal, explicit **core API** used by the React wrapper and external callers.
 *
 * Responsibilities:
 * - `decode` - Accept **target** JSON, normalize aliases and structure (e.g., `"="` → `eq`,
 *   collapse single-child groups).
 * - `encode` - Convert canonical state back to **target** JSON (e.g., `eq` → `"="`),
 *   preserving the “2+ items = group” rule.
 * - `validate` - Schema-aware checks (field existence, operator type support, value arity).
 * - `toQueryParam` / `withFilterInUrl` - Transport helpers for GET-mode backends.
 *
 * Non-goals:
 * - No global state, no I/O, no fetch; pure functions for testability and portability.
 *
 * @param schema - The validated schema returned by `createSchema`.
 * @returns A `FilterApi` with pure utilities bound to the provided schema.
 */
export function createFilterApi(schema: Schema): FilterApi {
  return {
    schema,
    decode: decodeTarget,
    encode: encodeTarget,
    validate: (input: FilterNode) => validateNode(input, schema),
    toQueryParam: (input: FilterNode, param?: string) => toQueryParam(input, param ?? 'filter'),
    withFilterInUrl: (baseUrl: string, input: FilterNode, param?: string) =>
      withFilterInUrl(baseUrl, input, param ?? 'filter'),
  };
}
