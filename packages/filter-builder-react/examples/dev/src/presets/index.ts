export { COMMON_OPS } from './common';
export type { DemoPreset, DemoPresetId } from './types';

export { USERS_PRESET, USERS_SCHEMA, USERS_FIELDS, USERS_ROWS, USERS_DEFAULT_TREE } from './users';

export {
  PRODUCTS_PRESET,
  PRODUCTS_SCHEMA,
  PRODUCTS_FIELDS,
  PRODUCTS_ROWS,
  PRODUCTS_DEFAULT_TREE,
} from './products';

// Handy map for lookups in the app:
import type { DemoPreset } from './types';
import { USERS_PRESET } from './users';
import { PRODUCTS_PRESET } from './products';

export const PRESETS: Record<'users' | 'products', DemoPreset> = {
  users: USERS_PRESET,
  products: PRODUCTS_PRESET,
};
