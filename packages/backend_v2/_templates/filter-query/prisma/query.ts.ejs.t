---
to: <%= out %>/<%= entity %>PrismaQuery.ts
---
/* THIS FILE IS AUTO-GENERATED. DO NOT EDIT. */

import type { Prisma } from '@prisma/client';

/** Entity-scoped Prisma helper types (unique per entity to avoid export collisions) */
export type Where_<%= entity %> = Prisma.<%= entity %>WhereInput;
export type OrderBy_<%= entity %> = Prisma.<%= entity %>OrderByWithRelationInput;
export type Select_<%= entity %> = Prisma.<%= entity %>Select;

/** Relation quantifiers applicable to to-many & n:n paths */
export type Quantifier_<%= entity %> = 'some' | 'every' | 'none';

/** Tiny deep-pick helper from a string path list (builds the "plain" result shape) */
type KeyOf<T> = Extract<keyof T, string>;
type Tail<S extends readonly unknown[]> = S extends readonly [any, ...infer R] ? R : [];
type Split<Path extends string> =
  Path extends `${infer A}.${infer B}` ? [A, ...Split<B>] : [Path];

type PathPick<T, Parts extends readonly string[]> =
  Parts extends readonly [infer H extends string, ...infer R extends string[]]
    ? H extends KeyOf<T>
      ? R['length'] extends 0
        ? { [K in H]: T[K] }
        : T[H] extends (infer E)[]
          ? { [K in H]: PathPick<E, R>[] }
          : T[H] extends object
            ? { [K in H]: PathPick<T[H], R> }
            : { [K in H]: T[H] }
      : {}
    : {};

type Merge<A, B> = {
  [K in keyof A | keyof B]:
    K extends keyof B
      ? K extends keyof A
        ? A[K] extends any[] ? A[K]
          : A[K] extends object ? (A[K] & B[K])
          : B[K]
        : B[K]
      : K extends keyof A ? A[K] : never
};

type Obj = Record<string, unknown>;
type AssignAll<A extends Obj[]> =
  A extends readonly [infer H extends Obj, ...infer R extends Obj[]]
    ? Merge<H, AssignAll<R>>
    : {};

export type ResultFromSelect_<%= entity %><TModel, S extends readonly string[]> =
  AssignAll<{ [I in keyof S]:
    S[I] extends string ? PathPick<TModel, Split<S[I]>> : {}
  }[number] extends infer E ? [E] extends [never] ? {} : E : {}>;
