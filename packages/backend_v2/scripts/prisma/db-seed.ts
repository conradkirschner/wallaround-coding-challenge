// scripts/prisma/db-seed.ts
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Start clean (order matters due to FKs)
    await prisma.post.deleteMany();
    await prisma.address.deleteMany();
    await prisma.user.deleteMany();

    const now = new Date();

    // Users (Alice, Bob with addresses; Carol, Dave without)
    const alice = await prisma.user.create({
        data: {
            email: 'alice@example.com',
            displayName: 'Alice',
            age: 28,
            role: Role.user,
            isActive: true,
            createdAt: new Date('2024-01-10'),
            address: {
                create: {
                    street1: 'Main St 1',
                    postalCode: '10115',
                    city: 'Berlin',
                    country: 'DE',
                },
            },
        },
        select: { id: true }, // keep it light; we only need the id for posts
    });

    const bob = await prisma.user.create({
        data: {
            email: 'bob@example.com',
            displayName: 'Bob',
            age: 34,
            role: Role.admin,
            isActive: true,
            createdAt: new Date('2024-05-21'),
            address: {
                create: {
                    street1: '2nd Ave 42',
                    street2: 'Apt 5B',
                    postalCode: '10001',
                    city: 'New York',
                    country: 'US',
                },
            },
        },
        select: { id: true },
    });

    const carol = await prisma.user.create({
        data: {
            email: 'carol@example.com',
            displayName: 'Carol',
            age: 41,
            role: Role.editor,
            isActive: false,
            createdAt: new Date('2023-11-02'),
        },
        select: { id: true },
    });

    const dave = await prisma.user.create({
        data: {
            email: 'dave@example.com',
            displayName: 'Dave',
            age: 22,
            role: Role.user,
            isActive: false,
            createdAt: now,
        },
        select: { id: true },
    });

    // Posts (Alice: 2, Bob: 1, Carol: 1 draft, Dave: none)
    await prisma.post.createMany({
        data: [
            {
                title: 'Hello Berlin',
                content: "test",
                published: true,
                createdAt: new Date('2024-02-01'),
                authorId: alice.id,
            },
            {
                title: 'Exploring Prenzlauer Berg',
                content: 'Alice on coffee and parks.',
                published: false,
                createdAt: new Date('2024-03-12'),
                authorId: alice.id,
            },
            {
                title: 'Scaling the backend',
                content: 'Bob shares admin tips.',
                published: true,
                createdAt: new Date('2024-06-10'),
                authorId: bob.id,
            },
            {
                title: 'Editorial calendar FY24',
                content: null, // matches MikroORM seed where content is null
                published: false,
                createdAt: new Date('2024-01-22'),
                authorId: carol.id,
            },
        ],
    });

    console.log(
        `✅ Seeded 4 users, 2 addresses, 4 posts. (Dave has no posts, Carol's is draft)`
    );
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
