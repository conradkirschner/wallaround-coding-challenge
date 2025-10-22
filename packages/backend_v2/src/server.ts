// src/server.ts
import 'reflect-metadata';
import express from 'express';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import mikroConfig from './mikro-orm.config';
import { usersFilterController } from './routes/users.controller';

async function main() {
    const orm = await MikroORM.init(mikroConfig);
    const app = express();
    app.use(express.json());
    app.use((_, __, next) => RequestContext.create(orm.em, next));

    app.post('/users/filter', usersFilterController(orm.em));

    const port = Number(process.env.PORT ?? 3000);
    app.listen(port, () => console.log(`HTTP listening on :${port}`));
}

main();
