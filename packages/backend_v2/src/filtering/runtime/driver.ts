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

// ---- Prisma ----
import type { PrismaClient } from '@prisma/client';

export interface PrismaCtx {
    kind: 'prisma';
    client: PrismaClient;
}

/** Wrap a PrismaClient to a driver ctx */
export function prismaCtx(client: PrismaClient): PrismaCtx {
    return { kind: 'prisma', client };
}

// ---- Knex (placeholder; keep it typed without `any`) ----
export interface KnexLike {} // refine when you add knex

export interface KnexCtx {
    kind: 'knex';
    knex: KnexLike;
}

// ---- Common union (handy for adapters) ----
export type OrmCtx = MikroOrmCtx | PrismaCtx | KnexCtx;
