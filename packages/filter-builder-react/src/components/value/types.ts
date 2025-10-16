import type * as React from 'react';
import type { ValueInputRegistry } from '../inputs/registry';

/** Minimal prop types we rely on for registry components */
export type StringInput = React.FC<{
  id?: string;
  value: string;
  onChange: (v: string) => void;
  'aria-label'?: string;
}>;

export type NumberInput = React.FC<{
  id?: string;
  value: number | '';
  onChange: (v: number | '') => void;
  'aria-label'?: string;
}>;

export type BooleanInput = React.FC<{
  id?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  'aria-label'?: string;
}>;

export type DateInput = React.FC<{
  id?: string;
  /** ISO date string **/
  value: string;
  onChange: (v: string) => void;
  'aria-label'?: string;
}>;

export type RegistryMap = {
  string: StringInput;
  number: NumberInput;
  boolean: BooleanInput;
  date: DateInput;
};

export type PartialRegistryMap = Partial<ValueInputRegistry>;
