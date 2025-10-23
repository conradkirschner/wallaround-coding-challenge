import 'reflect-metadata';
import 'dotenv/config'

import { createServer } from "express-zod-api";
import { routing } from './routes.config';
import {config} from "./api.config";



void createServer(config, routing);

console.log(`App booted. call it over the http://localhost:${process.env.PORT}`);
