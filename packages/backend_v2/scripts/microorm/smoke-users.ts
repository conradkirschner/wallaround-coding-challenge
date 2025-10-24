// scripts/mikroorm/smoke-users.ts
import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
import config from '../../src/mikro-orm.config';
import { User } from '../../src/domain/user.entity';
import { mikroOrmCtx } from '../../src/filtering/runtime/driver';

// auto-generated (MikroORM adapter, class-based)
import {
    UserResolver,
    type UserFilterInput,
    type UserSelectField,
} from '../../src/generated/mikroorm/UserResolver';

/** Narrow shape for FilterError we throw from validate() */
type FilterErrShape = {
    code?: string;
    message: string;
    meta?: { field?: string; op?: string; allowed?: readonly string[]; operator?: string };
};

async function main() {
    const orm = await MikroORM.init(config);
    const ctx = mikroOrmCtx(orm.em.fork());

    // 1) Compound filter: age >= 30 AND (role == 'admin' OR isActive == false)
    const filter1: UserFilterInput = {
        and: [
            { field: 'age', op: 'gte', value: 30 },
            {
                or: [
                    { field: 'role', op: 'eq', value: 'admin' },
                    { field: 'isActive', op: 'eq', value: false },
                ],
            },
        ],
    };
    const select1 = ['email', 'displayName', 'age', 'role', 'isActive', 'createdAt'] as const;
    const results1 = await UserResolver
        .withCtor(ctx, User)
        .where(filter1)
        .limits({ maxDepth: 6, maxNodes: 200, maxInSize: 500 })
        .select(...select1)
        .orderBy('createdAt', 'desc')
        .paginate({ limit: 50, offset: 0 })
        .secureRequireSelectable()
        .execute();
    console.log('─ Filter 1 -> Users (projected):');
    console.log(JSON.stringify(results1));

    // 2) Relation filter (1:1): address.city CONTAINS 'Ber' AND age >= 18
    const filter2: UserFilterInput = {
        and: [
            { field: 'address.city', op: 'contains', value: 'Ber' },
            { field: 'age', op: 'gte', value: 18 },
        ],
    };
    const select2 = [
        'email',
        'displayName',
        'age',
        'role',
        'createdAt',
        'address.city',
        'address.postalCode',
    ] as const;
    const results2 = await UserResolver
        .withCtor(ctx, User)
        .where(filter2)
        .select(...select2)
        .orderBy('age', 'asc')
        .paginate({ limit: 25 })
        .secureRequireSelectable()
        .execute();
    console.log('─ Filter 2 (address.city contains "Ber") -> Users (projected):');
    console.log(JSON.stringify(results2));

    // 3) Enum IN + numeric: role in [admin,editor] AND age < 40
    const filter3: UserFilterInput = {
        and: [
            { field: 'role', op: 'in', value: ['admin', 'editor'] },
            { field: 'age', op: 'lt', value: 40 },
        ],
    };
    const select3 = ['email', 'role', 'age'] as const;
    const results3 = await UserResolver
        .withCtor(ctx, User)
        .where(filter3)
        .select(...select3)
        .orderBy('age', 'asc')
        .secureRequireSelectable()
        .execute();
    console.log('─ Filter 3 (role in [admin,editor] & age < 40) -> Users (projected):');
    console.log(JSON.stringify(results3));

    // 4) Date BETWEEN (created in 2024)
    const filter4: UserFilterInput = {
        and: [{ field: 'createdAt', op: 'between', value: [new Date('2024-01-01'), new Date('2024-12-31')] }],
    };
    const select4 = ['email', 'createdAt', 'age'] as const;
    const results4 = await UserResolver
        .withCtor(ctx, User)
        .where(filter4)
        .select(...select4)
        .orderBy('age', 'desc')
        .secureRequireSelectable()
        .execute();
    console.log('─ Filter 4 (createdAt between 2024-01-01 and 2024-12-31) -> Users (projected):');
    console.log(JSON.stringify(results4));

    // 5) Null check on nested optional field (address.street2 is null)
    const select5 = [
        'email',
        'address.street2',
        'address.street1',
        'address.city',
        'address.country',
    ] as const;
    const results5 = await UserResolver
        .withCtor(ctx, User)
        .where({ field: 'address.street2', op: 'is_null' })
        .select(...select5)
        .orderBy('email', 'asc')
        .secureRequireSelectable()
        .execute();
    console.log('─ Filter 5 (address.street2 is null) -> Users (projected):');
    console.log(JSON.stringify(results5));
    // Assert shape is trimmed (no deep cycles)
    if (results5[0]?.address) {
        const a: any = results5[0].address;
        console.log('   address object keys =', Object.keys(a)); // should only be the selected fields under 'address'
    }

    // 6) Pagination with a SINGLE CONDITION
    const paginatedFilter: UserFilterInput = { field: 'age', op: 'gte', value: 18 };
    const select6 = ['email', 'createdAt'] as const;
    const page1 = await UserResolver
        .withCtor(ctx, User)
        .where(paginatedFilter)
        .select(...select6)
        .orderBy('createdAt', 'asc')
        .paginate({ limit: 1, offset: 0 })
        .secureRequireSelectable()
        .execute();
    const page2 = await UserResolver
        .withCtor(ctx, User)
        .where(paginatedFilter)
        .select(...select6)
        .orderBy('createdAt', 'asc')
        .paginate({ limit: 1, offset: 1 })
        .secureRequireSelectable()
        .execute();
    console.log('─ Pagination: page 1 ->', JSON.stringify(page1));
    console.log('─ Pagination: page 2 ->', JSON.stringify(page2));

    // 7) INVALID FILTERS — we should see field/op in error meta

    // 7a) Operator not allowed for field (age does not support 'contains')
    try {
        const bad1: UserFilterInput = { field: 'age', op: 'contains', value: '30' };
        await UserResolver
            .withCtor(ctx, User)
            .where(bad1)
            .select('email' as UserSelectField) // keep tuple/union happy
            .secureRequireSelectable()
            .execute();
        console.error('✗ Expected operator error, but call succeeded.');
    } catch (e) {
        const fe = e as FilterErrShape;
        console.log(
            '✔ Expected operator error:',
            fe.code,
            fe.message,
            'field=',
            fe.meta?.field,
            'op=',
            fe.meta?.op ?? (fe.meta as any)?.operator
        );
    }

    // 7b) Type mismatch (age eq "thirty")
    try {
        const bad2: UserFilterInput = { field: 'age', op: 'eq', value: 'thirty' as unknown as number };
        await UserResolver
            .withCtor(ctx, User)
            .where(bad2)
            .select('email' as UserSelectField)
            .secureRequireSelectable()
            .execute();
        console.error('✗ Expected value-type error, but call succeeded.');
    } catch (e) {
        const fe = e as FilterErrShape;
        console.log('✔ Expected value-type error:', fe.code, fe.message, 'field=', fe.meta?.field);
    }

    // 8) 1:n relation (posts) — SOME — title contains 'Hello' AND published == true
    const filter8: UserFilterInput = {
        and: [
            { field: 'posts.title', op: 'contains', value: 'Hello' },
            { field: 'posts.published', op: 'eq', value: true },
        ],
    };
    const select8 = ['email', 'posts.title', 'posts.published'] as const;
    const results8 = await UserResolver
        .withCtor(ctx, User)
        .where(filter8)
        .select(...select8)
        .orderBy('email', 'asc')
        .secureRequireSelectable()
        .execute();
    console.log('─ Filter 8 (posts.title contains "Hello" & posts.published == true) -> Users (projected):');
    console.log(JSON.stringify(results8));
    // Verify posts array items are trimmed (no .content, no .createdAt)
    if (Array.isArray((results8 as any)[0]?.posts) && (results8 as any)[0].posts.length) {
        console.log('   first user posts[0] keys =', Object.keys((results8 as any)[0].posts[0]));
    }

    // 9) Cross relations: address.city == 'Berlin' AND posts.published == true (entity shape)
    const select9 = ['email', 'address.city', 'posts.title', 'posts.published'] as const;
    const results9 = await UserResolver
        .withCtor(ctx, User)
        .where( {
            and: [
                {and: [{field: "address.country", op: 'contains', value:"30"}]},
                { field: 'address.city', op: 'eq', value: 'Berlin' },
                { field: 'posts.published', op: 'eq', value: true },
            ],
        })
        .select(...select9)
        .orderBy('email', 'asc')
        .secureRequireSelectable()
        .entityShape()
        .execute();
    console.log('─ Filter 9 (address.city=="Berlin" & posts.published==true) -> Users (entity shape):');
    console.log(JSON.stringify(results9));

    await orm.close(true);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
