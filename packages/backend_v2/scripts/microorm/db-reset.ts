// scripts/db-reset.ts
import 'reflect-metadata';
import { mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { MikroORM } from '@mikro-orm/core';
import config from '../../src/mikro-orm.config';

async function main() {
    // Read db path directly from the options (defineConfig result)
    const dbPath = (config as { dbName?: string }).dbName ?? './var/dev.sqlite';

    // Create folder only if it's a file path (not ':memory:')
    if (dbPath !== ':memory:') {
        const dir = dirname(dbPath);
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    }

    const orm = await MikroORM.init(config);
    await orm.schema.refreshDatabase();   // drop+create for dev
    await orm.close(true);
    console.log('✅ DB reset (schema refreshed).');
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
