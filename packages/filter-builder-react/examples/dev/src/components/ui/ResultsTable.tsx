import * as React from 'react';
import { Card } from './Card';

type ResultsTableProps = {
  title?: string;
  rows: Array<Record<string, unknown>>;
  columns: string[];
  validationMessage?: string | null;
  emptyMessage?: string;
  testId?: string;
};

export const ResultsTable: React.FC<ResultsTableProps> = ({
  title = 'Filtered Results',
  rows,
  columns,
  validationMessage,
  emptyMessage = 'No rows match the current filter.',
  testId,
}) => {
  const hasRows = rows.length > 0;

  return (
    <Card title={title} data-test-id={testId} ariaLabel={title}>
      <div className="overflow-x-auto">
        <table
          className="min-w-full text-sm"
          role="table"
          aria-label="Filtered results"
          data-test-id={testId ? `${testId}__table` : undefined}
        >
          <thead className="bg-gray-50 text-gray-700">
            <tr role="row">
              {columns.map((k) => (
                <th
                  key={k}
                  scope="col"
                  className="px-3 py-2 text-left font-medium"
                  data-test-id={testId ? `${testId}__th-${k}` : undefined}
                >
                  {k}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hasRows &&
              rows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className="border-t"
                  role="row"
                  data-test-id={testId ? `${testId}__row-${rIdx}` : undefined}
                >
                  {columns.map((k) => (
                    <td
                      key={k}
                      className="px-3 py-1"
                      role="cell"
                      data-test-id={testId ? `${testId}__cell-${rIdx}-${k}` : undefined}
                    >
                      {String(row[k] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}

            {!hasRows && validationMessage && (
              <tr className="border-t">
                <td
                  className="px-3 py-2 text-xs text-amber-700"
                  colSpan={columns.length}
                  role="cell"
                  aria-live="polite"
                >
                  {validationMessage}
                </td>
              </tr>
            )}

            {!hasRows && !validationMessage && (
              <tr className="border-t">
                <td
                  className="px-3 py-2 text-xs text-gray-500"
                  colSpan={columns.length}
                  role="cell"
                  aria-live="polite"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
