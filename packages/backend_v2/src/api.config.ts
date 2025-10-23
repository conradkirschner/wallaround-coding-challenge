import {createConfig} from "express-zod-api";

const PORT = parseInt(process.env.PORT ?? "8080");

export const config = createConfig({
    http: { listen: PORT}, // port, UNIX socket or Net::ListenOptions
    cors: false, // decide whether to enable CORS
});