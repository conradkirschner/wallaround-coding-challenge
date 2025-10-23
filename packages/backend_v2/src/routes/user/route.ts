import { defaultEndpointsFactory } from "express-zod-api";
import createHttpError from "http-errors";
import { z } from "zod";

// filter AST types
import type { FilterNode, FilterInput } from "src/filtering/ast";

// service
import { getFilteredUserResponse } from "src/service/UserService";

// shared Zod schemas for input/output
import {
    FilterNodeSchema,
    UserOutSchema,
    type UserResponse,
    UsersInputSchema,
} from "./zodSchema";

/** Common handler */
async function handleUsers(input: z.infer<typeof UsersInputSchema>, logger: unknown) {
    const { filter } = input;

    let parsedFilter: FilterNode | undefined;

    if (typeof filter === "string") {
        const trimmed = filter.trim();
        if (trimmed === "" || trimmed === "{}") {
            parsedFilter = undefined;                 // treat empty string / "{}" as no filter
        } else {
            let json: unknown;
            try {
                json = JSON.parse(trimmed);
            } catch {
                throw createHttpError(400, "Invalid filter: expected valid JSON string");
            }
            // If the parsed object is empty, treat as no filter; otherwise validate as FilterNode
            parsedFilter = (json && typeof json === "object" && Object.keys(json as object).length === 0)
                ? undefined
                : FilterNodeSchema.parse(json);
        }
    } else if (filter && typeof filter === "object") {
        // If it's exactly {}, treat as no filter
        parsedFilter = Object.keys(filter as object).length === 0
            ? undefined
            : FilterNodeSchema.parse(filter);
    } else {
        parsedFilter = undefined;
    }

    try {
        const rows = await getFilteredUserResponse(parsedFilter);
        (logger as any)?.debug?.(`users endpoint returned ${rows.length} rows`);
        return { data: rows as unknown as UserResponse[] };
    } catch (e: any) {
        const code = e?.code as string | undefined;
        if (code && code.startsWith("FILTER_")) throw createHttpError(400, e.message);
        throw e;
    }
}

// GET endpoint
export const usersGetEndpoint = defaultEndpointsFactory.build({
    method: "get",
    input: UsersInputSchema,
    output: z.object({ data: z.array(UserOutSchema) }),
    handler: async ({ input, logger }) => handleUsers(input, logger),
});

// POST endpoint
export const usersPostEndpoint = defaultEndpointsFactory.build({
    method: "post",
    input: UsersInputSchema,
    output: z.object({ data: z.array(UserOutSchema) }),
    handler: async ({ input, logger }) => handleUsers(input, logger),
});
