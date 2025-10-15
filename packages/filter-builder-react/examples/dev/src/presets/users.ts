import { createSchema, type Schema, type FilterNode } from 'filter-builder-core';
import { COMMON_OPS } from './common';
import type { DemoPreset } from './types';

export const USERS_FIELDS: Schema['fields'] = [
    { key: 'id', label: 'ID', type: 'number' },
    { key: 'name', label: 'Name', type: 'string' },
    {
        key: 'role',
        label: 'Role',
        type: 'string',
        options: [
            { value: 'admin', label: 'Admin' },
            { value: 'editor', label: 'Editor' },
            { value: 'viewer', label: 'Viewer' },
        ],
    },
    { key: 'age', label: 'Age', type: 'number' },
    {
        key: 'country',
        label: 'Country',
        type: 'string',
        options: [
            { value: 'de', label: 'Germany' },
            { value: 'us', label: 'United States' },
            { value: 'gb', label: 'United Kingdom' },
            { value: 'fr', label: 'France' },
        ],
    },
    { key: 'isActive', label: 'Active', type: 'boolean' },
    { key: 'joined', label: 'Joined', type: 'date' },
];

export const USERS_ROWS: Array<Record<string, unknown>> = [
    { id: 1, name: 'Alice',  role: 'admin',     age: 31, country: 'de', isActive: true,  joined: '2021-01-05' },
    { id: 2, name: 'Bob',    role: 'editor',    age: 26, country: 'us', isActive: false, joined: '2020-07-22' },
    { id: 3, name: 'Cara',   role: 'viewer',    age: 42, country: 'gb', isActive: true,  joined: '2019-11-13' },
    { id: 4, name: 'Dieter', role: 'admin',     age: 29, country: 'de', isActive: true,  joined: '2023-03-18' },
    { id: 5, name: 'Eve',    role: 'editor',    age: 35, country: 'fr', isActive: false, joined: '2022-09-09' },
];

export const USERS_DEFAULT_TREE: FilterNode = {
    and: [
        { field: 'age', operator: 'gt', value: 25 },
        {
            or: [
                { field: 'role', operator: 'eq', value: 'admin' },
                { field: 'isActive', operator: 'eq', value: true },
            ],
        },
    ],
};

export const USERS_SCHEMA: Schema = createSchema(USERS_FIELDS, COMMON_OPS);

export const USERS_PRESET: DemoPreset = {
    id: 'users',
    label: 'Users',
    fields: USERS_FIELDS,
    operatorMap: COMMON_OPS,
    schema: USERS_SCHEMA,
    rows: USERS_ROWS,
    defaultTree: USERS_DEFAULT_TREE,
};
