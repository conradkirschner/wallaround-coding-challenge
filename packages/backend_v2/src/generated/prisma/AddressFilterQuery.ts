
/* THIS FILE IS AUTO-GENERATED (PRISMA). DO NOT EDIT. */

import type { Prisma } from '@prisma/client';

/** Local base expression type for this entity */
type Expr = Prisma.AddressWhereInput;

/** Export an entity-scoped alias to avoid symbol collisions in barrels */
export type AddressExpr = Expr;

/** Boolean groups */
const AND = (parts: ReadonlyArray<Expr>): Expr => ({ AND: parts as Expr[] });
const OR  = (parts: ReadonlyArray<Expr>): Expr => ({ OR:  parts as Expr[] });

export namespace AddressFilterQueryPrisma {
  export const group = { and: AND, or: OR } as const;
  export const all = (...exprs: ReadonlyArray<Expr>): Expr => AND(exprs);
  export const any = (...exprs: ReadonlyArray<Expr>): Expr => OR(exprs);


  type T_street1 = string;

  /** Prisma comparators for 'street1' */
  export const street1 = {

    eq:  (v: T_street1): Expr => ({ street1: { equals: v } }),


    neq: (v: T_street1): Expr => ({ street1: { not: v as any } }),






    // Accept readonly arrays; Prisma wants a mutable array here
    in:  (values: ReadonlyArray<T_street1>): Expr => ({
      street1: { in: Array.from(values) }
    }),



    contains: (s: string): Expr => ({ street1: { contains: s } }),


    starts_with: (s: string): Expr => ({ street1: { startsWith: s } }),


    ends_with:   (s: string): Expr => ({ street1: { endsWith: s } }),



  } as const;


  type T_street2 = string;

  /** Prisma comparators for 'street2' */
  export const street2 = {

    eq:  (v: T_street2): Expr => ({ street2: { equals: v } }),


    neq: (v: T_street2): Expr => ({ street2: { not: v as any } }),






    // Accept readonly arrays; Prisma wants a mutable array here
    in:  (values: ReadonlyArray<T_street2>): Expr => ({
      street2: { in: Array.from(values) }
    }),



    contains: (s: string): Expr => ({ street2: { contains: s } }),


    starts_with: (s: string): Expr => ({ street2: { startsWith: s } }),


    ends_with:   (s: string): Expr => ({ street2: { endsWith: s } }),


    is_null: (): Expr => ({ street2: null }),


    is_not_null: (): Expr => ({ street2: { not: null } }),

  } as const;


  type T_postalCode = string;

  /** Prisma comparators for 'postalCode' */
  export const postalCode = {

    eq:  (v: T_postalCode): Expr => ({ postalCode: { equals: v } }),


    neq: (v: T_postalCode): Expr => ({ postalCode: { not: v as any } }),






    // Accept readonly arrays; Prisma wants a mutable array here
    in:  (values: ReadonlyArray<T_postalCode>): Expr => ({
      postalCode: { in: Array.from(values) }
    }),



    contains: (s: string): Expr => ({ postalCode: { contains: s } }),


    starts_with: (s: string): Expr => ({ postalCode: { startsWith: s } }),


    ends_with:   (s: string): Expr => ({ postalCode: { endsWith: s } }),



  } as const;


  type T_city = string;

  /** Prisma comparators for 'city' */
  export const city = {

    eq:  (v: T_city): Expr => ({ city: { equals: v } }),


    neq: (v: T_city): Expr => ({ city: { not: v as any } }),






    // Accept readonly arrays; Prisma wants a mutable array here
    in:  (values: ReadonlyArray<T_city>): Expr => ({
      city: { in: Array.from(values) }
    }),



    contains: (s: string): Expr => ({ city: { contains: s } }),


    starts_with: (s: string): Expr => ({ city: { startsWith: s } }),


    ends_with:   (s: string): Expr => ({ city: { endsWith: s } }),



  } as const;


  type T_country = string;

  /** Prisma comparators for 'country' */
  export const country = {

    eq:  (v: T_country): Expr => ({ country: { equals: v } }),


    neq: (v: T_country): Expr => ({ country: { not: v as any } }),






    // Accept readonly arrays; Prisma wants a mutable array here
    in:  (values: ReadonlyArray<T_country>): Expr => ({
      country: { in: Array.from(values) }
    }),



    contains: (s: string): Expr => ({ country: { contains: s } }),


    starts_with: (s: string): Expr => ({ country: { startsWith: s } }),


    ends_with:   (s: string): Expr => ({ country: { endsWith: s } }),



  } as const;


}
