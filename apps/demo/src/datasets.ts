import { createSchema, createFilterApi } from 'filter-builder-core';

const operatorMap = {
  string: ['eq','neq','contains','starts_with','ends_with','in','is_null','is_not_null'],
  number: ['eq','neq','gt','lt','between'],
  boolean: ['eq','neq'],
  date: ['eq','neq','before','after','between']
} as const;

export const userApi = createFilterApi(createSchema(
  [
    { key: 'role', label: 'Role', type: 'string', options: [
      { value: 'admin', label: 'Admin' },
      { value: 'editor', label: 'Editor' },
      { value: 'viewer', label: 'Viewer' }
    ] },
    { key: 'age', label: 'Age', type: 'number' },
    { key: 'joined', label: 'Joined', type: 'date' },
    { key: 'isActive', label: 'Active', type: 'boolean' }
  ],
  operatorMap
));

export const productApi = createFilterApi(createSchema(
  [
    { key: 'title', label: 'Title', type: 'string' },
    { key: 'price', label: 'Price', type: 'number' },
    { key: 'released', label: 'Released', type: 'date' },
    { key: 'inStock', label: 'In stock', type: 'boolean' }
  ],
  operatorMap
));
