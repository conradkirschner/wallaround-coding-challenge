// tests/integration/users.e2e.test.ts
import "reflect-metadata";
import { execSync } from "node:child_process";
import { testEndpoint } from "express-zod-api";
import { usersPostEndpoint } from "../../src/routes/user";
// close the Knex pool after all tests:
import { sqlCtx } from "../../scripts/knex/bootstrap.sql";

describe("/v1/knex/users (integration via testEndpoint)", () => {
    beforeAll(() => {
        execSync("npm run codegen:filters:knex:ci", { stdio: "inherit" });
        execSync("npm run db:knex:reseed", { stdio: "inherit" });
    });

    afterAll(async () => {
        // ensure DB connections are closed so Jest can exit
        try {
            await (sqlCtx.knex as any)?.client?.destroy?.();
        } catch {
            // ignore
        }
    });

    it("returns all users when filter is an empty object", async () => {
        const { responseMock, loggerMock } = await testEndpoint({
            endpoint: usersPostEndpoint,
            requestProps: { method: "POST", body: { filter: {} } },
            configProps: { logger: { level: "silent" } },
        });

        expect(loggerMock._getLogs().error).toHaveLength(0);
        expect(responseMock._getStatusCode()).toBe(200);

        // express-zod-api envelope: { status, data: <handlerResult> }
        const body = responseMock._getJSONData();
        expect(body).toHaveProperty("status", "success");
        expect(body).toHaveProperty("data");

        const payload = body.data;             // your handler's return
        expect(Array.isArray(payload.data)).toBe(true);
        expect(payload.data.length).toBeGreaterThan(0);
    });

    it('applies compound filter: age >= 30 AND (role == "admin" OR isActive == false)', async () => {
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

        const { responseMock, loggerMock } = await testEndpoint({
            endpoint: usersPostEndpoint,
            requestProps: { method: "POST", body: { filter } },
            configProps: { logger: { level: "silent" } },
        });

        expect(loggerMock._getLogs().error).toHaveLength(0);
        expect(responseMock._getStatusCode()).toBe(200);

        const body = responseMock._getJSONData();
        const payload = body.data; // unwrap your handler result

        expect(Array.isArray(payload.data)).toBe(true);

        for (const row of payload.data as any[]) {
            const ageOK = typeof row.age === "number" ? row.age >= 30 : true;
            const roleIsAdmin =
                typeof row.role === "string" ? row.role.toLowerCase() === "admin" : false;
            // sqlite boolean can be 0/1, accept both
            const inactive = row.isActive === false || row.isActive === 0;
            expect(ageOK && (roleIsAdmin || inactive)).toBe(true);
        }
    });

    it("rejects invalid filter JSON string with 400", async () => {
        const { responseMock } = await testEndpoint({
            endpoint: usersPostEndpoint,
            requestProps: { method: "POST", body: { filter: "{bad json" } },
            configProps: { logger: { level: "silent" } },
        });

        expect(responseMock._getStatusCode()).toBe(400);
    });
});
