import type { Field } from 'filter-builder-core';

export function parseCsv(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function toCsv(arr: unknown): string {
  return Array.isArray(arr) ? arr.map((v) => String(v ?? '')).join(',') : '';
}

/** Return the field options as a stable readonly array. */
export function fieldOptions(field: Field): ReadonlyArray<{ value: string; label: string }> {
  return field.options ?? [];
}

/** Label builder for a11y. */
export function ariaLabel(label: string, suffix: string) {
  return `${label} ${suffix}`;
}

/** Utility for toggling a string in an array of strings. */
export function toggleInStringArray(arr: string[], value: string): string[] {
  return arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];
}
