// src/routes/users.resolver.ts (MikroORM)
import type { EntityManager } from '@mikro-orm/core';
import { User } from 'src/domain/user.entity';
import type { FilterInput } from 'src/filtering/ast';
import { CustomOpRegistry, registerDefaultCustoms, ops } from 'src/filtering/custom-ops';
import { resolve } from '../generated/mikroorm/UserResolver';

const registry = new CustomOpRegistry();
registerDefaultCustoms(registry);
// custom: "adult" => age >= 18
registry.registerForField('age', 'adult', () => ops.gte('age', 18));

export const findUsers = (em: EntityManager, filter: FilterInput) =>
    resolve(em, User, filter, registry);
