import * as React from 'react';
import type { ValueType } from 'filter-builder-core';

// Props for each input kind
export type TextInputProps = {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  'aria-label'?: string;
};
export type NumberInputProps = {
  id?: string;
  value: number | '';
  onChange: (v: number | '') => void;
  'aria-label'?: string;
};
export type CheckboxInputProps = {
  id?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  'aria-label'?: string;
};
export type DateInputProps = {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  'aria-label'?: string;
};

export type ValueInputRegistry = {
  string: React.FC<TextInputProps>;
  number: React.FC<NumberInputProps>;
  boolean: React.FC<CheckboxInputProps>;
  date: React.FC<DateInputProps>;
};

// Minimal, accessible Tailwind-styled inputs (can be swapped by consumers)
const TextInput: React.FC<TextInputProps> = ({ id, value, onChange, ...rest }) => (
  <input
    id={id}
    className="w-full rounded-md border px-2 py-1 text-sm"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    {...rest}
  />
);

const NumberInput: React.FC<NumberInputProps> = ({ id, value, onChange, ...rest }) => (
  <input
    id={id}
    type="number"
    className="w-full rounded-md border px-2 py-1 text-sm"
    value={value}
    onChange={(e) => {
      const v = e.target.value;
      onChange(v === '' ? '' : Number.isNaN(Number(v)) ? '' : Number(v));
    }}
    {...rest}
  />
);

const CheckboxInput: React.FC<CheckboxInputProps> = ({ id, checked, onChange, ...rest }) => (
  <input
    id={id}
    type="checkbox"
    className="h-4 w-4 rounded border-gray-300"
    checked={checked}
    onChange={(e) => onChange(e.target.checked)}
    {...rest}
  />
);

const DateInput: React.FC<DateInputProps> = ({ id, value, onChange, ...rest }) => (
  <input
    id={id}
    type="date"
    className="w-full rounded-md border px-2 py-1 text-sm"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    {...rest}
  />
);

// Exported defaults
export const defaultRegistry: ValueInputRegistry = {
  string: TextInput,
  number: NumberInput,
  boolean: CheckboxInput,
  date: DateInput,
};

/** Merge user-provided overrides with our defaults and return a component for the value type. */
export function getInputComponent<T extends ValueType>(
  user: Partial<ValueInputRegistry> | undefined,
  type: T,
) {
  const merged = { ...defaultRegistry, ...(user ?? {}) } as ValueInputRegistry;
  return merged[type];
}
