// Minimal, framework-agnostic driver "ctx" types.
// No imports from ORM packages, consumers/adapters pin the generics.

/** MikroORM */
export interface MikroOrmCtx<EM = unknown> {
    kind: 'mikroorm';
    em: EM;
}
export function mikroOrmCtx<EM>(em: EM): MikroOrmCtx<EM> {
    return { kind: 'mikroorm', em };
}

/** Prisma */
export interface PrismaCtx<C = unknown> {
    kind: 'prisma';
    client: C;
}
export function prismaCtx<C>(client: C): PrismaCtx<C> {
    return { kind: 'prisma', client };
}

/** Knex */
export interface KnexLike {} // refine if you want

export interface KnexCtx<Caps = unknown, K = KnexLike> {
    kind: 'knex';
    knex: K;
    /** SQL capabilities (adapter) – required by the SQL resolver */
    caps?: Caps;
}

/** Wrap a Knex instance (and optional capabilities) into a driver ctx */
export function knexCtx<K = KnexLike, Caps = unknown>(knex: K, caps?: Caps): KnexCtx<Caps, K> {
    return { kind: 'knex', knex, ...(caps ? { caps } : {}) };
}

/** Common union (useful for adapter-agnostic plumbing) */
export type OrmCtx = MikroOrmCtx | PrismaCtx | KnexCtx;

/** Optional: tiny type guards if you ever need them */
export const isPrismaCtx = (c: OrmCtx): c is PrismaCtx => c.kind === 'prisma';
export const isMikroOrmCtx = (c: OrmCtx): c is MikroOrmCtx => c.kind === 'mikroorm';
export const isKnexCtx = (c: OrmCtx): c is KnexCtx => c.kind === 'knex';
