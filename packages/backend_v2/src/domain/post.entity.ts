import { randomUUID } from 'node:crypto';
import {
    Entity, PrimaryKey, Property, ManyToOne, Index, OptionalProps,
    Rel,
} from '@mikro-orm/core';
import { Selectable, Sortable } from 'src/filtering/expose';
import { Filterable } from 'src/filtering/filterable';
import type { Uuid } from './user.entity';
import { User } from './user.entity';

@Entity({ tableName: 'posts' })
@Index({ properties: ['author'] })
@Index({ properties: ['createdAt'] })
@Index({ properties: ['published'] })
export class Post {
    [OptionalProps]?: 'id' | 'createdAt' | 'updatedAt';

    @Selectable()
    @PrimaryKey({ type: 'uuid' })
    id: Uuid = randomUUID();

    @Selectable() @Sortable()
    @Filterable({ type: 'string', operators: ['eq','neq','in','contains','starts_with','ends_with'] })
    @Property({ type: 'string' })
    title!: string;

    @Selectable()
    @Filterable({ type: 'string', operators: ['eq','neq','in','contains','starts_with','ends_with','is_null','is_not_null'] })
    @Property({ type: 'string', nullable: true })
    content?: string;

    @Selectable() @Sortable()
    @Filterable({ type: 'boolean', operators: ['eq','neq'] })
    @Property({ type: 'boolean', default: false })
    published: boolean = false;

    @Selectable() @Sortable()
    @Filterable({ type: 'date', operators: ['eq','neq','gt','gte','lt','lte','between'] })
    @Property({ type: Date })
    createdAt: Date = new Date();

    @Selectable() @Sortable()
    @Property({ type: Date, onUpdate: () => new Date() })
    updatedAt: Date = new Date();

    @Selectable()
    @ManyToOne(() => User, { nullable: false })
    author!: Rel<User>;
}
