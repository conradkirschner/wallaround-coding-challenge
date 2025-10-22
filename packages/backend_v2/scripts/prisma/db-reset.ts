// scripts/prisma-db-reset.ts
import { rmSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

// Adjust if your DATABASE_URL is different
const DB_FILE = './var/dev.sqlite';

async function main() {
    const dir = dirname(DB_FILE);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    if (existsSync(DB_FILE)) rmSync(DB_FILE);

    // Let Prisma (CLI) recreate the schema — run this script followed by:
    //   npx prisma db push
    //   tsx scripts/prisma-seed.ts
    console.log(`✅ Removed ${DB_FILE}. Now run: "npx prisma db push" then "tsx scripts/prisma-seed.ts"`);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
