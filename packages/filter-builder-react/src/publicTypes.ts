import type { FilterNode } from 'filter-builder-core';
import type { FilterApi } from 'filter-builder-core';

export type TransportMode = 'get' | 'post';
export interface TransportConfig { mode: TransportMode; baseUrl?: string; queryParam?: string; }
export interface EmitPayload { target: FilterNode; queryString: string; method: 'GET' | 'POST'; url?: string; body?: unknown; }

export interface FilterBuilderProps {
  core: FilterApi;
  initialFilter?: FilterNode;
  transport?: TransportConfig;
  onEmit?: (payload: EmitPayload) => void;
  'aria-label'?: string;
}
