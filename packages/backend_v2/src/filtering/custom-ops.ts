// src/filtering/custom-ops.ts
import type { FieldType } from './filterable';
import type { Primitive } from './ast';

/** Like-operations we support generically */
export type LikeOp = 'contains' | 'starts_with' | 'ends_with';

/** ORM-agnostic intermediate representation (IR) for a single custom operation or a group */
export type IR =
    | { and: readonly IR[] }
    | { or: readonly IR[] }
    | { op: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte'; field: string; value: Primitive }
    | { op: 'in'; field: string; values: readonly Primitive[] }
    | { op: 'between'; field: string; a: Primitive; b: Primitive }
    | { op: LikeOp; field: string; value: string; caseInsensitive?: boolean }
    | { op: 'is_null'; field: string }
    | { op: 'is_not_null'; field: string };

/** FieldType → value type (what customs should accept for that type) */
type FieldValueMap = {
    string: string;
    number: number;
    boolean: boolean;
    date: Date | string | number; // accept parseable inputs
    enum: string;                 // enums are strings at runtime
    uuid: string;                 // uuid stored as string
};
export type FieldValue<T extends FieldType> = FieldValueMap[T];

/** Emitter signatures (custom ops can choose any arity) */
export type Nullary = () => IR;
export type Unary<T = Primitive> = (a: T) => IR;
export type BinaryRange<T = Primitive> = (a: T, b: T) => IR;
export type ArrayArg<T = Primitive> = (items: readonly T[]) => IR;

type EmitterFor<T> = Nullary | Unary<T> | BinaryRange<T> | ArrayArg<T>;
/** Untyped (wider) emitter for maps; public type remains for flexibility */
export type Emitter = EmitterFor<Primitive>;

/**
 * Custom operator registry that supports:
 *  - per-field operators (highest precedence)
 *  - per-type operators (fallback when field-specific not present)
 * Names are case-insensitive.
 */
export class CustomOpRegistry {
    #byField: Map<string, Map<string, Emitter>> = new Map();
    #byType: Map<FieldType, Map<string, Emitter>> = new Map();

    registerForField(field: string, name: string, emit: Emitter): void {
        const key = name.toLowerCase();
        const inner = this.#byField.get(field) ?? new Map<string, Emitter>();
        inner.set(key, emit);
        this.#byField.set(field, inner);
    }

    /** Strongly-typed registration for a given FieldType */
    registerForType<T extends FieldType>(type: T, name: string, emit: EmitterFor<FieldValue<T>>): void {
        const key = name.toLowerCase();
        const inner = this.#byType.get(type) ?? new Map<string, Emitter>();
        // Store as wider Emitter; type safety enforced at call site via generic
        inner.set(key, emit as unknown as Emitter);
        this.#byType.set(type, inner);
    }

    get(field: string, type: FieldType, name: string): Emitter | undefined {
        const key = name.toLowerCase();
        const f = this.#byField.get(field)?.get(key);
        if (f) return f;
        return this.#byType.get(type)?.get(key);
    }
}

/** Tiny IR builder helpers so customs are easy to write */
export const ops = {
    // logical
    and: (...parts: readonly IR[]): IR => ({ and: parts }),
    or:  (...parts: readonly IR[]): IR => ({ or: parts }),

    // comparisons
    eq:  (field: string, value: Primitive): IR => ({ op: 'eq', field, value }),
    neq: (field: string, value: Primitive): IR => ({ op: 'neq', field, value }),
    gt:  (field: string, value: Primitive): IR => ({ op: 'gt', field, value }),
    gte: (field: string, value: Primitive): IR => ({ op: 'gte', field, value }),
    lt:  (field: string, value: Primitive): IR => ({ op: 'lt', field, value }),
    lte: (field: string, value: Primitive): IR => ({ op: 'lte', field, value }),

    // collections / ranges
    in: (field: string, values: readonly Primitive[]): IR => ({ op: 'in', field, values }),
    between: (field: string, a: Primitive, b: Primitive): IR => ({ op: 'between', field, a, b }),

    // string likes
    contains:   (field: string, value: string, caseInsensitive = false): IR => ({ op: 'contains', field, value, caseInsensitive }),
    // startsWith: (field: string, value: string, caseInsensitive = false): IR => ({ op: 'starts_with', field, value, caseInsensitive }),
    endsWith:   (field: string, value: string, caseInsensitive = false): IR => ({ op: 'ends_with', field, value, caseInsensitive }),

    // null checks
    isNull:  (field: string): IR => ({ op: 'is_null', field }),
    notNull: (field: string): IR => ({ op: 'is_not_null', field }),
} as const;

/**
 * Useful default custom ops (ORM-agnostic):
 *  - 'ilike' for case-insensitive contains on string fields
 *  - 'on' for date fields (>= dayStart AND < nextDay)
 */
export function registerDefaultCustoms(reg: CustomOpRegistry): void {
    // precise typing → no implicit any
    reg.registerForType('string', 'ilike', (v: string) =>
        ops.contains('__FIELD__', v, true),
    );

    reg.registerForType('date', 'on', (v: Date | string | number) => {
        const d = v instanceof Date ? v : new Date(String(v));
        const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
        const next  = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1, 0, 0, 0, 0));
        return ops.and(
            ops.gte('__FIELD__', start),
            ops.lt('__FIELD__', next),
        );
    });
}
