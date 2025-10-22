import { randomUUID } from 'node:crypto';
import {
    Cascade,
    Entity,
    Enum as MikroEnum,
    Index,
    OneToOne,
    OneToMany,
    Collection,
    OptionalProps,
    PrimaryKey,
    Property,
    Unique,
} from '@mikro-orm/core';
import { Filterable, FilterableRelation } from 'src/filtering/filterable';
import { Selectable, Sortable } from 'src/filtering/expose';
import { Address } from './address.entity';
import { Post } from './post.entity';

export type Uuid = string;

export enum Role {
    Admin = 'admin',
    User = 'user',
    Editor = 'editor',
}

const NUMBER_OPS  = ['eq','neq','gt','gte','lt','lte','between','in','is_null','is_not_null'] as const;
const ENUM_OPS    = ['eq','neq','in','is_null','is_not_null'] as const;
const BOOLEAN_OPS = ['eq','neq','is_null','is_not_null'] as const;
const DATE_OPS    = ['eq','neq','gt','gte','lt','lte','between','in','is_null','is_not_null'] as const;

@Entity({ tableName: 'users' })
@Index({ properties: ['age'] })
@Index({ properties: ['role'] })
@Index({ properties: ['isActive'] })
@Index({ properties: ['createdAt'] })
export class User {
    [OptionalProps]?: 'id' | 'createdAt' | 'updatedAt';

    @Selectable()
    @PrimaryKey({ type: 'uuid' })
    id: Uuid = randomUUID();

    @Selectable()
    @Unique()
    @Property({ type: 'string' })
    email!: string;

    @Selectable()
    @Property({ type: 'string' })
    displayName!: string;

    @Selectable() @Sortable()
    @Filterable({ type: 'number', operators: NUMBER_OPS })
    @Property({ type: 'number' })
    age!: number;

    @Selectable() @Sortable()
    @Filterable({ type: 'enum', operators: ENUM_OPS, enumValues: Object.values(Role) })
    @MikroEnum(() => Role)
    role!: Role;

    @Selectable() @Sortable()
    @Filterable({ type: 'boolean', operators: BOOLEAN_OPS })
    @Property({ type: 'boolean' })
    isActive!: boolean;

    @Selectable() @Sortable()
    @Property({ type: Date, onUpdate: () => new Date() })
    updatedAt: Date = new Date();

    @Selectable() @Sortable()
    @Filterable({ type: 'date', operators: DATE_OPS })
    @Property({ type: Date })
    createdAt: Date = new Date();

    // 1:1 Address — owning side
    @Selectable()
    @OneToOne({
        entity: () => Address,
        inversedBy: (a) => a.user,
        nullable: true,
        cascade: [Cascade.PERSIST, Cascade.REMOVE],
        orphanRemoval: true,
    })
    @FilterableRelation(() => Address, { depth: 1, kind: 'one' })
    address?: Address;

    // 1:n Posts — expose Post scalar fields as dotted (posts.title, posts.published, ...)
    // defaultQuantifier: 'some' ensures Prisma adapter emits posts: { some: {...} } for dotted filters
    @Selectable()
    @OneToMany(() => Post, (p) => p.author, { orphanRemoval: true })
    @FilterableRelation(() => Post, { kind: 'many', depth: 1, defaultQuantifier: 'some' })
    posts = new Collection<Post>(this);
}
