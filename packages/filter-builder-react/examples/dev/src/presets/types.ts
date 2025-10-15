import type { Schema, FilterNode, OperatorMap } from 'filter-builder-core';

export type DemoPresetId = 'users' | 'products';

export type DemoPreset = {
  id: DemoPresetId;
  label: string;
  fields: Schema['fields'];
  operatorMap: OperatorMap;
  schema: Schema;
  rows: Array<Record<string, unknown>>;
  defaultTree: FilterNode;
};
