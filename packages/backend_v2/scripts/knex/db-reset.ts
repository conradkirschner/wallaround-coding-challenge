// scripts/reset-db.ts
import { existsSync, mkdirSync, unlinkSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import knex, { type Knex } from 'knex';

/**
 * If you centralize the DB filename elsewhere, you can read it from there
 * (e.g. env or a small config helper). For now we keep a simple default.
 */
const DB_PATH = process.env.SQLITE_DB_FILE ?? './dev.sqlite';

/** Create the SQLite file’s folder if needed, delete the file if present. */
function recreateDbFile(dbPath: string) {
    if (dbPath !== ':memory:') {
        const abs = resolve(dbPath);
        const dir = dirname(abs);
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
        if (existsSync(abs)) unlinkSync(abs);
    }
}

/** Create tables if they don’t exist — mirrors the schema used in the seed script. */
async function ensureSchema(db: Knex) {
    // Enforce FKs in SQLite
    await db.raw('PRAGMA foreign_keys = ON');

    // addresses
    const hasAddresses = await db.schema.hasTable('addresses');
    if (!hasAddresses) {
        await db.schema.createTable('addresses', (t) => {
            t.increments('id').primary();
            t.text('street1').notNullable();
            t.text('street2').nullable();
            t.text('postal_code').nullable();
            t.text('city').notNullable();
            t.text('country').notNullable();
        });
    }

    // users
    const hasUsers = await db.schema.hasTable('users');
    if (!hasUsers) {
        await db.schema.createTable('users', (t) => {
            t.increments('id').primary();
            t.text('email').notNullable().unique();
            t.text('display_name').notNullable();
            t.integer('age').notNullable();
            t.text('role').notNullable(); // 'User' | 'Admin' | 'Editor'
            t.boolean('is_active').notNullable().defaultTo(1);
            t.datetime('created_at').notNullable();
            t.datetime('updated_at').nullable();
            t
                .integer('address_id')
                .unsigned()
                .nullable()
                .references('id')
                .inTable('addresses')
                .onDelete('SET NULL')
                .onUpdate('CASCADE');
        });
    }

    // posts
    const hasPosts = await db.schema.hasTable('posts');
    if (!hasPosts) {
        await db.schema.createTable('posts', (t) => {
            t.increments('id').primary();
            t.text('title').notNullable();
            t.text('content').nullable();
            t.datetime('created_at').notNullable();
            t.boolean('published').notNullable().defaultTo(0);
            t
                .integer('author_id')
                .unsigned()
                .notNullable()
                .references('id')
                .inTable('users')
                .onDelete('CASCADE')
                .onUpdate('CASCADE');
        });
    }
}

async function main() {
    // 1) Recreate the file for a clean slate
    recreateDbFile(DB_PATH);

    // 2) Open a fresh connection
    const db = knex({
        client: 'sqlite3',
        connection: { filename: DB_PATH },
        useNullAsDefault: true,
    });

    try {
        // 3) Recreate schema so the DB is ready for seed or dev usage
        await ensureSchema(db);
        console.log(`✅ DB reset: ${DB_PATH} recreated and schema refreshed.`);
    } catch (err) {
        console.error('❌ DB reset failed:', err);
        process.exitCode = 1;
    } finally {
        await db.destroy();
    }
}

main();
