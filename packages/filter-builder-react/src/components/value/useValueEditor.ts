import * as React from 'react';
import type { Schema, Field, OperatorDef } from 'filter-builder-core';
import type { RegistryMap, PartialRegistryMap } from './types';
import { fieldOptions, parseCsv, toCsv, toggleInStringArray } from './helpers';
import { getInputComponent } from '../inputs/registry';

/** Map registry generics to a strongly-typed local map. */
function getTypedInput<K extends keyof RegistryMap>(
  registry: PartialRegistryMap,
  kind: K,
): RegistryMap[K] {
  return getInputComponent(registry as any, kind as any) as unknown as RegistryMap[K];
}

export type OneHandlers =
  | {
      mode: 'boolean';
      Checkbox: RegistryMap['boolean'];
      checked: boolean;
      onBool: (next: boolean) => void;
      controlId: string;
      ariaLabel: string;
    }
  | {
      mode: 'select';
      options: ReadonlyArray<{ value: string; label: string }>;
      value: string;
      onSelect: (next: string) => void;
      controlId: string;
      ariaLabel: string;
    }
  | {
      mode: 'number';
      NumberInput: RegistryMap['number'];
      value: number | '';
      onNumber: (next: number | '') => void;
      controlId: string;
      ariaLabel: string;
    }
  | {
      mode: 'date';
      DateInput: RegistryMap['date'];
      value: string;
      onDate: (next: string) => void;
      controlId: string;
      ariaLabel: string;
    }
  | {
      mode: 'string';
      Text: RegistryMap['string'];
      value: string;
      onText: (next: string) => void;
      controlId: string;
      ariaLabel: string;
    };

export type TwoHandlers = {
  a: OneHandlers;
  b: OneHandlers;
};

export type ManyHandlers =
  | {
      mode: 'checkboxes';
      options: ReadonlyArray<{ value: string; label: string }>;
      selected: string[];
      onToggle: (v: string) => void;
      ariaLabelBase: string;
    }
  | {
      mode: 'csv';
      csv: string;
      onCsv: (nextCsv: string) => void;
      controlId: string;
      ariaLabel: string;
    };

export type UseValueEditorArgs = {
  id?: string;
  schema: Schema;
  field: Field;
  operator: OperatorDef;
  value: unknown;
  onChange: (next: unknown) => void;
  inputs?: PartialRegistryMap;
};

export type UseValueEditorResult =
  | { arity: 'none' }
  | { arity: 'one'; handlers: OneHandlers }
  | { arity: 'two'; handlers: TwoHandlers }
  | { arity: 'many'; handlers: ManyHandlers };

export function useValueEditor({
  id,
  field,
  operator,
  value,
  onChange,
  inputs = {},
}: UseValueEditorArgs): UseValueEditorResult {
  const uid = React.useId();
  const baseId = id ?? `${field.key}-${uid}`;

  // Resolve registry components once
  const Text = React.useMemo(() => getTypedInput(inputs, 'string'), [inputs]);
  const NumberInput = React.useMemo(() => getTypedInput(inputs, 'number'), [inputs]);
  const Checkbox = React.useMemo(() => getTypedInput(inputs, 'boolean'), [inputs]);
  const DateInput = React.useMemo(() => getTypedInput(inputs, 'date'), [inputs]);

  // ---- NONE -----------------------------------------------------------------
  if (operator.valueArity === 'none') {
    return { arity: 'none' };
  }

  // ---- ONE ------------------------------------------------------------------
  if (operator.valueArity === 'one') {
    const opts = fieldOptions(field);

    if (field.type === 'boolean') {
      const checked = Boolean(value);
      return {
        arity: 'one',
        handlers: {
          mode: 'boolean',
          Checkbox,
          checked,
          onBool: (next) => onChange(next),
          controlId: `${baseId}-bool`,
          ariaLabel: `${field.label} value`,
        },
      };
    }

    if (opts.length > 0) {
      const str = String(value ?? '');
      return {
        arity: 'one',
        handlers: {
          mode: 'select',
          options: opts,
          value: str,
          onSelect: (next) => onChange(next),
          controlId: `${baseId}-select`,
          ariaLabel: `${field.label} value`,
        },
      };
    }

    if (field.type === 'number') {
      const num: number | '' = typeof value === 'number' ? value : '';
      return {
        arity: 'one',
        handlers: {
          mode: 'number',
          NumberInput,
          value: num,
          onNumber: (next) => onChange(next),
          controlId: `${baseId}-num`,
          ariaLabel: `${field.label} value`,
        },
      };
    }

    if (field.type === 'date') {
      const d = typeof value === 'string' ? value : '';
      return {
        arity: 'one',
        handlers: {
          mode: 'date',
          DateInput,
          value: d,
          onDate: (next) => onChange(next),
          controlId: `${baseId}-date`,
          ariaLabel: `${field.label} value`,
        },
      };
    }

    const str = String(value ?? '');
    return {
      arity: 'one',
      handlers: {
        mode: 'string',
        Text,
        value: str,
        onText: (next) => onChange(next),
        controlId: `${baseId}-text`,
        ariaLabel: `${field.label} value`,
      },
    };
  }

  // ---- TWO ------------------------------------------------------------------
  if (operator.valueArity === 'two') {
    const a = Array.isArray(value) ? value[0] : undefined;
    const b = Array.isArray(value) ? value[1] : undefined;

    const mkOne = (slot: 'a' | 'b'): OneHandlers => {
      const suffix = slot === 'a' ? 'from' : 'to';
      if (field.type === 'number') {
        const v: number | '' =
          typeof (slot === 'a' ? a : b) === 'number' ? ((slot === 'a' ? a : b) as number) : '';
        return {
          mode: 'number',
          NumberInput,
          value: v,
          onNumber: (next) => {
            const nextArr: [unknown, unknown] = [
              slot === 'a' ? next : typeof a === 'number' ? a : '',
              slot === 'b' ? next : typeof b === 'number' ? b : '',
            ];
            onChange(nextArr);
          },
          controlId: `${baseId}-${slot}-num`,
          ariaLabel: `${field.label} ${suffix}`,
        };
      }

      if (field.type === 'date') {
        const v = typeof (slot === 'a' ? a : b) === 'string' ? (slot === 'a' ? a : b)! : '';
        return {
          mode: 'date',
          DateInput,
          value: v,
          onDate: (next) => {
            const nextArr: [unknown, unknown] = [
              slot === 'a' ? next : typeof a === 'string' ? a : '',
              slot === 'b' ? next : typeof b === 'string' ? b : '',
            ];
            onChange(nextArr);
          },
          controlId: `${baseId}-${slot}-date`,
          ariaLabel: `${field.label} ${suffix}`,
        };
      }

      const v = String((slot === 'a' ? a : b) ?? '');
      return {
        mode: 'string',
        Text,
        value: v,
        onText: (next) => {
          const nextArr: [unknown, unknown] = [
            slot === 'a' ? next : (a ?? ''),
            slot === 'b' ? next : (b ?? ''),
          ];
          onChange(nextArr);
        },
        controlId: `${baseId}-${slot}-text`,
        ariaLabel: `${field.label} ${suffix}`,
      };
    };

    return { arity: 'two', handlers: { a: mkOne('a'), b: mkOne('b') } };
  }

  // ---- MANY -----------------------------------------------------------------
  const opts = fieldOptions(field);
  if (opts.length > 0) {
    const arr = Array.isArray(value) ? (value as unknown[]).map(String) : [];
    return {
      arity: 'many',
      handlers: {
        mode: 'checkboxes',
        options: opts,
        selected: arr,
        onToggle: (v: string) => onChange(toggleInStringArray(arr, v)),
        ariaLabelBase: field.label,
      },
    };
  }

  return {
    arity: 'many',
    handlers: {
      mode: 'csv',
      csv: toCsv(value),
      onCsv: (csv: string) => onChange(parseCsv(csv)),
      controlId: `${baseId}-csv`,
      ariaLabel: `${field.label} values`,
    },
  };
}
