// src/App.tsx
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
import { useFilterEmitter } from './hooks/useFilterEmitter';

export const App: React.FC = () => {
  const initial = PRESETS.users;

  // Smart state
  const schemaState = useSchemaState({ initialSchema: initial.schema });
  const rowsState = useRowsState(initial.rows);
  const filterState = useFilterState(schemaState.api, initial.defaultTree);
  const evalState = useEvaluation(schemaState.schema, filterState.decoded, rowsState.rows);
  const reqState = useRequestTester({
    api: evalState.api,
    encoded: evalState.encoded,
    setRows: rowsState.setRows,
  });

  useFilterEmitter(
    {
      canonical: filterState.decoded,
      encoded: evalState.encoded,
      queryString: evalState.qp,
      schema: schemaState.schema,
      validation: evalState.validation,
    },
    { onEmit: (d) => console.debug('[filter-change]', d), dedupe: true },
  );

  const loadPreset = (preset: DemoPresetId) => {
    const p = PRESETS[preset];
    schemaState.setSchema(p.schema);
    rowsState.setRows(p.rows);
    filterState.resetCanon();
  };

  return (
    <div className="mx-auto max-w-6xl p-4 space-y-8" data-test-id="app-root">
      <h1 className="text-2xl font-semibold" aria-label="Filter Builder Demo">
        Filter Builder (Demo)
      </h1>

      {/* Intro-Banner: rechtlich sauber + SEO-Keywords + GitHub-Link */}
      <section
        className="rounded-lg border bg-amber-50 px-4 py-3 text-amber-900 shadow-sm"
        role="note"
        aria-label="Hinweis: Unabhängiges Projekt zur Coding- Challenge von wallaround.de "
        data-test-id="intro-banner"
      >
        <h2 className="text-base font-semibold">
          Unabhängiges Projekt: Coding- Challenge von{' '}
          <a
            href="https://www.wallaround.de/"
            target="_blank"
            rel="nofollow noopener noreferrer"
            className="underline decoration-dotted underline-offset-4"
          >
            wallaround.de
          </a>
        </h2>
        <p className="mt-1 text-sm">
          Diese React/TypeScript-Demo wurde eigenständig erstellt, basierend auf einer
          <strong> Coding- Challenge</strong> im Bewerbungsprozess für <span className="whitespace-nowrap">wallaround.de </span>.
          Es besteht <strong>keine Kooperation, Beauftragung oder geschäftliche Verbindung</strong> zu wallaround.de .
        </p>
        <p className="mt-1 text-sm">
          <strong>Transparenz:</strong> Umsetzung unter Zeitdruck in ca. <strong>10&nbsp;Stunden</strong>,
          ausdrücklich <strong>nicht für den produktiven Einsatz</strong> vorgesehen.
        </p>
        <p className="mt-1 text-sm">
          <a
            href="https://github.com/conradkirschner/"
            target="_blank"
            rel="me noopener noreferrer"
            className="inline-flex items-center gap-1 underline underline-offset-4"
          >
            Mein GitHub-Profil <span aria-hidden>↗</span>
          </a>
        </p>

        <nav className="mt-2">
          <ul className="list-disc pl-5 text-sm">
            <li><a href="#ueber-dieses-projekt" className="underline underline-offset-4">Über dieses Projekt</a></li>
            <li><a href="#technische-details" className="underline underline-offset-4">Technische Details</a></li>
            <li><a href="#faq" className="underline underline-offset-4">FAQ zur wallaround.de - Challenge</a></li>
            <li><a href="#rechtliches" className="underline underline-offset-4">Rechtliches & Transparenz</a></li>
            <li><a href="#datenschutz" className="underline underline-offset-4">Datenschutzerklärung</a></li>
          </ul>
        </nav>
      </section>

      {/* SEO-Textsektionen */}
      <section id="ueber-dieses-projekt" className="prose max-w-none">
        <h2 className="text-xl font-semibold">Über dieses Projekt</h2>
        <p className="text-sm leading-6">
          Die <strong>Filter Builder Demo</strong> zeigt, wie sich komplexe Filterlogik in modernen Webanwendungen
          nutzerfreundlich abbilden lässt. Für einen Produktiven Einsatz empfehle ich andere Frameworks, diese wurden hier nicht benutzt, da diese nicht den Anforderungen entsprochen haben. {' '}
        </p><p><b>Zum Beispiel - </b>
          <a className="text-blue-600" href="https://www.npmjs.com/package/qs-esm">https://www.npmjs.com/package/qs-esm</a>
      </p><p>     Ausgangspunkt war eine <em>Coding - Challenge</em> aus einem <em>Vorstellungsgespräch</em> für

          <strong> wallaround.de </strong>. Ziel: strukturierte Daten nach kombinierbaren Kriterien filtern, Filter als
          JSON/Query-String/Request-Body nutzen und so Frontend/Backend synchronisieren.
        </p>
        <p className="text-sm leading-6">
          Mehr Projekte auf meinem{' '}
          <a href="https://github.com/conradkirschner/" target="_blank" rel="me noopener noreferrer" className="underline underline-offset-4">
            GitHub-Profil
          </a>.
        </p>
      </section>

      <section id="technische-details" className="prose max-w-none">
        <h2 className="text-xl font-semibold">Technische Details</h2>
        <p className="text-sm leading-6">
          React + TypeScript, deklaratives Schema (Felder/Operatoren/Typen). Erzeugt kanonisches JSON, GET-Query-Param
          und POST-Body. Live-Editoren zeigen Schema/Operatoren/Daten; die Ergebnistabelle illustriert Validierung.
        </p>
      </section>

      <section id="faq" className="prose max-w-none">
        <h2 className="text-xl font-semibold">FAQ zur wallaround.de - Challenge</h2>
        <h3 className="text-base font-semibold">Gibt es eine Verbindung zu wallaround.de ?</h3>
        <p className="text-sm leading-6">Nein, keine Kooperation/Beauftragung/geschäftliche Verbindung.</p>
        <h3 className="text-base font-semibold">Wie viel Zeit?</h3>
        <p className="text-sm leading-6">Ca. 8 Stunden. Nicht produktionsreif.</p>
      </section>

      <section id="rechtliches" className="prose max-w-none">
        <h2 className="text-xl font-semibold">Rechtliches &amp; Transparenz</h2>
        <p className="text-sm leading-6">
          Nominative Nennung von <strong>wallaround</strong> / <strong>wallaround.de </strong> nur zur Einordnung der Aufgabe.
          Alle Kennzeichen gehören den jeweiligen Inhabern. Keine Unternehmenszugehörigkeit behauptet.
        </p>
      </section>

      {/* App UI */}
      <RequestTester
        method={reqState.method}
        onMethodChange={(m) => {
          reqState.setMethod(m);
          if (m === 'POST' && !reqState.bodyDirty) reqState.resetBody();
        }}
        url={reqState.url}
        onUrlChange={reqState.setUrl}
        body={reqState.bodyDraft}
        onBodyChange={(s) => {
          reqState.setBodyDirty(true);
          reqState.setBodyDraft(s);
        }}
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
              <button type="button" onClick={() => loadPreset('users')} className="rounded-md border px-2 py-1 text-[11px] hover:bg-gray-50" data-test-id="btn-preset-users">Users</button>
              <button type="button" onClick={() => loadPreset('products')} className="rounded-md border px-2 py-1 text-[11px] hover:bg-gray-50" data-test-id="btn-preset-products">Products</button>
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
            dirtyHint="Edited - press Apply to see changes"
            isDirty={filterState.canonDirty}
            testId="canonical-editor"
          />

          <Card title="Target JSON" data-test-id="target-json" ariaLabel="Target JSON">
            <pre className="text-xs overflow-auto">{JSON.stringify(evalState.encoded, null, 2)}</pre>
          </Card>

          <Card title="GET Query Param" data-test-id="query-param" ariaLabel="GET Query Param">
            <code className="break-words text-xs">{evalState.qp}</code>
            <div className="mt-2 text-xs" aria-live="polite">
              <span className={evalState.validation.valid ? 'text-green-700' : 'text-red-700'}>
                {evalState.validation.valid ? 'Valid' : 'Invalid'} ({evalState.validation.issues.length} issues)
              </span>
              {!evalState.validation.valid && (
                <ul className="list-disc ml-5 mt-1">
                  {evalState.validation.issues.map((i: string, idx: number) => (<li key={idx}>{i}</li>))}
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
        validationMessage={!evalState.validation.valid ? 'Results hidden because current filter is invalid.' : evalState.evaluation.error}
        testId="results"
      />

      {/* Datenschutzerklärung */}
      <section id="datenschutz" className="prose max-w-none">
        <h2 className="text-xl font-semibold">Datenschutzerklärung</h2>
        <p className="text-sm leading-6">
          Diese Seite ist eine <strong>statische Demo</strong> und dient ausschließlich Portfolio- und Demonstrationszwecken.
          Es erfolgt <strong>keine serverseitige Verarbeitung</strong> personenbezogener Daten durch mich.
        </p>

        <h3 className="text-base font-semibold">Verantwortlicher</h3>
        <p className="text-sm leading-6">
          Conrad Magnus Kirschner - Kontakt über{' '}
          <a
            href="https://github.com/conradkirschner/"
            target="_blank"
            rel="me noopener noreferrer"
            className="underline underline-offset-4"
          >
            GitHub-Profil
          </a>
          .
        </p>

        <h3 className="text-base font-semibold">Zweck, Umfang und Rechtsgrundlage</h3>
        <p className="text-sm leading-6">
          Zweck dieser Website ist die <em>Vorstellung einer Coding- Challenge</em>. Die Anzeige der Seite und
          das Laden statischer Dateien erfolgt zur Wahrung meines berechtigten Interesses an einer
          aussagekräftigen Darstellung meiner Arbeit (Art. 6 Abs. 1 lit. f DSGVO).
        </p>

        <h3 className="text-base font-semibold">Keine Cookies, kein Tracking</h3>
        <p className="text-sm leading-6">
          Es werden <strong>keine Cookies</strong> zu Analyse- oder Marketingzwecken gesetzt und
          <strong> keine externen Tracking-Dienste</strong> eingebunden.
        </p>

        <h3 className="text-base font-semibold">Lokale Verarbeitung im Browser</h3>
        <p className="text-sm leading-6">
          Inhalte wie Filterzustände, Eingaben in JSON-Editoren oder Vorschauen werden
          <strong> ausschließlich im Browser</strong> verarbeitet. Eine Speicherung auf meinem Server
          findet nicht statt.
        </p>

        <h3 className="text-base font-semibold">Request Tester</h3>
        <p className="text-sm leading-6">
          Wenn Sie den <em>Request Tester</em> verwenden, senden Sie Anfragen an eine von Ihnen gewählte URL.
          Für diese Verarbeitung ist der Betreiber der Ziel-URL datenschutzrechtlich verantwortlich.
          Prüfen Sie bitte die Datenschutzhinweise der jeweiligen Zielseite.
        </p>

        <h3 className="text-base font-semibold">Hosting (GitHub Pages)</h3>
        <p className="text-sm leading-6">
          Diese Website wird von <em>GitHub Pages</em> ausgeliefert. Der Hosting-Anbieter kann zur
          Sicherstellung des Betriebs und zur Sicherheit <em>technische Protokolle</em> (z.&nbsp;B. IP-Adresse,
          Zeitpunkt des Zugriffs, User-Agent) verarbeiten. Nähere Informationen entnehmen Sie bitte
          der Datenschutzerklärung von GitHub.
        </p>

        <h3 className="text-base font-semibold">Speicherdauer</h3>
        <p className="text-sm leading-6">
          Durch mich werden auf dieser Seite <strong>keine personenbezogenen Daten gespeichert</strong>.
          Etwaige Protokolldaten beim Hosting-Anbieter unterliegen dessen Löschkonzept.
        </p>

        <h3 className="text-base font-semibold">Ihre Rechte</h3>
        <p className="text-sm leading-6">
          Ihnen stehen die Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung,
          Datenübertragbarkeit sowie Widerspruch zu. Zudem besteht ein Beschwerderecht bei einer
          Datenschutzaufsichtsbehörde. Da ich hier keine personenbezogenen Daten verarbeite,
          sind diese Rechte in der Praxis regelmäßig nicht betroffen.
        </p>

        <p className="text-xs leading-6 opacity-80">
          Stand: {new Date().toLocaleDateString('de-DE')}. Diese Hinweise sind eine vereinfachte Darstellung
          und ersetzen keine Rechtsberatung.
        </p>
      </section>
      <footer className="mt-8 border-t pt-4 text-xs text-gray-600">
        <p>
          © {new Date().getFullYear()} - Eigenständige Coding- Challenge-Demo ( wallaround.de  -Kontext), ~10 Std, nicht produktionsreif.{' '}
          <a href="https://github.com/conradkirschner/" target="_blank" rel="me noopener noreferrer" className="underline underline-offset-4">
            GitHub: conradkirschner
          </a>{' '}
          · <a href="#datenschutz" className="underline underline-offset-4">Datenschutzerklärung</a>
        </p>
      </footer>
    </div>
  );
};
