// app/bootstrap/sql.ts
import knex, { type Knex } from 'knex';
import { User } from 'src/domain/user.entity';
import { Address } from 'src/domain/address.entity';
import { Post } from 'src/domain/post.entity';
import {
    createSqlCapabilities,
    type SqlMapping,
    type SqlDialect,
} from 'src/filtering/runtime/adapter/adapter-sql';
import { knexCtx } from 'src/filtering/runtime/driver';

// ---- Dialect is required now (we're on SQLite)
const DIALECT: SqlDialect = 'sqlite';

// You can export the db if other parts need raw Knex access
export const db: Knex = knex({
    client: 'sqlite3',
    connection: { filename: './dev.sqlite' },
    useNullAsDefault: true,
});

// Stable tokens help avoid function-identity issues in monorepos/hot-reload
const USER_TOKEN = 'domain:User';
const ADDRESS_TOKEN = 'domain:Address';
const POST_TOKEN = 'domain:Post';

const userMap: SqlMapping = {
    table: 'users',
    primaryKey: 'id',
    columns: {
        id: 'id',
        email: 'email',
        age: 'age',
        isActive: 'is_active',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        displayName: 'display_name',
        role: 'role',
    },
    relations: {
        address: {
            kind: 'one',
            table: 'addresses',
            join: { local: 'address_id', foreign: 'id' },
            columns: {
                city: 'city',
                country: 'country',
                postalCode: 'postal_code',
                street1: 'street1',
                street2: 'street2',
            },
        },
        posts: {
            kind: 'many',
            table: 'posts',
            join: { local: 'id', foreign: 'author_id' },
            columns: {
                id: 'id',
                title: 'title',
                content: 'content',
                createdAt: 'created_at',
                published: 'published',
            },
            // Defaults used when filtering to-many relations without an explicit quantifier
            defaultQuantifier: 'some', // 'some' | 'every' | 'none'
        },
    },
};

const addressMap: SqlMapping = {
    table: 'addresses',
    primaryKey: 'id',
    columns: {
        id: 'id',
        city: 'city',
        country: 'country',
        postalCode: 'postal_code',
        street1: 'street1',
        street2: 'street2',
    },
};
const postMap: SqlMapping = {
    table: 'posts',
    primaryKey: 'id',
    columns: {
        id: 'id',
        title: 'title',
        content: 'content',
        published: 'published',
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    },
    relations: {
        user: {
            kind: 'one',
            table: 'user',
            join: { local: 'user_id', foreign: 'id' },
            columns: {
                id: 'id',
                email: 'email',
                age: 'age',
                isActive: 'is_active',
                createdAt: 'created_at',
                updatedAt: 'updated_at',
                displayName: 'display_name',
                role: 'role',
            },
        },
    },
};

// Register under both ctor and stable token keys
const mappings = new Map<Function | string | symbol, SqlMapping>([
    [User, userMap],
    [USER_TOKEN, userMap],
    [Address, addressMap],
    [ADDRESS_TOKEN, addressMap],
    [Post, postMap],
    [POST_TOKEN, postMap],
]);

// Capabilities (identifier quoting derives from dialect; values must be parameterized in the resolver)
export const sqlCaps = createSqlCapabilities(mappings, { dialect: DIALECT });
export const sqlCtx  = knexCtx(db, sqlCaps);
