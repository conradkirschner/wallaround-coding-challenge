import 'reflect-metadata';

const SELECTABLE_KEY = 'query:selectable';
const SORTABLE_KEY   = 'query:sortable';

type FieldSet = ReadonlySet<string>;

export function Selectable() {
    return (target: object, propertyKey: string | symbol) => {
        const ctor = (target as { constructor: Function }).constructor;
        const prev: Set<string> = new Set((Reflect.getMetadata(SELECTABLE_KEY, ctor) as string[] | undefined) ?? []);
        prev.add(String(propertyKey));
        Reflect.defineMetadata(SELECTABLE_KEY, Array.from(prev), ctor);
    };
}

export function Sortable() {
    return (target: object, propertyKey: string | symbol) => {
        const ctor = (target as { constructor: Function }).constructor;
        const prev: Set<string> = new Set((Reflect.getMetadata(SORTABLE_KEY, ctor) as string[] | undefined) ?? []);
        prev.add(String(propertyKey));
        Reflect.defineMetadata(SORTABLE_KEY, Array.from(prev), ctor);
    };
}

export function getSelectableFields<T>(ctor: new (...args: never[]) => T): FieldSet {
    const arr = (Reflect.getMetadata(SELECTABLE_KEY, ctor) as string[] | undefined) ?? [];
    return new Set(arr);
}

export function getSortableFields<T>(ctor: new (...args: never[]) => T): FieldSet {
    const arr = (Reflect.getMetadata(SORTABLE_KEY, ctor) as string[] | undefined) ?? [];
    return new Set(arr);
}
