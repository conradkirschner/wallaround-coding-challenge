import { describe, it, expect } from 'vitest';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterBuilder } from '../src/components/FilterBuilder';
import { createSchema, createFilterApi } from 'filter-builder-core';
import type { EmitPayload } from '../src/publicTypes';
import type { FilterNode } from 'filter-builder-core';

const schema = createSchema(
  [
    { key: 'name', label: 'Name', type: 'string' },
    { key: 'age', label: 'Age', type: 'number' },
    { key: 'active', label: 'Active', type: 'boolean' },
    { key: 'date', label: 'Date', type: 'date' }
  ],
  {
    string: ['eq','neq','contains','starts_with','ends_with','is_null','in'],
    number: ['eq','gt','between'],
    boolean: ['eq','neq'],
    date: ['eq','neq','before','after','between']
  }
);
const core = createFilterApi(schema);

describe('React integration - full coverage', () => {
  it('emits GET and exercises condition UI (one/two/many/none)', () => {
    let last: EmitPayload | null = null;
    render(<FilterBuilder core={core} transport={{ mode: 'get', baseUrl: '/search' }} onEmit={(p) => (last = p)} />);

    // Add a condition
    screen.getByRole('button', { name: /add condition/i }).click();
    expect(last?.method).toBe('GET');

    // Switch field to 'age' (number) then operator to 'between' (two)
    const fieldSelect = screen.getAllByLabelText('Field')[0] as HTMLSelectElement;
    fireEvent.change(fieldSelect, { target: { value: 'age' } });
    const operatorSelect = screen.getAllByLabelText('Operator')[0] as HTMLSelectElement;
    fireEvent.change(operatorSelect, { target: { value: 'between' } });
    // Fill both values
    const inputs = screen.getAllByRole('textbox');
    // there may be no textbox for number; fallback to inputs type number
    const numberInputs = screen.getAllByLabelText(/From|To/);
    fireEvent.change(numberInputs[0], { target: { value: '1' } });
    fireEvent.change(numberInputs[1], { target: { value: '2' } });

    // Switch field to 'name' then operator to 'in' (many)
    fireEvent.change(fieldSelect, { target: { value: 'name' } });
    fireEvent.change(operatorSelect, { target: { value: 'in' } });
    const newVal = screen.getByLabelText('New value') as HTMLInputElement;
    fireEvent.change(newVal, { target: { value: 'Ada' } });
    screen.getByRole('button', { name: /add/i }).click();
    // remove the added value
    screen.getAllByRole('button', { name: '×' })[0].click();

    // Switch operator to 'is_null' (none) and ensure no value field rendered
    fireEvent.change(operatorSelect, { target: { value: 'is_null' } });
    expect(screen.queryByLabelText('Value')).toBeNull();
  });

  it('renders OR group and emits POST', () => {
    let last: EmitPayload | null = null;
    const initial: FilterNode = { or: [{ field: 'active', operator: 'eq', value: true }, { field: 'name', operator: 'eq', value: 'Ada' }] };
    render(<FilterBuilder core={core} initialFilter={initial} transport={{ mode: 'post' }} onEmit={(p) => (last = p)} />);
    expect(last?.method).toBe('POST');
    expect(last?.body).toBeTruthy();
  });
});
