import type { FilterNode, ConditionNode, AndGroupNode, OrGroupNode } from './types';

export const isCondition = (n: FilterNode): n is ConditionNode => 'field' in n;
export const isAndGroup = (n: FilterNode): n is AndGroupNode => 'and' in n;
export const isOrGroup = (n: FilterNode): n is OrGroupNode => 'or' in n;
