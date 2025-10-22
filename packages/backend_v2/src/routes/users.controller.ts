// src/routes/users.controller.ts
import type { Request, Response } from 'express';
import type { EntityManager } from '@mikro-orm/core';
import { findUsers } from './users.resolver';
import type { FilterInput } from '../filtering/ast';

export function usersFilterController(em: EntityManager) {
    return async (req: Request, res: Response) => {
        const filter = (req.body?.filter ?? req.body) as FilterInput | undefined;
        try {
            const users = await findUsers(em, filter);
            res.status(200).json(users);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Filter processing failed';
            res.status(400).json({ code: 'FILTER_INVALID', message });
        }
    };
}
