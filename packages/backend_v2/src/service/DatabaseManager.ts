import { MikroORM } from "@mikro-orm/core";
import config from '../../src/mikro-orm.config';
import {mikroOrmCtx} from "../filtering/runtime/driver";

/* We use micro orm as example. We start the framework as singleton */
const orm = await MikroORM.init(config);
export const filterContextSingleton = mikroOrmCtx(orm.em.fork());