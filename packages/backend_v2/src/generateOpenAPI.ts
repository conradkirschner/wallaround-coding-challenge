import { Documentation } from "express-zod-api";
import {routing} from "./routes.config";
import {config} from "./api.config";

const yamlString = new Documentation({
    routing, // the same routing and config that you use to start the server
    config,
    version: "1.2.3",
    title: "Example API",
    serverUrl: "http://localhost:8019",
    composition: "inline", // optional, or "components" for keeping schemas in a separate dedicated section using refs
    // descriptions: { positiveResponse, negativeResponse, requestParameter, requestBody }, // check out these features
}).getSpecAsYaml();
console.log(yamlString.toString());
process.exit(0); // force exit cause we dont close db connection