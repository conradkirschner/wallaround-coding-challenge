import {DependsOnMethod, Routing } from "express-zod-api";
import {usersGetEndpoint, usersPostEndpoint} from "./routes/user";


export const routing: Routing = {
    v1: {
        knex: {
            users: new DependsOnMethod({
                get: usersGetEndpoint,
                post: usersPostEndpoint,
            }),

        },
    },
};