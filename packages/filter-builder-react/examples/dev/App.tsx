import * as React from 'react';
import { FilterBuilder } from 'filter-builder-react';
import { JsonEditorCard } from './components/ui/JsonEditorCard';
import { Card } from './components/ui/Card';
import { ResultsTable } from './components/ui/ResultsTable';
import { RequestTester } from './components/ui/RequestTester';
import { PRESETS, type DemoPresetId } from './presets';
import { useSchemaState } from './hooks/useSchemaState';
import { useRowsState } from './hooks/useRowsState';
import { useFilterState } from './hooks/useFilterState';
import { useEvaluation } from './hooks/useEvaluation';
import { useRequestTester } from './hooks/useRequestTester';
import {useFilterEmitter} from "./hooks/useFilterEmitter";

export const App: React.FC = () => {
  const initial = PRESETS.users;

  // Smart state
  const schemaState = useSchemaState({ initialSchema: initial.schema });
  const rowsState = useRowsState(initial.rows);
  const filterState = useFilterState(schemaState.api, initial.defaultTree);
  const evalState = useEvaluation(schemaState.schema, filterState.decoded, rowsState.rows);
  const reqState = useRequestTester({ api: evalState.api, encoded: evalState.encoded, setRows: rowsState.setRows });
    useFilterEmitter({
        canonical: filterState.decoded,
        encoded: evalState.encoded,
        queryString: evalState.qp,
        schema: schemaState.schema,
        validation: evalState.validation,
    }, {
        // Optional: also mirror as a React callback, e.g., analytics
        onEmit: (detail) => {
            console.debug('[filter-change]', detail); // keep silent by default
        },
        // target: someIframe.contentWindow, // optional custom target
        dedupe: true,
    });
  // Preset loader
  const loadPreset = (preset: DemoPresetId) => {
    const p = PRESETS[preset];
    schemaState.setSchema(p.schema);
    rowsState.setRows(p.rows);
    filterState.resetCanon(); // let hook resync the canonical JSON
  };

  return (
      <div className="mx-auto max-w-6xl p-4 space-y-6" data-test-id="app-root">
        <h1 className="text-2xl font-semibold" aria-label="Filter Builder Demo">Filter Builder (Demo)</h1>

        <RequestTester
            method={reqState.method}
            onMethodChange={(m) => { reqState.setMethod(m); if (m === 'POST' && !reqState.bodyDirty) reqState.resetBody(); }}
            url={reqState.url}
            onUrlChange={reqState.setUrl}
            body={reqState.bodyDraft}
            onBodyChange={(s) => { reqState.setBodyDirty(true); reqState.setBodyDraft(s); }}
            isBodyDirty={reqState.bodyDirty}
            onResetBody={reqState.resetBody}
            onSend={reqState.send}
            loading={reqState.loading}
            error={reqState.error}
            success={reqState.success}
            getUrlPreview={reqState.getUrlPreview}
            testId="request-tester"
        />

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <JsonEditorCard
              title="Rows JSON"
              value={rowsState.rowsDraft}
              onChange={rowsState.setRowsDraft}
              onApply={rowsState.applyRows}
              error={rowsState.rowsError}
              okLabel="Rows OK"
              testId="rows-editor"
              extraActionsLeft={
                <>
                  <span className="text-[10px] text-gray-500 mr-1" aria-hidden>Presets:</span>
                  <button type="button" onClick={() => loadPreset('users')}
                          className="rounded-md border px-2 py-1 text-[11px] hover:bg-gray-50"
                          aria-label="Load Users preset (schema + rows + filter)" data-test-id="btn-preset-users">Users</button>
                  <button type="button" onClick={() => loadPreset('products')}
                          className="rounded-md border px-2 py-1 text-[11px] hover:bg-gray-50"
                          aria-label="Load Products preset (schema + rows + filter)" data-test-id="btn-preset-products">Products</button>
                </>
              }
          />

          <JsonEditorCard
              title="Fields JSON"
              value={schemaState.fieldsDraft}
              onChange={schemaState.setFieldsDraft}
              onApply={schemaState.applyFields}
              error={schemaState.fieldsError}
              okLabel="Schema fields OK"
              testId="fields-editor"
          />

          <JsonEditorCard
              title="Operator Map JSON"
              value={schemaState.opsDraft}
              onChange={schemaState.setOpsDraft}
              onApply={schemaState.applyOps}
              error={schemaState.opsError}
              okLabel="Operator map OK"
              testId="ops-editor"
          />
        </section>

        <section className="space-y-3">
          <div data-test-id="filter-builder" aria-label="Filter builder">
            <FilterBuilder
                schema={schemaState.schema}
                value={filterState.decoded}
                onChange={filterState.setTree}
                className="bg-white rounded-lg border p-4"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <JsonEditorCard
                title="Canonical JSON (editable)"
                value={filterState.canonDraft}
                onChange={filterState.onCanonChange}
                onApply={filterState.applyCanon}
                onReset={filterState.resetCanon}
                error={filterState.canonError}
                okLabel="Filter JSON OK"
                dirtyHint="Edited — press Apply to see changes"
                isDirty={filterState.canonDirty}
                testId="canonical-editor"
            />

            <Card title="Target JSON" data-test-id="target-json" ariaLabel="Target JSON">
            <pre className="text-xs overflow-auto" aria-label="Target JSON pre">
              {JSON.stringify(evalState.encoded, null, 2)}
            </pre>
            </Card>

            <Card title="GET Query Param" data-test-id="query-param" ariaLabel="GET Query Param">
              <code className="break-words text-xs" aria-label="Query parameter">{evalState.qp}</code>
              <div className="mt-2 text-xs" aria-live="polite">
              <span className={evalState.validation.valid ? 'text-green-700' : 'text-red-700'}
                    data-test-id="validation-summary"
                    aria-label={evalState.validation.valid ? 'Filter valid' : 'Filter invalid'}>
                {evalState.validation.valid ? 'Valid' : 'Invalid'} ({evalState.validation.issues.length} issues)
              </span>
                {!evalState.validation.valid && (
                    <ul className="list-disc ml-5 mt-1" data-test-id="validation-issues">
                      {evalState.validation.issues.map((i, idx) => <li key={idx}>{i}</li>)}
                    </ul>
                )}
              </div>
            </Card>
          </div>
        </section>

        <ResultsTable
            title="Filtered Results"
            rows={evalState.evaluation.rows}
            columns={evalState.columns}
            validationMessage={
              !evalState.validation.valid ? 'Results hidden because current filter is invalid.'
                  : evalState.evaluation.error
            }
            testId="results"
        />
      </div>
  );
};
