import { createSchema, type Schema, type FilterNode } from 'filter-builder-core';
import { COMMON_OPS } from './common';
import type { DemoPreset } from './types';

export const PRODUCTS_FIELDS: Schema['fields'] = [
  { key: 'id', label: 'ID', type: 'number' },
  { key: 'name', label: 'Name', type: 'string' },
  {
    key: 'category',
    label: 'Category',
    type: 'string',
    options: [
      { value: 'furniture', label: 'Furniture' },
      { value: 'books', label: 'Books' },
      { value: 'electronics', label: 'Electronics' },
    ],
  },
  { key: 'price', label: 'Price', type: 'number' },
  { key: 'inStock', label: 'In stock', type: 'boolean' },
  { key: 'createdAt', label: 'Created', type: 'date' },
];

export const PRODUCTS_ROWS: Array<Record<string, unknown>> = [
  {
    id: 101,
    name: 'Chair',
    category: 'furniture',
    price: 49.99,
    inStock: true,
    createdAt: '2024-01-10',
  },
  {
    id: 102,
    name: 'Desk',
    category: 'furniture',
    price: 179.0,
    inStock: false,
    createdAt: '2024-02-02',
  },
  {
    id: 103,
    name: 'Novel',
    category: 'books',
    price: 12.5,
    inStock: true,
    createdAt: '2023-09-18',
  },
  {
    id: 104,
    name: 'Laptop',
    category: 'electronics',
    price: 899,
    inStock: true,
    createdAt: '2024-03-01',
  },
  {
    id: 105,
    name: 'Monitor',
    category: 'electronics',
    price: 229,
    inStock: false,
    createdAt: '2023-12-11',
  },
];

export const PRODUCTS_DEFAULT_TREE: FilterNode = {
  and: [
    { field: 'price', operator: 'between', value: [50, 1000] },
    { field: 'inStock', operator: 'eq', value: true },
  ],
};

export const PRODUCTS_SCHEMA: Schema = createSchema(PRODUCTS_FIELDS, COMMON_OPS);

export const PRODUCTS_PRESET: DemoPreset = {
  id: 'products',
  label: 'Products',
  fields: PRODUCTS_FIELDS,
  operatorMap: COMMON_OPS,
  schema: PRODUCTS_SCHEMA,
  rows: PRODUCTS_ROWS,
  defaultTree: PRODUCTS_DEFAULT_TREE,
};
