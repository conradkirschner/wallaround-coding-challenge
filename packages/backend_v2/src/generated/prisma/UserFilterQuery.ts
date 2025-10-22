
/* THIS FILE IS AUTO-GENERATED (PRISMA). DO NOT EDIT. */

import type { Prisma } from '@prisma/client';

/** Local base expression type for this entity */
type Expr = Prisma.UserWhereInput;

/** Export an entity-scoped alias to avoid symbol collisions in barrels */
export type UserExpr = Expr;

/** Boolean groups */
const AND = (parts: ReadonlyArray<Expr>): Expr => ({ AND: parts as Expr[] });
const OR  = (parts: ReadonlyArray<Expr>): Expr => ({ OR:  parts as Expr[] });

export namespace UserFilterQueryPrisma {
  export const group = { and: AND, or: OR } as const;
  export const all = (...exprs: ReadonlyArray<Expr>): Expr => AND(exprs);
  export const any = (...exprs: ReadonlyArray<Expr>): Expr => OR(exprs);


  type T_age = number;

  /** Prisma comparators for 'age' */
  export const age = {

    eq:  (v: T_age): Expr => ({ age: { equals: v } }),


    neq: (v: T_age): Expr => ({ age: { not: v as any } }),


    gt:  (v: T_age): Expr => ({ age: { gt: v as any } }),


    gte: (v: T_age): Expr => ({ age: { gte: v as any } }),


    lt:  (v: T_age): Expr => ({ age: { lt: v as any } }),


    lte: (v: T_age): Expr => ({ age: { lte: v as any } }),


    // Accept readonly arrays; Prisma wants a mutable array here
    in:  (values: ReadonlyArray<T_age>): Expr => ({
      age: { in: Array.from(values) }
    }),


    between: (a: T_age, b: T_age): Expr => ({
      age: { gte: a as any, lte: b as any }
    }),






  } as const;


  type T_role = "admin" | "user" | "editor";

  /** Prisma comparators for 'role' */
  export const role = {

    eq:  (v: T_role): Expr => ({ role: { equals: v } }),


    neq: (v: T_role): Expr => ({ role: { not: v as any } }),






    // Accept readonly arrays; Prisma wants a mutable array here
    in:  (values: ReadonlyArray<T_role>): Expr => ({
      role: { in: Array.from(values) }
    }),







  } as const;


  type T_isActive = boolean;

  /** Prisma comparators for 'isActive' */
  export const isActive = {

    eq:  (v: T_isActive): Expr => ({ isActive: { equals: v } }),


    neq: (v: T_isActive): Expr => ({ isActive: { not: v as any } }),












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
