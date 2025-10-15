import { FILTER_CHANGE_EVENT, type FilterChangeDetail } from './types';

/**
 * Dispatches a strongly-typed CustomEvent with the current filter info.
 * Safe on SSR (no-op if there's no EventTarget).
 */
export function emitFilterChange(detail: FilterChangeDetail, target?: EventTarget | null): void {
  const tgt = target ?? (typeof window !== 'undefined' ? window : null);
  if (!tgt) return;
  const evt: CustomEvent<FilterChangeDetail> = new CustomEvent(FILTER_CHANGE_EVENT, { detail });
  tgt.dispatchEvent(evt);
}
