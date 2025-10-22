// src/db/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
    // eslint-disable-next-line no-var
    var __PRISMA__: PrismaClient | undefined;
}

/** Single PrismaClient across the app (no hot-reload leaks during dev) */
export const prisma: PrismaClient =
    global.__PRISMA__ ??
    new PrismaClient({
        log: process.env.NODE_ENV === 'production' ? ['error'] : ['warn', 'error'],
    });

if (process.env.NODE_ENV !== 'production') {
    global.__PRISMA__ = prisma;
}
