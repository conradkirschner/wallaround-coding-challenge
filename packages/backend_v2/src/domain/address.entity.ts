import { randomUUID } from 'node:crypto';
import {
    Entity, PrimaryKey, Property, Index, OneToOne, OptionalProps,
} from '@mikro-orm/core';
import { Selectable, Sortable } from 'src/filtering/expose';
import { Filterable } from 'src/filtering/filterable';
import type { Uuid } from './user.entity';
import { User } from './user.entity';


@Entity({ tableName: 'addresses' })
@Index({ properties: ['city'] })
@Index({ properties: ['country'] })
export class Address {
    [OptionalProps]?: 'id' | 'createdAt' | 'updatedAt';

    @Selectable()
    @PrimaryKey({ type: 'uuid' })
    id: Uuid = randomUUID();

    @Selectable() @Sortable()
    @Filterable({ type: 'string', operators: ['eq','neq','in','contains','starts_with','ends_with'] })
    @Property({ type: 'string' })
    street1?: string;

    @Selectable()
    @Filterable({ type: 'string', operators: ['eq','neq','in','contains','starts_with','ends_with','is_null','is_not_null'] })
    @Property({ type: 'string', nullable: true })
    street2?: string;

    @Selectable()
    @Filterable({ type: 'string', operators: ['eq','neq','in','contains','starts_with','ends_with'] })
    @Property({ type: 'string' })
    postalCode!: string;

    @Selectable() @Sortable()
    @Filterable({ type: 'string', operators: ['eq','neq','in','contains','starts_with','ends_with'] })
    @Property({ type: 'string' })
    city!: string;

    @Selectable() @Sortable()
    @Filterable({ type: 'string', operators: ['eq','neq','in','contains','starts_with','ends_with'] })
    @Property({ type: 'string' })
    country!: string;

    @Selectable() @Sortable()
    @Property({ type: Date })
    createdAt: Date = new Date();

    @Selectable() @Sortable()
    @Property({ type: Date, onUpdate: () => new Date() })
    updatedAt: Date = new Date();

    /**
     * Inverse side of 1:1 — points back to User.address (the owner).
     */
    @OneToOne({
        entity: () => User,
        mappedBy: (u) => u.address,   // inverse side
        nullable: true,
    })
    user?: User;
}
