import * as React from 'react';

export type TextInputProps = {
  id?: string;
  value: string;
  onChange: (next: string) => void;
  'aria-label'?: string;
};
export const TextInput: React.FC<TextInputProps> = ({ id, value, onChange, ...rest }) => (
  <input
    id={id}
    type="text"
    className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring focus:ring-indigo-500"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    {...rest}
  />
);

export type NumberInputProps = {
  id?: string;
  value: number | '';
  onChange: (next: number | '') => void;
  'aria-label'?: string;
};
export const NumberInput: React.FC<NumberInputProps> = ({ id, value, onChange, ...rest }) => (
  <input
    id={id}
    type="number"
    className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring focus:ring-indigo-500"
    value={value}
    onChange={(e) => {
      const raw = e.target.value;
      onChange(raw === '' ? '' : Number(raw));
    }}
    {...rest}
  />
);

export type CheckboxInputProps = {
  id?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  'aria-label'?: string;
};
export const CheckboxInput: React.FC<CheckboxInputProps> = ({ id, checked, onChange, ...rest }) => (
  <input
    id={id}
    type="checkbox"
    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
    checked={checked}
    onChange={(e) => onChange(e.target.checked)}
    {...rest}
  />
);

export type DateInputProps = {
  id?: string;
  value: string;
  onChange: (next: string) => void;
  'aria-label'?: string;
};
export const DateInput: React.FC<DateInputProps> = ({ id, value, onChange, ...rest }) => (
  <input
    id={id}
    type="date"
    className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring focus:ring-indigo-500"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    {...rest}
  />
);

export type ValueInputRegistry = {
  string: React.ComponentType<TextInputProps>;
  number: React.ComponentType<NumberInputProps>;
  boolean: React.ComponentType<CheckboxInputProps>;
  date: React.ComponentType<DateInputProps>;
};

export const defaultInputs: ValueInputRegistry = {
  string: TextInput,
  number: NumberInput,
  boolean: (props: any) => {
    const Comp = CheckboxInput as React.ComponentType<CheckboxInputProps>;
    return <Comp {...props} />;
  },
  date: DateInput
};

export function getInputComponent<T extends keyof ValueInputRegistry>(
  registry: ValueInputRegistry | undefined,
  type: T
): ValueInputRegistry[T] {
  const source = registry ?? defaultInputs;
  return source[type];
}
