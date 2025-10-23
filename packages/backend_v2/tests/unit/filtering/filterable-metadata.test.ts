// tests/unit/filtering/filterable-metadata.test.ts
import 'reflect-metadata';
import { jest } from '@jest/globals';
import {
    Filterable,
    FilterableRelation,
    getFilterableMetadata,
    getFilterableRelationsMeta,
} from '../../../src/filtering/filterable';

// Assertion helper must be a declaration (or have explicit type on the const)
function assertDefined<T>(v: T | undefined): asserts v is T {
    expect(v).toBeDefined();
}

describe('filterable metadata decorators', () => {
    it('collects scalar fields and freezes operator/enum arrays', () => {
        class Address {
            @Filterable({ type: 'string', operators: ['eq', 'contains'] as const })
            city!: string;

            
            @Filterable({ type: 'number', operators: ['eq', 'between'] as const })
            zip!: number;

            
            @Filterable({
                type: 'enum',
                operators: ['eq', 'in'] as const,
                enumValues: ['HOME', 'WORK'] as const,
            })
            type!: 'HOME' | 'WORK';
        }

        const meta = getFilterableMetadata(Address);

        expect(meta).toEqual({
            city: { type: 'string', operators: ['eq', 'contains'] },
            zip: { type: 'number', operators: ['eq', 'between'] },
            type: { type: 'enum', operators: ['eq', 'in'], enumValues: ['HOME', 'WORK'] },
        });

        // Narrow (required when noUncheckedIndexedAccess = true)
        const city = meta.city;
        const zip = meta.zip;
        const typeDef = meta.type;
        assertDefined(city);
        assertDefined(zip);
        assertDefined(typeDef);
        assertDefined(typeDef.enumValues);

        // Frozen arrays (immutability)
        expect(Object.isFrozen(city.operators)).toBe(true);
        expect(Object.isFrozen(zip.operators)).toBe(true);
        expect(Object.isFrozen(typeDef.operators)).toBe(true);
        expect(Object.isFrozen(typeDef.enumValues)).toBe(true);

        // Attempted mutation must throw on frozen arrays
        expect(() => {
            (city.operators as string[]).push('gt');
        }).toThrow(TypeError);

        expect(() => {
            (typeDef.enumValues as string[]).push('OTHER');
        }).toThrow(TypeError);
    });

    it('imports relations lazily and respects depth > 0', () => {
        class Post {
            
            @Filterable({ type: 'string', operators: ['contains', 'eq'] as const })
            title!: string;

            
            @Filterable({ type: 'boolean', operators: ['eq'] as const })
            published!: boolean;

            
            @Filterable({ type: 'date', operators: ['between', 'gte', 'lte'] as const })
            createdAt!: Date;
        }

        class Address {
            
            @Filterable({ type: 'string', operators: ['eq', 'contains'] as const })
            city!: string;

            
            @Filterable({ type: 'number', operators: ['eq', 'between'] as const })
            zip!: number;
        }

        // Correct jest.fn typing: single generic is the function type
        const getAddressTarget = jest.fn<() => Function>(() => Address);
        const getPostTarget = jest.fn<() => Function>(() => Post);

        class User {
            
            @Filterable({ type: 'string', operators: ['eq', 'contains'] as const })
            name!: string;

            
            @Filterable({ type: 'number', operators: ['gt', 'gte', 'lt', 'lte', 'eq'] as const })
            age!: number;

            
            @Filterable({
                type: 'enum',
                operators: ['eq', 'in'] as const,
                enumValues: ['ADMIN', 'USER'] as const,
            })
            role!: 'ADMIN' | 'USER';

            
            @FilterableRelation(getAddressTarget, { kind: 'one', depth: 1 })
            address?: Address;

            
            @FilterableRelation(getPostTarget, { kind: 'many', depth: 1, defaultQuantifier: 'some' })
            posts?: Post[];

            
            @FilterableRelation(getAddressTarget, { kind: 'one', depth: 0 })
            altAddress?: Address;
        }

        // Laziness: defining relations shouldn't resolve targets yet
        expect(getAddressTarget).not.toHaveBeenCalled();
        expect(getPostTarget).not.toHaveBeenCalled();

        const relMeta = getFilterableRelationsMeta(User);
        expect(relMeta).toEqual({
            address: { kind: 'one' },
            posts: { kind: 'many', defaultQuantifier: 'some' },
            altAddress: { kind: 'one' },
        });

        const meta = getFilterableMetadata(User);

        expect(getAddressTarget).toHaveBeenCalledTimes(1);
        expect(getPostTarget).toHaveBeenCalledTimes(1);

        expect(meta).toEqual({
            name: { type: 'string', operators: ['eq', 'contains'] },
            age: { type: 'number', operators: ['gt', 'gte', 'lt', 'lte', 'eq'] },
            role: { type: 'enum', operators: ['eq', 'in'], enumValues: ['ADMIN', 'USER'] },

            'address.city': { type: 'string', operators: ['eq', 'contains'] },
            'address.zip': { type: 'number', operators: ['eq', 'between'] },

            'posts.title': { type: 'string', operators: ['contains', 'eq'] },
            'posts.published': { type: 'boolean', operators: ['eq'] },
            'posts.createdAt': { type: 'date', operators: ['between', 'gte', 'lte'] },
        });

        // Ensure depth=0 relation didn't leak dotted fields
        expect(Object.keys(meta).some(k => k.startsWith('altAddress.'))).toBe(false);
    });

    it('returns empty objects for classes without metadata', () => {
        class Empty {}
        expect(getFilterableMetadata(Empty)).toEqual({});
        expect(getFilterableRelationsMeta(Empty)).toEqual({});
    });
});
