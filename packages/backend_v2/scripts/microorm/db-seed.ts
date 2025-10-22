// scripts/db-seed.ts
import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
import config from '../../src/mikro-orm.config';
import { User, Role } from '../../src/domain/user.entity';
import { Address } from '../../src/domain/address.entity';
import { Post } from '../../src/domain/post.entity';

async function main() {
    const orm = await MikroORM.init(config);
    const em = orm.em.fork();

    // Recommended: run scripts/db-reset.ts first (refreshDatabase) for dev,
    // so we start from a clean schema.

    const now = new Date();

    // Addresses
    const addrAlice = em.create(Address, {
        street1: 'Main St 1',
        postalCode: '10115',
        city: 'Berlin',
        country: 'DE',
    });

    const addrBob = em.create(Address, {
        street1: '2nd Ave 42',
        street2: 'Apt 5B',
        postalCode: '10001',
        city: 'New York',
        country: 'US',
    });

    // Users (Alice, Bob have addresses; Carol, Dave do not)
    const alice = em.create(User, {
        email: 'alice@example.com',
        displayName: 'Alice',
        age: 28,
        role: Role.User,
        isActive: true,
        createdAt: new Date('2024-01-10'),
        address: addrAlice,
    });

    const bob = em.create(User, {
        email: 'bob@example.com',
        displayName: 'Bob',
        age: 34,
        role: Role.Admin,
        isActive: true,
        createdAt: new Date('2024-05-21'),
        address: addrBob,
    });

    const carol = em.create(User, {
        email: 'carol@example.com',
        displayName: 'Carol',
        age: 41,
        role: Role.Editor,
        isActive: false,
        createdAt: new Date('2023-11-02'),
    });

    const dave = em.create(User, {
        email: 'dave@example.com',
        displayName: 'Dave',
        age: 22,
        role: Role.User,
        isActive: false,
        createdAt: now,
    });

    await em.persistAndFlush([alice, bob, carol, dave]);

    // Posts (1:n User -> Post[])
    //   - Alice: 2 posts
    //   - Bob:   1 post
    //   - Carol: 1 post (draft)
    //   - Dave:  none
    const posts = [
        em.create(Post, {
            title: 'Hello Berlin',
            content: 'First post from Alice.',
            published: true,
            createdAt: new Date('2024-02-01'),
            author: alice,
        }),
        em.create(Post, {
            title: 'Exploring Prenzlauer Berg',
            content: 'Alice on coffee and parks.',
            published: false,
            createdAt: new Date('2024-03-12'),
            author: alice,
        }),
        em.create(Post, {
            title: 'Scaling the backend',
            content: 'Bob shares admin tips.',
            published: true,
            createdAt: new Date('2024-06-10'),
            author: bob,
        }),
        em.create(Post, {
            title: 'Editorial calendar FY24',
            content: null,
            published: false,
            createdAt: new Date('2024-01-22'),
            author: carol,
        }),
    ];

    await em.persistAndFlush(posts);

    await orm.close(true);
    console.log(
        `✅ Seeded ${[alice, bob, carol, dave].length} users, ` +
        `${[addrAlice, addrBob].length} addresses, ${posts.length} posts.`,
    );
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
