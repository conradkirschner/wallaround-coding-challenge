import * as React from 'react';
import type { Schema, Field, OperatorDef, FilterNode } from 'filter-builder-core';
import { getInputComponent, type ValueInputRegistry } from '../inputs/registry';

function isCondition(n: FilterNode): n is { field: string; operator: string; value?: unknown } {
  return 'field' in n && 'operator' in n;
}

const noop = () => {};

export type ValueEditorProps = {
  id?: string;
  schema: Schema;
  field: Field;
  operator: OperatorDef;
  value: unknown;
  onChange: (next: unknown) => void;
  inputs?: Partial<ValueInputRegistry>;
};

export const ValueEditor: React.FC<ValueEditorProps> = ({
  id,
  schema,
  field,
  operator,
  value,
  onChange,
  inputs
}) => {
  // Short-circuit for 'none' arity
  if (operator.valueArity === 'none') {
    return <span className="text-gray-500 text-sm">No value</span>;
  }

  // Options-driven select/multi-select
  const options = field.options ?? [];

  // Registry wiring
  const registry = { ...inputs } as ValueInputRegistry;
  const Text = getInputComponent(registry, 'string');
  const NumberInput = getInputComponent(registry, 'number');
  const Checkbox = getInputComponent(registry, 'boolean');
  const DateInput = getInputComponent(registry, 'date');

  const commonLabel = (label: string, controlId: string) => (
    <label htmlFor={controlId} className="block text-xs font-medium text-gray-700 sr-only">
      {label}
    </label>
  );

  if (operator.valueArity === 'one') {
    if (field.type === 'boolean') {
      const checked = Boolean(value);
      return (
        <div className="flex items-center gap-2">
          {commonLabel(`${field.label} value`, id ?? `${field.key}-bool`)}
          <Checkbox id={id ?? `${field.key}-bool`} checked={checked} onChange={onChange as any} aria-label={`${field.label} value`} />
        </div>
      );
    }
    if (options.length > 0) {
      const str = String(value ?? '');
      return (
        <div className="min-w-[12rem]">
          {commonLabel(`${field.label} value`, id ?? `${field.key}-sel`)}
          <select
            id={id ?? `${field.key}-sel`}
            aria-label={`${field.label} value`}
            className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm bg-white"
            value={str}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">—</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (field.type === 'number') {
      const num = typeof value === 'number' ? value : '';
      return (
        <div className="min-w-[10rem]">
          {commonLabel(`${field.label} value`, id ?? `${field.key}-num`)}
          <NumberInput id={id ?? `${field.key}-num`} value={num} onChange={onChange as any} aria-label={`${field.label} value`} />
        </div>
      );
    }

    if (field.type === 'date') {
      const d = typeof value === 'string' ? value : '';
      return (
        <div className="min-w-[12rem]">
          {commonLabel(`${field.label} value`, id ?? `${field.key}-date`)}
          <DateInput id={id ?? `${field.key}-date`} value={d} onChange={onChange as any} aria-label={`${field.label} value`} />
        </div>
      );
    }

    const str = String(value ?? '');
    return (
      <div className="min-w-[12rem]">
        {commonLabel(`${field.label} value`, id ?? `${field.key}-txt`)}
        <Text id={id ?? `${field.key}-txt`} value={str} onChange={onChange as any} aria-label={`${field.label} value`} />
      </div>
    );
  }

  if (operator.valueArity === 'two') {
    const a = Array.isArray(value) ? value[0] : '';
    const b = Array.isArray(value) ? value[1] : '';
    const setAt = (idx: 0 | 1, v: unknown) => {
      const next = Array.isArray(value) ? [...value] : ['', ''];
      next[idx] = v;
      onChange(next);
    };
    const InputA =
      field.type === 'number' ? (
        <NumberInput id={`${id}-a`} value={typeof a === 'number' ? a : ''} onChange={(v: number | '') => setAt(0, v)} aria-label={`${field.label} from`} />
      ) : field.type === 'date' ? (
        <DateInput id={`${id}-a`} value={typeof a === 'string' ? a : ''} onChange={(v: string) => setAt(0, v)} aria-label={`${field.label} from`} />
      ) : (
        <Text id={`${id}-a`} value={String(a ?? '')} onChange={(v: string) => setAt(0, v)} aria-label={`${field.label} from`} />
      );

    const InputB =
      field.type === 'number' ? (
        <NumberInput id={`${id}-b`} value={typeof b === 'number' ? b : ''} onChange={(v: number | '') => setAt(1, v)} aria-label={`${field.label} to`} />
      ) : field.type === 'date' ? (
        <DateInput id={`${id}-b`} value={typeof b === 'string' ? b : ''} onChange={(v: string) => setAt(1, v)} aria-label={`${field.label} to`} />
      ) : (
        <Text id={`${id}-b`} value={String(b ?? '')} onChange={(v: string) => setAt(1, v)} aria-label={`${field.label} to`} />
      );

    return <div className="flex items-center gap-2">{InputA}<span className="text-xs text-gray-500">to</span>{InputB}</div>;
  }

  // many
  if (options.length > 0) {
    const arr = Array.isArray(value) ? (value as string[]) : [];
    const toggle = (val: string) => {
      const has = arr.includes(val);
      const next = has ? arr.filter((x) => x !== val) : [...arr, val];
      onChange(next);
    };
    return (
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <label key={opt.value} className="inline-flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              checked={arr.includes(opt.value)}
              onChange={() => toggle(opt.value)}
              aria-label={opt.label}
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    );
  }
  const csv = Array.isArray(value) ? (value as unknown[]).join(',') : '';
  return (
    <textarea
      id={id ?? `${field.key}-csv`}
      className="w-full min-w-[16rem] rounded-md border border-gray-300 px-2 py-1 text-sm"
      placeholder="Comma-separated values"
      value={csv}
      onChange={(e) => onChange(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
      aria-label={`${field.label} values`}
      rows={2}
    />
  );
};
