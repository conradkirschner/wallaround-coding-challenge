import 'reflect-metadata';
import { PrismaClient } from '@prisma/client';
import type { FilterInput } from '../../src/filtering/ast';
import { prismaCtx } from '../../src/filtering/runtime/driver';

// auto-generated (Prisma adapter)
import { resolveUser as resolveUsers} from '../../src/generated/prisma/UserResolver';

/** Narrow shape for FilterError we throw from validate() */
type FilterErrShape = {
    code?: string;
    message: string;
    meta?: { field?: string; op?: string; allowed?: readonly string[] };
};

function isRecord(v: unknown): v is Record<string, unknown> {
    return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Project only selected paths from a result row (no `any`) */
function project<T extends object>(row: T, select: readonly string[]): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const path of select) {
        const keys = path.split('.');
        let src: unknown = row;
        let dst: Record<string, unknown> = out;

        for (let i = 0; i < keys.length; i++) {
            const k = keys[i]!;
            if (!isRecord(src)) break;

            if (i === keys.length - 1) {
                dst[k] = src[k];
            } else {
                // prepare next level (object or array)
                const next = src[k];
                const nextContainer: Record<string, unknown> | unknown[] =
                    Array.isArray(next) ? [] : (isRecord(dst[k]) ? (dst[k] as Record<string, unknown>) : {});
                dst[k] = dst[k] ?? nextContainer;

                // advance pointers
                if (Array.isArray(next)) {
                    // If the next level is an array, project each item to the remaining path tail
                    const tail = keys.slice(i + 1).join('.');
                    const arr = next.map((item) => project(item as object, [tail]));
                    dst[k] = arr;
                    break; // we've consumed the rest via tail projection
                } else {
                    dst = dst[k] as Record<string, unknown>;
                    src = next;
                }
            }
        }
    }
    return out;
}

async function main() {
    const prisma = new PrismaClient();
    const ctx = prismaCtx(prisma);

    // 1) Compound filter
    const filter1: FilterInput = {
        and: [
            { field: 'age', op: 'gte', value: 30 },
            { or: [
                    { field: 'role', op: 'eq', value: 'admin' },
                    { field: 'isActive', op: 'eq', value: false },
                ]},
        ],
    };
    const select1 = ['email', 'displayName', 'age', 'role', 'isActive', 'createdAt'] as const;
    const results1 = await resolveUsers(
        ctx,
        'User',
        /*@FIX: TS2769: No overload matches this call.
The last overload gave the following error.
Argument of type { and: readonly FilterNode[]; } is not assignable to parameter of type new (...args: never[]) => object
Type { and: readonly FilterNode[]; } provides no match for the signature new (...args: never[]): object
UserResolver.ts(365, 23): The last overload is declared here.
UserResolver.ts(375, 23): The call would have succeeded against this implementation, but implementation signatures of overloads are not externally visible.*/
        filter1,
        undefined, {
        limits: { maxDepth: 6, maxNodes: 200, maxInSize: 500 },
        query: { select: select1, sort: [{ field: 'createdAt', direction: 'desc' }], limit: 50, offset: 0 },
        security: { requireSelectableForFilter: true },
    });
    console.log('PRISMA ─ Filter 1 -> Users (projected):');
    console.log(results1.map((u) => project(u, select1)));

    // 2) 1:1 relation filter
    const filter2: FilterInput = {
        and: [
            { field: 'address.city', op: 'contains', value: 'Ber' },
            { field: 'age', op: 'gte', value: 18 },
        ],
    };
    const results2 = await resolveUsers(ctx, 'User' as const, filter2, undefined, {
        query: { select: ['email', 'displayName', 'age', 'role', 'createdAt', 'address.city', 'address.postalCode'], sort: [{ field: 'age', direction: 'asc' }], limit: 25 },
        security: { requireSelectableForFilter: true },
    });
    console.log('PRISMA ─ Filter 2 (address.city contains "Ber") -> Users (projected):');
    console.log(results2);

    // 3) Enum IN + numeric
    const filter3: FilterInput = {
        and: [
            { field: 'role', op: 'in', value: ['admin', 'editor'] },
            { field: 'age', op: 'lt', value: 40 },
        ],
    };
    const select3 = ['email', 'role', 'age'] as const;
    const results3 = await resolveUsers(ctx, 'User' as const, filter3, undefined, {
        query: { select: select3, sort: [{ field: 'age', direction: 'asc' }] },
        security: { requireSelectableForFilter: true },
    });
    console.log('PRISMA ─ Filter 3 (role in [admin,editor] & age < 40) -> Users (projected):');
    console.log(results3.map((u) => project(u, select3)));

    // 4) Date BETWEEN (2024)
    const filter4: FilterInput = {
        and: [{ field: 'createdAt', op: 'between', value: [new Date('2024-01-01'), new Date('2024-12-31')] }],
    };
    const select4 = ['email', 'createdAt', 'age'] as const;
    const results4 = await resolveUsers(ctx, 'User' as const, filter4, undefined, {
        query: { select: select4, sort: [{ field: 'age', direction: 'desc' }] },
        security: { requireSelectableForFilter: true },
    });
    console.log('PRISMA ─ Filter 4 (createdAt between 2024-01-01 and 2024-12-31) -> Users (projected):');
    console.log(results4.map((u) => project(u, select4)));

    // 5) address.street2 is null
    const select5 = ['email', 'address.street2', 'address.street1', 'address.city', 'address.country'] as const;
    const results5 = await resolveUsers(ctx, 'User' as const, { field: 'address.street2', op: 'is_null' }, undefined, {
        query: { select: select5, sort: [{ field: 'email', direction: 'asc' }] },
        security: { requireSelectableForFilter: true },
    });
    console.log('PRISMA ─ Filter 5 (address.street2 is null) -> Users (projected):');
    console.log(results5.map((u) => project(u, select5)));

    // 6) Pagination with a SINGLE CONDITION
    const paginatedFilter: FilterInput = { field: 'age', op: 'gte', value: 18 };
    const select6 = ['email', 'createdAt'] as const;
    const page1 = await resolveUsers(ctx, 'User' as const, paginatedFilter, undefined, {
        query: { select: select6, sort: [{ field: 'createdAt', direction: 'asc' }], limit: 1, offset: 0 },
        security: { requireSelectableForFilter: true },
    });
    const page2 = await resolveUsers(ctx, 'User' as const, paginatedFilter, undefined, {
        query: { select: select6, sort: [{ field: 'createdAt', direction: 'asc' }], limit: 1, offset: 1 },
        security: { requireSelectableForFilter: true },
    });
    console.log('PRISMA ─ Pagination: page 1 ->', page1.map((u) => project(u, select6)));
    console.log('PRISMA ─ Pagination: page 2 ->', page2.map((u) => project(u, select6)));

    // 7) INVALID FILTERS

    // 7a) Operator not allowed (no `any`)
    try {
        const bad1: FilterInput = { field: 'age', op: 'contains', value: '30' as unknown as number };
        await resolveUsers(ctx, 'User' as const, bad1, undefined, {
            query: { select: ['email'] as const },
            security: { requireSelectableForFilter: true },
        });
        console.error('✗ Expected operator error, but call succeeded.');
    } catch (e) {
        const fe = e as FilterErrShape;
        console.log('PRISMA ✔ Expected operator error:', fe.code, fe.message, 'field=', fe.meta?.field, 'op=', fe.meta?.op);
    }

    // 7b) Type mismatch
    try {
        const bad2: FilterInput = { field: 'age', op: 'eq', value: 'thirty' as unknown as number };
        await resolveUsers(ctx, 'User' as const, bad2, undefined, {
            query: { select: ['email'] as const },
            security: { requireSelectableForFilter: true },
        });
        console.error('✗ Expected value-type error, but call succeeded.');
    } catch (e) {
        const fe = e as FilterErrShape;
        console.log('PRISMA ✔ Expected value-type error:', fe.code, fe.message, 'field=', fe.meta?.field);
    }

    // 8) 1:n relation (posts) — default quantifier (SOME)
    const filter8: FilterInput = {
        and: [
            { field: 'posts.title', op: 'contains', value: 'Hello' },
            { field: 'posts.published', op: 'eq', value: true },
        ],
    };
    const select8 = ['email', 'posts.title', 'posts.published'] as const;
    const results8 = await resolveUsers(ctx, 'User' as const, filter8, undefined, {
        query: { select: select8, sort: [{ field: 'email', direction: 'asc' }] },
        security: { requireSelectableForFilter: true },
    });
    console.log('PRISMA ─ Filter 8 (posts.title contains "Hello" & posts.published == true) -> Users (projected):');
    console.log(results8.map((u) => project(u, select8)));

    // 9) Cross relations
    const filter9: FilterInput = {
        and: [
            { field: 'address.city', op: 'eq', value: 'Berlin' },
            { field: 'posts.published', op: 'eq', value: true },
        ],
    };
    const select9 = ['email', 'address.city', 'posts.title', 'posts.published'] as const;
    const results9 = await resolveUsers(ctx, 'User' as const, filter9, undefined, {
        query: { select: select9, sort: [{ field: 'email', direction: 'asc' }] },
        security: { requireSelectableForFilter: true },
    });
    console.log('PRISMA ─ Filter 9 (address.city=="Berlin" & posts.published==true) -> Users (projected):');
    console.log(JSON.stringify(results9));

    await prisma.$disconnect();
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
