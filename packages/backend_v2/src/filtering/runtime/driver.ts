// src/filtering/runtime/driver.ts
// Minimal driver "ctx" types so the resolver signature is ORM-agnostic

// ---- MikroORM ----
import type { EntityManager } from '@mikro-orm/core';

export interface MikroOrmCtx {
    kind: 'mikroorm';
    em: EntityManager;
}

/** Wrap a MikroORM EntityManager to a driver ctx */
export function mikroOrmCtx(em: EntityManager): MikroOrmCtx {
    return { kind: 'mikroorm', em };
}

// ---- Prisma (placeholder so you can compile without @prisma/client) ----
// You can refine this once you generate the Prisma adapter.
export interface PrismaCtx {
    kind: 'prisma';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    client: any; // replace with PrismaClient when you add prisma
}

// ---- Knex (placeholder) ----
export interface KnexCtx {
    kind: 'knex';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    knex: any;   // replace with Knex instance when you add knex
}
