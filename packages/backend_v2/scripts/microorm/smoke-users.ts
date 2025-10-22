// scripts/smoke-users.ts
import 'reflect-metadata';
import {MikroORM, OptionalProps} from '@mikro-orm/core';
import config from '../../src/mikro-orm.config';
import {User} from '../../src/domain/user.entity';
import type {FilterInput} from '../../src/filtering/ast';
import { mikroOrmCtx } from '../../src/filtering/runtime/driver';

// auto-generated (MikroORM adapter)
import {resolveUser as resolveUsers} from '../../src/generated/mikroorm/UserResolver';

/** Pretty-print only selected fields from an entity graph. */
function project<T extends object>(row: T, select: readonly string[]): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const path of select) {
        const parts = path.split('.');
        let src: unknown = row;
        let dst: Record<string, unknown> = out;

        for (let i = 0; i < parts.length; i++) {
            const key = parts[i]!;
            if (src == null || typeof src !== 'object') break;

            if (i === parts.length - 1) {
                dst[key] = (src as Record<string, unknown>)[key];
            } else {
                dst[key] = dst[key] ?? {};
                dst = dst[key] as Record<string, unknown>;
                src = (src as Record<string, unknown>)[key];
            }
        }
    }
    return out;
}

/** Narrow shape for FilterError we throw from validate() */
type FilterErrShape = {
    code?: string;
    message: string;
    meta?: { field?: string; op?: string; allowed?: readonly string[] };
};

async function main() {
    const orm = await MikroORM.init(config);
    const em = orm.em.fork();
    const ctx = mikroOrmCtx(orm.em.fork());
    
    // 1) Compound filter: age >= 30 AND (role == 'admin' OR isActive == false)
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
    const results1 = await resolveUsers(ctx, User, filter1, undefined, {
        limits: { maxDepth: 6, maxNodes: 200, maxInSize: 500 },
        query: {
            select: select1,
            sort: [{ field: 'createdAt', direction: 'desc' }],
            limit: 50,
            offset: 0,
        },
        security: { requireSelectableForFilter: true },
    });
    console.log('─ Filter 1 -> Users (projected):');
    console.log(results1);

    // 2) Relation filter: address.city CONTAINS 'Ber' AND age >= 18
    const filter2: FilterInput = {
        and: [
            { field: 'address.city', op: 'contains', value: 'Ber' },
            { field: 'age', op: 'gte', value: 18 },
        ],
    };
    const select2 = ['email', 'displayName', 'age', 'role', 'createdAt', 'address.city', 'address.postalCode'] as const;
    const results2 = await resolveUsers(ctx, User, filter2, undefined, {
        query: { select: select2, sort: [{ field: 'age', direction: 'asc' }], limit: 25 },
        security: { requireSelectableForFilter: true },
    });
    console.log('─ Filter 2 (address.city contains "Ber") -> Users (projected):');
    console.log(results2);

    // 3) Enum IN + numeric: role in [admin,editor] AND age < 40
    const filter3: FilterInput = {
        and: [
            { field: 'role', op: 'in', value: ['admin', 'editor'] },
            { field: 'age', op: 'lt', value: 40 },
        ],
    };
    const select3 = ['email', 'role', 'age'] as const;
    const results3 = await resolveUsers(ctx, User, filter3, undefined, {
        query: { select: select3, sort: [{ field: 'age', direction: 'asc' }] },
        security: { requireSelectableForFilter: true },
    });
    console.log('─ Filter 3 (role in [admin,editor] & age < 40) -> Users (projected):');
    console.log(results3);

    // 4) Date BETWEEN (created in 2024)
    const filter4: FilterInput = {
        and: [{ field: 'createdAt', op: 'between', value: [new Date('2024-01-01'), new Date('2024-12-31')] }],
    };
    const select4 = ['email', 'createdAt', 'age'] as const;
    const results4 = await resolveUsers(ctx, User, filter4, undefined, {
        query: { select: select4, sort: [{ field: 'age', direction: 'desc' }] },
        security: { requireSelectableForFilter: true },
    });
    console.log('─ Filter 4 (createdAt between 2024-01-01 and 2024-12-31) -> Users (projected):');
    console.log(results4);

    // 5) Null check on nested optional field (address.street2 is null)
    const results5 = await resolveUsers(ctx, User, { field: 'address.street2', op: 'is_null' }, undefined, {
        query: { select: ['email', 'address.street2', 'address.street1', "address.city", "address.country"], sort: [{ field: 'email', direction: 'asc' }] },
        security: { requireSelectableForFilter: true },
    });
    console.log('─ Filter 5 (address.street2 is null) -> Users (projected):');
    console.log(results5[0]?.address.city);

    // 6) Pagination with a SINGLE CONDITION (now valid): { field: 'age', op: 'gte', value: 18 }
    const paginatedFilter: FilterInput = { field: 'age', op: 'gte', value: 18 };
    const select6 = ['email', 'createdAt'] as const;
    const page1 = await resolveUsers(ctx, User, paginatedFilter, undefined, {
        query: { select: select6, sort: [{ field: 'createdAt', direction: 'asc' }], limit: 1, offset: 0 },
        security: { requireSelectableForFilter: true },
    });
    const page2 = await resolveUsers(ctx, User, paginatedFilter, undefined, {
        query: { select: select6, sort: [{ field: 'createdAt', direction: 'asc' }], limit: 1, offset: 1 },
        security: { requireSelectableForFilter: true },
    });
    console.log('─ Pagination: page 1 ->', page1);
    console.log('─ Pagination: page 2 ->', page2);

    // 7) INVALID FILTERS — we should see which field failed in error.meta.field

    // 7a) Operator not allowed for field (age does not support 'contains')
    try {
        const bad1: FilterInput = { field: 'age', op: 'contains', value: '30' as unknown as number };
        await resolveUsers(ctx, User, bad1, undefined, {
            query: { select: ['email'] as const },
            security: { requireSelectableForFilter: true },
        });
        console.error('✗ Expected operator error, but call succeeded.');
    } catch (e) {
        const fe = e as FilterErrShape;
        console.log('✔ Expected operator error:', fe.code, fe.message, 'field=', fe.meta?.field, 'op=', fe.meta?.op);
    }

    // 7b) Type mismatch (age eq "thirty")
    try {
        const bad2: FilterInput = { field: 'age', op: 'eq', value: 'thirty' as unknown as number };
        await resolveUsers(ctx, User, bad2, undefined, {
            query: { select: ['email'] as const },
            security: { requireSelectableForFilter: true },
        });
        console.error('✗ Expected value-type error, but call succeeded.');
    } catch (e) {
        const fe = e as FilterErrShape;
        console.log('✔ Expected value-type error:', fe.code, fe.message, 'field=', fe.meta?.field);
    }

    await orm.close(true);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
