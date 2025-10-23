import "reflect-metadata";
import "dotenv/config";
import { createServer } from "express-zod-api";
import { routing } from "./routes.config";
import { config as baseConfig } from "./api.config";

/** What createServer resolves to */
export type ServerBundle = Awaited<ReturnType<typeof createServer>>;

/**
 * Start the API server.
 * - In tests (NODE_ENV === 'test'): listen is forced to false and we return { app } for supertest.
 * - Otherwise: listen on PORT (or the value from api.config) and print the URL.
 */
export async function startServer(opts?: { listen?: number | false }) {
    const shouldListen =
        typeof opts?.listen !== "undefined"
            ? opts.listen
            : process.env.NODE_ENV === "test"
                ? false
                : Number(process.env.PORT) || (baseConfig as any)?.server?.listen || 3000;

    const finalConfig = {
        ...baseConfig,
        server: {
            ...(baseConfig as any).server,
            listen: shouldListen, // number | false
        },
    };

    const bundle = await createServer(finalConfig as any, routing);

    if (finalConfig.server.listen !== false) {
        // Only log when actually listening
        console.log(`App booted. http://localhost:${finalConfig.server.listen}`);
    }

    return bundle;
}

/** Convenience: close all HTTP servers created by express-zod-api */
export async function stopServer(bundle: ServerBundle): Promise<void> {
    await Promise.all(
        bundle.servers.map(
            (srv) =>
                new Promise<void>((resolve) => {
                    // typing is gnarly with generics; use any to call close()
                    (srv as any).close?.(() => resolve());
                }),
        ),
    );
}

/**
 * Default boot for "node src/server.ts" or when imported by your current entry.
 * You can keep using this as your main export if you like that pattern.
 */
export const serverPromise = startServer();
