// scripts/generate-filter-queries.ts
import 'reflect-metadata';
import 'dotenv/config'

import path from 'node:path';
import { mkdirSync, readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

import {
    getFilterableMetadata,
    getFilterableRelationsMeta,
    type FilterableMap,
    type RelationMeta,
} from '../src/filtering/filterable';
import { getSelectableFields } from '../src/filtering/expose';
import {sqlCaps} from "./knex/bootstrap.sql";

type Ctor<T = unknown> = new (...args: never[]) => T;

const PKG_ROOT   = process.cwd();
const HYGEN_ROOT = PKG_ROOT;
const DOMAIN_DIR = path.join(PKG_ROOT, 'src', 'domain');
const OUT_ABS    = path.join(PKG_ROOT, 'src', 'generated');

const BUILDERS = (process.env.FILTER_BUILDERS ?? 'mikroorm,prisma')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean) as Array<'mikroorm' | 'prisma' | 'knex'>;

const DEBUG = process.env.DEBUG_FILTER_CODEGEN === '1' || process.env.DEBUG_FILTER_CODEGEN === 'true';
const log = (...a: unknown[]) => { if (DEBUG) console.log('[filter-codegen]', ...a); };

function assertTemplates(builder: string) {
    const dir = path.join(HYGEN_ROOT, '_templates', 'filter-query', builder);
    if (!existsSync(dir) || !statSync(dir).isDirectory()) {
        throw new Error(`Missing templates for "${builder}" at ${dir}`);
    }
}

/** Recursively find *.entity.ts / *.entity.js */
function walkEntityFiles(dir: string, out: string[] = []): string[] {
    if (!existsSync(dir)) return out;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walkEntityFiles(full, out);
        else if (/\.entity\.(t|j)s$/.test(entry.name)) out.push(full);
    }
    return out;
}

/** Try to import a module and return exported class constructors */
async function importEntityModule(fileAbs: string): Promise<Ctor[]> {
    try {
        const mod = await import(pathToFileURL(fileAbs).href);
        const ctors: Ctor[] = [];
        for (const [, v] of Object.entries(mod)) {
            if (typeof v === 'function' && v.prototype && v.prototype.constructor === v) {
                ctors.push(v as Ctor);
            }
        }
        return ctors;
    } catch (e) {
        log(`warn: failed to import ${fileAbs}:`, e);
        return [];
    }
}

async function scanDomainEntities(): Promise<Ctor[]> {
    const files = walkEntityFiles(DOMAIN_DIR);
    log('scan files:', files.map((f) => path.relative(PKG_ROOT, f)));
    const found: Ctor[] = [];
    for (const file of files) {
        const ctors = await importEntityModule(file);
        if (ctors.length) {
            log('module classes:', path.relative(PKG_ROOT, file), '->', ctors.map((c) => c.name));
            found.push(...ctors);
        }
    }
    return Array.from(new Set(found));
}

/** Wrap hygen spawn */
function runHygen(action: string, params: Record<string, string>) {
    const cmd  = process.platform === 'win32' ? 'hygen.cmd' : 'hygen';
    const args = ['filter-query', action, ...Object.entries(params).flatMap(([k, v]) => [`--${k}`, v])];
    log('spawn:', cmd, args.join(' '), 'cwd=', HYGEN_ROOT);
    const res = spawnSync(cmd, args, { stdio: 'inherit', cwd: HYGEN_ROOT, env: process.env });
    if (res.status !== 0) throw new Error(`Hygen failed: filter-query ${action}`);
}

/** shared: derive selects & relation roots from decorators + filterable meta */
function deriveSelectsAndRelations(
    ctor: Ctor,
    meta: Readonly<FilterableMap>,
): { selects: string[]; relations: string[] } {
    const selectable = getSelectableFields(ctor);
    const topLevelSelectable = Array.isArray(selectable) ? selectable : Array.from(selectable as ReadonlySet<string>);
    const dotted = Object.keys(meta).filter((k) => k.includes('.'));

    const relationRoots = Array.from(
        new Set(
            dotted
                .map((k) => k.slice(0, k.indexOf('.')))
                .filter((root) => topLevelSelectable.includes(root)),
        ),
    );

    const all = Array.from(new Set([...topLevelSelectable, ...dotted, ...relationRoots]));
    return { selects: all.sort(), relations: relationRoots.sort() };
}

/** Per-ORM index: re-export safe, entity-specific symbols */
function writeOrmIndex(dirAbs: string, entityNames: string[]) {
    const lines: string[] = [];
    lines.push('// AUTO-GENERATED FILE — per-ORM barrel with safe, entity-specific exports only.\n');

    for (const entity of entityNames.sort()) {
        const resolverPath = `./${entity}Resolver`;
        lines.push(`export { resolve${entity} } from '${resolverPath}';`);
        // Types (align with your templates)
        lines.push(`export type { ${entity}SelectField as ${entity}SelectField } from '${resolverPath}';`);
        lines.push(`export type { ${entity}RelationRoot as ${entity}RelationRoot } from '${resolverPath}';`);
        lines.push(`export type { ${entity}ResolveOptions as ${entity}ResolveOptions } from '${resolverPath}';`);
    }

    writeFileSync(path.join(dirAbs, 'index.ts'), lines.join('\n') + '\n', 'utf8');
}

/** Top-level index: expose builder namespaces */
function writeTopLevelIndex(buildersPresent: string[]) {
    const lines: string[] = [];
    lines.push('// AUTO-GENERATED FILE — top-level barrel exporting per-ORM namespaces.\n');
    for (const b of buildersPresent.sort()) {
        lines.push(`export * as ${b} from './${b}';`);
    }
    writeFileSync(path.join(OUT_ABS, 'index.ts'), lines.join('\n') + '\n', 'utf8');
}

/** Best-effort dynamic import for a bootstrap module exporting `sqlCtx` */
async function loadSqlBootstrap(sqlBootstrapPath?: string): Promise<{ db: any; caps: any }> {
    const candidates = [
        sqlBootstrapPath,                                                // explicit via env
        path.join(PKG_ROOT, 'app', 'bootstrap', 'sql.ts'),              // TS source default
        path.join(PKG_ROOT, 'app', 'bootstrap', 'sql.js'),              // JS build default
    ].filter(Boolean) as string[];

    let lastErr: unknown;
    for (const p of candidates) {
        try {
            const mod = await import(pathToFileURL(p).href);
            // Prefer a dedicated context if present…
            const ctx =
                mod?.sqlCtx ??
                mod?.default?.sqlCtx ??
                mod?.default ??
                mod;

            // Try multiple common shapes for db/knex and caps
            const db =
                ctx?.knex ??
                ctx?.db ??
                ctx?.client ??
                mod?.db ??
                mod?.knex ??
                mod?.client;

            const caps =
                // inside ctx
                ctx?.caps ??
                ctx?.capabilities ??
                ctx?.mapping ??
                // top-level exports (your bootstrap uses `export const sqlCaps = …`)
                mod?.sqlCaps ??
                mod?.caps ??
                mod?.capabilities ??
                mod?.mapping ??
                mod?.default?.sqlCaps ??
                mod?.default?.caps;
            console.log('asdasdhere', db, caps);
            if (!db || !caps) {
                lastErr = new Error(`Module loaded but missing "sqlCtx.{knex, caps}" — file: ${p}`);
                continue;
            }
            return { db, caps };
        } catch (e) {
            lastErr = e;
        }
    }
console.info('tried to load', sqlBootstrapPath)
    const hint = [
        'The Knex builder expects a bootstrap that exports `sqlCtx = knexCtx(db, caps)`.',
        'Default location: app/bootstrap/sql.ts (override with FILTER_SQL_BOOTSTRAP).',
    ].join(' ');
    throw new Error(`[filter-codegen] Unable to load SQL bootstrap. ${hint}\nLast error: ${String(lastErr)}`);
}

async function main() {
    // 1) ensure templates & output
    for (const b of BUILDERS) assertTemplates(b);
    mkdirSync(OUT_ABS, { recursive: true });

    // 2) gather entities from domain scan (ORM-agnostic)
    const all = await scanDomainEntities();
    if (!all.length) {
        console.warn('[filter-codegen] No entity classes discovered.');
        return;
    }

    // 3) filter by presence of @Filterable metadata
    const selected: Array<{ ctor: Ctor; name: string; meta: FilterableMap; relMeta: RelationMeta }> = [];
    for (const ctor of all) {
        const meta = getFilterableMetadata(ctor);
        if (Object.keys(meta).length) {
            selected.push({ ctor, name: ctor.name, meta, relMeta: getFilterableRelationsMeta(ctor) });
        } else {
            log(`skip entity "${ctor.name}" -> no @Filterable fields`);
        }
    }

    if (!selected.length) {
        console.warn('[filter-codegen] No entities with @Filterable fields. Nothing to do.');
        return;
    }

    const buildersWithOutput = new Set<string>();

    // Pre-load shared resources for Knex builder only when needed
    let knexEnv: { db: any; caps: any } | null = null;
    const wantsKnex = BUILDERS.includes('knex');
    if (wantsKnex) {
        const bootstrapOverride = process.env.FILTER_SQL_BOOTSTRAP; // absolute or relative path
        console.info('Overriding Bootstrap file for knex -> ' + bootstrapOverride)
        knexEnv = await loadSqlBootstrap(bootstrapOverride ? path.resolve(PKG_ROOT, bootstrapOverride) : undefined);
    }

    // 4) generate per entity per builder
    for (const { ctor, name: entity, meta, relMeta } of selected) {
        const { selects, relations } = deriveSelectsAndRelations(ctor, meta);
        const selectsJson     = JSON.stringify(selects);
        const relationsJson   = JSON.stringify(relations);
        const relationsMetaJs = JSON.stringify(relMeta);

        for (const builder of BUILDERS) {
            const outAbs = path.join(OUT_ABS, builder);
            mkdirSync(outAbs, { recursive: true });
            const outRel = path.relative(HYGEN_ROOT, outAbs);

            // Dynamically load builder-specific field generation (no cross-deps!)
            let fields: string;
            if (builder === 'prisma') {
                const { fieldsJsonForPrisma } = await import('./prisma/generator');
                fields = await fieldsJsonForPrisma(entity, meta);
            } else if (builder === 'mikroorm') {
                const { fieldsJsonForMikro } = await import('./microorm/generator');
                fields = await fieldsJsonForMikro(entity, ctor, meta);
            } else if (builder === 'knex') {
                // --- Knex branch (dynamic) ---
                const { fieldsJsonForSql } = await import('./knex/generator');
                if (!knexEnv) {
                    throw new Error('[filter-codegen] Internal error: knex environment not initialized.');
                }
                const { db, caps } = knexEnv;
                fields = await fieldsJsonForSql(entity, ctor, meta, db, caps);
            } else {
                throw new Error(`Unsupported builder "${builder}"`);
            }

            log(
                'run:', builder, 'entity=', entity,
                'fields=', DEBUG ? fields : '(hidden)',
                'selects=', DEBUG ? selectsJson : '(hidden)',
                'relations=', DEBUG ? relationsJson : '(hidden)',
                'relationsMeta=', DEBUG ? relationsMetaJs : '(hidden)',
            );

            runHygen(builder, {
                entity,
                out: outRel,
                fields,
                selects: selectsJson,
                relations: relationsJson,
                relationsMeta: relationsMetaJs, // prisma resolver uses kind + defaultQuantifier
            });

            buildersWithOutput.add(builder);
        }
    }

    // 5) per-ORM barrels with safe exports only
    for (const b of buildersWithOutput) {
        const dirAbs = path.join(OUT_ABS, b);
        const entityNames = readdirSync(dirAbs, { withFileTypes: true })
            .filter((d) => d.isFile() && d.name.endsWith('Resolver.ts'))
            .map((f) => f.name.replace(/Resolver\.ts$/, ''));
        writeOrmIndex(dirAbs, entityNames);
    }

    // 6) top-level barrel (namespaced)
    writeTopLevelIndex(Array.from(buildersWithOutput));

    console.log(`✅ Generated filter query objects at ${OUT_ABS}`);
    process.exit(0); // force exit no matter what is running
}

main().catch((e) => {
    console.error('❌ Codegen failed:', e instanceof Error ? e.message : e);
    process.exit(1);
});
