// tests/filter-builder.react.test.tsx
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterBuilder } from '../src/components/FilterBuilder';
import type { FilterNode, Schema } from 'filter-builder-core';

const schema: Schema = {
  fields: [
    { key: 'age', label: 'Age', type: 'number' },
    { key: 'role', label: 'Role', type: 'string' },
    { key: 'active', label: 'Active', type: 'boolean' }
  ],
  operators: [
    { key: 'eq', label: 'Equals', valueArity: 'one', supportedTypes: ['string','number','boolean','date'] },
    { key: 'gt', label: 'Greater', valueArity: 'one', supportedTypes: ['number'] },
    { key: 'in', label: 'In', valueArity: 'many', supportedTypes: ['string','number'] }
  ],
  operatorMap: {
    string: ['eq','in'],
    number: ['eq','gt','in'],
    boolean: ['eq'],
    date: ['eq']
  }
};

describe('FilterBuilder (React)', () => {
  it('renders a condition and allows changing field/operator/value', () => {
    const initial: FilterNode = { field: 'role', operator: 'eq', value: 'admin' };
    render(<FilterBuilder schema={schema} initial={initial} />);
    expect(screen.getByRole('group', { name: /condition/i })).toBeInTheDocument();

    const fieldSel = screen.getByLabelText('field') as HTMLSelectElement;
    fireEvent.change(fieldSel, { target: { value: 'age' } });

    const opSel = screen.getByLabelText('operator') as HTMLSelectElement;
    fireEvent.change(opSel, { target: { value: 'gt' } });

    const valueInput = screen.getByLabelText('value') as HTMLInputElement;
    fireEvent.change(valueInput, { target: { value: '30' } });

    expect(valueInput.value).toBe('30');
  });

  it('GET submit emits composed URL', () => {
    const onSubmit = vi.fn();
    const initial: FilterNode = { field: 'role', operator: 'eq', value: 'admin' };
    render(<FilterBuilder schema={schema} initial={initial} submit={{ mode: 'GET', url: '/search', queryParam: 'f' }} onSubmit={onSubmit} />);
    screen.getByRole('button', { name: /submit filters/i }).click();
    const arg = onSubmit.mock.calls[0][0];
    expect(arg.mode).toBe('GET');
    expect(String(arg.url)).toContain('/search?f=');
  });

  it('POST submit emits JSON body', () => {
    const onSubmit = vi.fn();
    const initial: FilterNode = { field: 'role', operator: 'eq', value: 'admin' };
    render(<FilterBuilder schema={schema} initial={initial} submit={{ mode: 'POST', url: '/api/search' }} onSubmit={onSubmit} />);
    screen.getByRole('button', { name: /submit filters/i }).click();
    const arg = onSubmit.mock.calls[0][0];
    expect(arg.mode).toBe('POST');
    expect(arg.body).toContain('"field":"role"');
  });
});
