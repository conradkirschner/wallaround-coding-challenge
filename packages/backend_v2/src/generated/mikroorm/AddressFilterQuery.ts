/* THIS FILE IS AUTO-GENERATED. DO NOT EDIT. */

// Value shape compatible with MikroORM where expressions
type Value =
  | string
  | number
  | boolean
  | Date
  | null
  | readonly Value[]
  | { readonly [k: string]: Value };

// Local (non-exported) base expression type
type Expr = Readonly<Record<string, Value>>;

// Export an entity-scoped alias to avoid symbol collisions in barrels
export type AddressExpr = Expr;

const AND = (parts: ReadonlyArray<Expr>): Expr => ({ $and: parts as Expr[] });
const OR  = (parts: ReadonlyArray<Expr>): Expr => ({ $or: parts as Expr[] });

/** Escape % and _ for SQL LIKE (no replaceAll to keep lib target broad) */
const likeEscape = (s: string): string => s.replace(/[%_]/g, (m) => '\\' + m);

/** Parse fields JSON coming from hygen CLI and prep helpers */


export namespace AddressFilterQueryMikroORM {
  export const group = { and: AND, or: OR } as const;
  export const all = (...exprs: ReadonlyArray<Expr>): Expr => AND(exprs);
  export const any = (...exprs: ReadonlyArray<Expr>): Expr => OR(exprs);

  
  
  type T_street1 = string;
  

  /** Ops for 'street1' */
  export const street1 = {
    eq: (v: T_street1): Expr => ({ street1: v }),
    neq: (v: T_street1): Expr => ({ street1: { $ne: v } }),
    
    
    
    
    in: (values: ReadonlyArray<T_street1>): Expr => ({ street1: { $in: values as readonly Value[] } }),
    
    contains: (s: string): Expr => ({ street1: { $like: `%${likeEscape(s)}%` } }),
    starts_with: (s: string): Expr => ({ street1: { $like: `${likeEscape(s)}%` } }),
    ends_with: (s: string): Expr => ({ street1: { $like: `%${likeEscape(s)}` } }),
    is_null: (): Expr => ({ street1: null }),
    is_not_null: (): Expr => ({ street1: { $ne: null } }),
  } as const;

  
  
  type T_street2 = string;
  

  /** Ops for 'street2' */
  export const street2 = {
    eq: (v: T_street2): Expr => ({ street2: v }),
    neq: (v: T_street2): Expr => ({ street2: { $ne: v } }),
    
    
    
    
    in: (values: ReadonlyArray<T_street2>): Expr => ({ street2: { $in: values as readonly Value[] } }),
    
    contains: (s: string): Expr => ({ street2: { $like: `%${likeEscape(s)}%` } }),
    starts_with: (s: string): Expr => ({ street2: { $like: `${likeEscape(s)}%` } }),
    ends_with: (s: string): Expr => ({ street2: { $like: `%${likeEscape(s)}` } }),
    is_null: (): Expr => ({ street2: null }),
    is_not_null: (): Expr => ({ street2: { $ne: null } }),
  } as const;

  
  
  type T_postalCode = string;
  

  /** Ops for 'postalCode' */
  export const postalCode = {
    eq: (v: T_postalCode): Expr => ({ postalCode: v }),
    neq: (v: T_postalCode): Expr => ({ postalCode: { $ne: v } }),
    
    
    
    
    in: (values: ReadonlyArray<T_postalCode>): Expr => ({ postalCode: { $in: values as readonly Value[] } }),
    
    contains: (s: string): Expr => ({ postalCode: { $like: `%${likeEscape(s)}%` } }),
    starts_with: (s: string): Expr => ({ postalCode: { $like: `${likeEscape(s)}%` } }),
    ends_with: (s: string): Expr => ({ postalCode: { $like: `%${likeEscape(s)}` } }),
    is_null: (): Expr => ({ postalCode: null }),
    is_not_null: (): Expr => ({ postalCode: { $ne: null } }),
  } as const;

  
  
  type T_city = string;
  

  /** Ops for 'city' */
  export const city = {
    eq: (v: T_city): Expr => ({ city: v }),
    neq: (v: T_city): Expr => ({ city: { $ne: v } }),
    
    
    
    
    in: (values: ReadonlyArray<T_city>): Expr => ({ city: { $in: values as readonly Value[] } }),
    
    contains: (s: string): Expr => ({ city: { $like: `%${likeEscape(s)}%` } }),
    starts_with: (s: string): Expr => ({ city: { $like: `${likeEscape(s)}%` } }),
    ends_with: (s: string): Expr => ({ city: { $like: `%${likeEscape(s)}` } }),
    is_null: (): Expr => ({ city: null }),
    is_not_null: (): Expr => ({ city: { $ne: null } }),
  } as const;

  
  
  type T_country = string;
  

  /** Ops for 'country' */
  export const country = {
    eq: (v: T_country): Expr => ({ country: v }),
    neq: (v: T_country): Expr => ({ country: { $ne: v } }),
    
    
    
    
    in: (values: ReadonlyArray<T_country>): Expr => ({ country: { $in: values as readonly Value[] } }),
    
    contains: (s: string): Expr => ({ country: { $like: `%${likeEscape(s)}%` } }),
    starts_with: (s: string): Expr => ({ country: { $like: `${likeEscape(s)}%` } }),
    ends_with: (s: string): Expr => ({ country: { $like: `%${likeEscape(s)}` } }),
    is_null: (): Expr => ({ country: null }),
    is_not_null: (): Expr => ({ country: { $ne: null } }),
  } as const;

  
}
