// src/service/UserService
import {User} from 'src/domain/user.entity';
import type {FilterInput} from 'src/filtering/ast';
import {CustomOpRegistry, ops, registerDefaultCustoms} from 'src/filtering/custom-ops';
import {resolveUser as resolveUsers} from "../generated/knex";
import {sqlCtx} from "../../scripts/knex/bootstrap.sql";

/* Example for registering a Custom Op*/
const registry = new CustomOpRegistry();
registerDefaultCustoms(registry);
registry.registerForField('age', 'adult', () => ops.gte('age', 18));

export const getFilteredUserResponse = async (filter: FilterInput | undefined) =>{
    const result = await resolveUsers(sqlCtx, User, filter, undefined, {
        limits: {maxDepth: 6, maxNodes: 200, maxInSize: 500},
        query: {
            select: ['email', 'displayName', 'age', 'role', 'isActive', 'createdAt', 'role', 'id'],
            sort: [{field: 'createdAt', direction: 'desc'}],
            limit: 50,
            offset: 0,
        },
        security: {requireSelectableForFilter: true},
    });
console.info(result);
return result;
}
