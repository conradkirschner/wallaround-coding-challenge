
/* THIS FILE IS AUTO-GENERATED (PRISMA). DO NOT EDIT. */

import type { Prisma } from '@prisma/client';

/** Local base expression type for this entity */
type Expr = Prisma.PostWhereInput;

/** Export an entity-scoped alias to avoid symbol collisions in barrels */
export type PostExpr = Expr;

/** Boolean groups */
const AND = (parts: ReadonlyArray<Expr>): Expr => ({ AND: parts as Expr[] });
const OR  = (parts: ReadonlyArray<Expr>): Expr => ({ OR:  parts as Expr[] });

export namespace PostFilterQueryPrisma {
  export const group = { and: AND, or: OR } as const;
  export const all = (...exprs: ReadonlyArray<Expr>): Expr => AND(exprs);
  export const any = (...exprs: ReadonlyArray<Expr>): Expr => OR(exprs);


  type T_title = string;

  /** Prisma comparators for 'title' */
  export const title = {

    eq:  (v: T_title): Expr => ({ title: { equals: v } }),


    neq: (v: T_title): Expr => ({ title: { not: v as any } }),






    // Accept readonly arrays; Prisma wants a mutable array here
    in:  (values: ReadonlyArray<T_title>): Expr => ({
      title: { in: Array.from(values) }
    }),



    contains: (s: string): Expr => ({ title: { contains: s } }),


    starts_with: (s: string): Expr => ({ title: { startsWith: s } }),


    ends_with:   (s: string): Expr => ({ title: { endsWith: s } }),



  } as const;


  type T_content = string;

  /** Prisma comparators for 'content' */
  export const content = {

    eq:  (v: T_content): Expr => ({ content: { equals: v } }),


    neq: (v: T_content): Expr => ({ content: { not: v as any } }),






    // Accept readonly arrays; Prisma wants a mutable array here
    in:  (values: ReadonlyArray<T_content>): Expr => ({
      content: { in: Array.from(values) }
    }),



    contains: (s: string): Expr => ({ content: { contains: s } }),


    starts_with: (s: string): Expr => ({ content: { startsWith: s } }),


    ends_with:   (s: string): Expr => ({ content: { endsWith: s } }),


    is_null: (): Expr => ({ content: null }),


    is_not_null: (): Expr => ({ content: { not: null } }),

  } as const;


  type T_published = boolean;

  /** Prisma comparators for 'published' */
  export const published = {

    eq:  (v: T_published): Expr => ({ published: { equals: v } }),


    neq: (v: T_published): Expr => ({ published: { not: v as any } }),












  } as const;


  type T_createdAt = Date | string;

  /** Prisma comparators for 'createdAt' */
  export const createdAt = {

    eq:  (v: T_createdAt): Expr => ({ createdAt: { equals: v } }),


    neq: (v: T_createdAt): Expr => ({ createdAt: { not: v as any } }),


    gt:  (v: T_createdAt): Expr => ({ createdAt: { gt: v as any } }),


    gte: (v: T_createdAt): Expr => ({ createdAt: { gte: v as any } }),


    lt:  (v: T_createdAt): Expr => ({ createdAt: { lt: v as any } }),


    lte: (v: T_createdAt): Expr => ({ createdAt: { lte: v as any } }),



    between: (a: T_createdAt, b: T_createdAt): Expr => ({
      createdAt: { gte: a as any, lte: b as any }
    }),






  } as const;


}
