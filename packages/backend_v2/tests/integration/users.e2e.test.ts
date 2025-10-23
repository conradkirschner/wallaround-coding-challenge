/**
 * Integration test for /v1/knex/users
 *
 * Requires npm scripts:
 *   "db:knex:reseed"
 *   "codegen:filters:knex"
 *
 * The app must be exported from "src/api/app" (default export or named `app`).
 */
import { spawnSync } from "node:child_process";
import type { Express } from "express";
import request from "supertest";

const runScript = (script: string) => {
    const res = spawnSync(
        process.platform === "win32" ? "npm.cmd" : "npm",
        ["run", script],
        { stdio: "inherit", cwd: process.cwd(), env: process.env }
    );
    if (res.status !== 0) {
        throw new Error(`Failed running npm script: ${script}`);
    }
};

describe("/v1/knex/users (integration)", () => {
    let app: Express;

    beforeAll(async () => {
        // 1) Codegen before app import so generated resolvers exist
        runScript("codegen:filters:knex");
        // 2) Reseed DB
        runScript("db:knex:reseed");

        // 3) Dynamically import AFTER codegen/reseed
        const mod = await import("src/api/app");
        app = (mod.default ?? mod.app) as Express;
        if (!app) throw new Error("Could not load Express app from src/api/app");
    }, 120_000);

    it("returns all users when filter is an empty object", async () => {
        const res = await request(app)
            .post("/v1/knex/users")
            .send({ filter: {} })
            .set("content-type", "application/json");

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("data");
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThanOrEqual(1);

        const u = res.body.data[0];
        expect(typeof u.email).toBe("string");
    });

    it("applies a compound filter (age >= 30 AND (role == admin OR isActive == false))", async () => {
        const filter = {
            and: [
                { field: "age", op: "gte", value: 30 },
                {
                    or: [
                        { field: "role", op: "eq", value: "admin" },
                        { field: "isActive", op: "eq", value: false },
                    ],
                },
            ],
        };

        const res = await request(app)
            .post("/v1/knex/users")
            .send({ filter })
            .set("content-type", "application/json");

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body?.data)).toBe(true);
        for (const row of res.body.data as any[]) {
            const ageOK = typeof row.age === "number" ? row.age >= 30 : true;
            const roleIsAdmin =
                typeof row.role === "string"
                    ? row.role.toLowerCase() === "admin"
                    : false;
            const isActiveFalse =
                row.isActive === false || row.isActive === 0 /* sqlite booleanish */;
            expect(ageOK && (roleIsAdmin || isActiveFalse)).toBe(true);
        }
    });

    it("rejects invalid filter JSON string with 400", async () => {
        const res = await request(app)
            .post("/v1/knex/users")
            .send({ filter: "{not: valid: json}" })
            .set("content-type", "application/json");

        expect(res.status).toBe(400);
    });
});
