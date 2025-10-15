import type { OperatorMap } from 'filter-builder-core';

export const COMMON_OPS: OperatorMap = {
  string: ['eq', 'neq', 'contains', 'starts_with', 'ends_with', 'in', 'is_null', 'is_not_null'],
  number: ['eq', 'neq', 'gt', 'lt', 'between', 'in', 'is_null', 'is_not_null'],
  boolean: ['eq', 'neq', 'is_null', 'is_not_null'],
  date: ['eq', 'neq', 'before', 'after', 'between', 'is_null', 'is_not_null'],
};
