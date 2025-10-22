// src/mikro-orm.config.ts
import { defineConfig } from '@mikro-orm/core';
import { SqliteDriver } from '@mikro-orm/sqlite';
import { User, Address, Post } from './domain';
export default defineConfig({
    driver: SqliteDriver,
    dbName: './var/microorm.sqlite',          // file DB under ./var
    entities: [User, Address, Post],
    debug: false,
    migrations: {                        // (optional) you can ignore if you use SchemaGenerator
        path: 'migrations',
        glob: '!(*.d).{js,ts}',
    },
});
