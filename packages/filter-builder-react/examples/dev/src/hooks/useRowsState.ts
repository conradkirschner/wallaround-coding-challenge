import * as React from 'react';
import { safeParseJSON, pretty } from '../utils/json';

export function useRowsState(initialRows: Array<Record<string, unknown>>) {
  const [rows, setRows] = React.useState(initialRows);
  const [rowsDraft, setRowsDraft] = React.useState(() => pretty(initialRows));
  const [rowsError, setRowsError] = React.useState<string | null>(null);

  React.useEffect(() => setRowsDraft(pretty(rows)), [rows]);

  const applyRows = () => {
    const parsed = safeParseJSON<unknown>(rowsDraft);
    if (!parsed.ok) return setRowsError(parsed.error);
    if (!Array.isArray(parsed.value)) return setRowsError('Rows JSON must be an array of objects.');
    if (!parsed.value.every((x) => typeof x === 'object' && x !== null)) {
      return setRowsError('Each item in Rows JSON must be an object.');
    }
    setRowsError(null);
    setRows(parsed.value as Array<Record<string, unknown>>);
    setRowsDraft(pretty(parsed.value));
  };

  return { rows, setRows, rowsDraft, setRowsDraft, rowsError, applyRows };
}
