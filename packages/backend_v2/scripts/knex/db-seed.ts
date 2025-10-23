// scripts/sql-seed.ts
import knex, { type Knex } from 'knex';

async function ensureSchema(db: Knex) {
    // Addresses
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

    // Users
    const hasUsers = await db.schema.hasTable('users');
    if (!hasUsers) {
        await db.schema.createTable('users', (t) => {
            t.increments('id').primary();
            t.text('email').notNullable().unique();
            t.text('display_name').notNullable();
            t.integer('age').notNullable();
            t.text('role').notNullable();              // e.g. 'User' | 'Admin' | 'Editor'
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

    // Posts
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

async function clearAll(db: Knex) {
    // Order matters due to FKs: posts -> users -> addresses
    await db('posts').del();
    await db('users').del();
    await db('addresses').del();
}

function d(s: string): string {
    // Store as ISO-like strings; SQLite will happily keep them as TEXT
    return new Date(s).toISOString();
}

async function main() {
    // If you already export a Knex instance from app/bootstrap/sql.ts, you can reuse it:
    //   import { db } from '../app/bootstrap/sql';
    // and remove this local initialization + db.destroy() at the end.
    const db = knex({
        client: 'sqlite3',
        connection: { filename: './dev.sqlite' },
        useNullAsDefault: true,
    });

    try {
        await ensureSchema(db);

        // Use a transaction for consistent state
        await db.transaction(async (trx) => {
            await clearAll(trx);

            // Insert known IDs to avoid relying on .returning() in SQLite
            // Addresses
            await trx('addresses').insert([
                {
                    id: 1,
                    street1: 'Main St 1',
                    street2: null,
                    postal_code: '10115',
                    city: 'Berlin',
                    country: 'DE',
                },
                {
                    id: 2,
                    street1: '2nd Ave 42',
                    street2: 'Apt 5B',
                    postal_code: '10001',
                    city: 'New York',
                    country: 'US',
                },
            ]);

            // Users
            const nowIso = new Date().toISOString();
            await trx('users').insert([
                {
                    id: 1,
                    email: 'alice@example.com',
                    display_name: 'Alice',
                    age: 28,
                    role: 'User',
                    is_active: 1,
                    created_at: d('2024-01-10'),
                    updated_at: null,
                    address_id: 1,
                },
                {
                    id: 2,
                    email: 'bob@example.com',
                    display_name: 'Bob',
                    age: 34,
                    role: 'Admin',
                    is_active: 1,
                    created_at: d('2024-05-21'),
                    updated_at: null,
                    address_id: 2,
                },
                {
                    id: 3,
                    email: 'carol@example.com',
                    display_name: 'Carol',
                    age: 41,
                    role: 'Editor',
                    is_active: 0,
                    created_at: d('2023-11-02'),
                    updated_at: null,
                    address_id: null,
                },
                {
                    id: 4,
                    email: 'dave@example.com',
                    display_name: 'Dave',
                    age: 22,
                    role: 'User',
                    is_active: 0,
                    created_at: nowIso,
                    updated_at: null,
                    address_id: null,
                },
            ]);

            // Posts
            await trx('posts').insert([
                {
                    id: 1,
                    title: 'Hello Berlin',
                    content: 'First post from Alice.',
                    published: 1,
                    created_at: d('2024-02-01'),
                    author_id: 1, // Alice
                },
                {
                    id: 2,
                    title: 'Exploring Prenzlauer Berg',
                    content: 'Alice on coffee and parks.',
                    published: 0,
                    created_at: d('2024-03-12'),
                    author_id: 1, // Alice
                },
                {
                    id: 3,
                    title: 'Scaling the backend',
                    content: 'Bob shares admin tips.',
                    published: 1,
                    created_at: d('2024-06-10'),
                    author_id: 2, // Bob
                },
                {
                    id: 4,
                    title: 'Editorial calendar FY24',
                    content: null,
                    published: 0,
                    created_at: d('2024-01-22'),
                    author_id: 3, // Carol
                },
            ]);
        });

        console.log(
            `✅ Seeded 4 users, 2 addresses, 4 posts into SQLite (dev.sqlite).`
        );
    } catch (err) {
        console.error('❌ Seed failed:', err);
        process.exitCode = 1;
    } finally {
        // Only if you're creating a local knex here; remove if you reuse a shared db instance.
        await db.destroy();
    }
}

main();
