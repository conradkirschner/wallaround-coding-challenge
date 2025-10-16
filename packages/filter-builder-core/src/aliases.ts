import type { OperatorKey } from './types.js';

/**
 * Canonical mapping of **human-friendly** or **symbolic** operator spellings to our internal
 * operator keys. This allows the library to accept a broader set of inputs (e.g. `"="`, `"!="`,
 * `"is null"`) while keeping the state machine and validation strictly typed against
 * `OperatorKey`.
 *
 * Notes for future maintainers:
 * - Keys are looked up **case-insensitively** by {@link normalizeOperator}, so store them here
 *   in lowercase and let the normalizer `.toLowerCase()` first.
 * - This table is intentionally minimal. Resist the urge to add fuzzy/ambiguous variants
 *   (e.g., `"=<"`). If you introduce a new canonical operator in the schema, model the alias
 *   explicitly here to keep the transformation costs O(1) and predictable.
 */
export const OPERATOR_ALIASES: Record<string, OperatorKey> = {
  '=': 'eq',
  '!=': 'neq',
  'is null': 'is_null',
  'is not null': 'is_not_null',
  before: 'before',
  after: 'after',
};

/**
 * Normalize a user/operator-facing value to a canonical `OperatorKey`.
 *
 * Why this exists:
 * - UX and imported JSON may use symbols (`"="`, `"!="`) or natural language (`"is null"`).
 *   Internally we consistently operate on `OperatorKey` to keep typing, validation, and
 *   serialization deterministic.
 *
 * Design choices:
 * - **Trim + lowercase** before lookup so `"  =  "`, `"Is Null"` all normalize identically.
 * - Falls back to the original `input` when unmapped to preserve forward compatibility:
 *   a future operator key (already canonical) passes through unchanged.
 *
 * Big-O: O(1) hashtable lookup.
 *
 * @param input - Operator text from the UI or deserialized payload.
 * @returns Canonical operator key if known, otherwise the original string.
 *
 * @example
 * normalizeOperator('=')         // 'eq'
 * normalizeOperator('is null')   // 'is_null'
 * normalizeOperator('contains')  // 'contains' (already canonical)
 */
export const normalizeOperator = (input: string): string =>
  OPERATOR_ALIASES[input.trim().toLowerCase()] ?? input;

/**
 * Convert a canonical operator key back to its **symbolic** representation when we serialize
 * to the *target* JSON format or construct GET query parameters. This is intentionally narrow:
 * we only denormalize `eq` → `"="` and `neq` → `"!="` per the challenge’s wire format, and leave
 * all other operators as-is to avoid lossy transformations.
 *
 * Rationale:
 * - The server examples use `"="`/`"!="` symbols. Emitting those for equality semantics makes
 *   payloads compact and familiar while keeping the rest of the operators readable.
 * - Being selective prevents surprising changes like turning `'contains'` into something
 *   non-standard for different backends.
 *
 * Big-O: O(1).
 *
 * @param key - Canonical operator key (typically validated upstream).
 * @returns `"="` for `eq`, `"!="` for `neq`, otherwise the original key.
 *
 * @example
 * denormalizeOperator('eq')    // '='
 * denormalizeOperator('neq')   // '!='
 * denormalizeOperator('gt')    // 'gt'
 */
export const denormalizeOperator = (key: string): string =>
  key === 'eq' ? '=' : key === 'neq' ? '!=' : key;
