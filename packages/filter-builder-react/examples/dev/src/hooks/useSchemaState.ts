import * as React from 'react';
import { createSchema, createFilterApi, type Schema, type OperatorMap } from 'filter-builder-core';
import { collectSchemaIssuesWithCore } from '../utils/schema';
import { safeParseJSON, pretty } from '../utils/json';

type Params = { initialSchema: Schema };

export function useSchemaState({ initialSchema }: Params) {
  const [schema, setSchema] = React.useState<Schema>(initialSchema);
  const api = React.useMemo(() => createFilterApi(schema), [schema]);

  // editors
  const [fieldsDraft, setFieldsDraft] = React.useState(() => pretty(schema.fields));
  const [opsDraft, setOpsDraft] = React.useState(() => pretty(schema.operatorMap));
  const [fieldsError, setFieldsError] = React.useState<string | null>(null);
  const [opsError, setOpsError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setFieldsDraft(pretty(schema.fields));
    setOpsDraft(pretty(schema.operatorMap));
  }, [schema]);

  const applyFields = () => {
    const parsed = safeParseJSON<Schema['fields']>(fieldsDraft);
    if (!parsed.ok) return setFieldsError(parsed.error);
    if (!Array.isArray(parsed.value)) return setFieldsError('Fields JSON must be an array.');
    try {
      const candidate = createSchema(parsed.value, schema.operatorMap as OperatorMap);
      const issues = collectSchemaIssuesWithCore(candidate);
      if (issues.length) return setFieldsError(issues.join('\n'));
      setFieldsError(null);
      setSchema(candidate);
      setFieldsDraft(pretty(candidate.fields));
    } catch (e) {
      setFieldsError(e instanceof Error ? e.message : String(e));
    }
  };

  const applyOps = () => {
    const parsed = safeParseJSON<OperatorMap>(opsDraft);
    if (!parsed.ok) return setOpsError(parsed.error);
    try {
      const candidate = createSchema(schema.fields, parsed.value);
      const issues = collectSchemaIssuesWithCore(candidate);
      if (issues.length) return setOpsError(issues.join('\n'));
      setOpsError(null);
      setSchema(candidate);
      setOpsDraft(pretty(candidate.operatorMap));
    } catch (e) {
      setOpsError(e instanceof Error ? e.message : String(e));
    }
  };

  return {
    schema,
    api,
    fieldsDraft,
    setFieldsDraft,
    fieldsError,
    applyFields,
    opsDraft,
    setOpsDraft,
    opsError,
    applyOps,
    setSchema,
  };
}
