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
export type UserExpr = Expr;

const AND = (parts: ReadonlyArray<Expr>): Expr => ({ $and: parts as Expr[] });
const OR  = (parts: ReadonlyArray<Expr>): Expr => ({ $or: parts as Expr[] });

/** Escape % and _ for SQL LIKE (no replaceAll to keep lib target broad) */
const likeEscape = (s: string): string => s.replace(/[%_]/g, (m) => '\\' + m);

/** Parse fields JSON coming from hygen CLI and prep helpers */


export namespace UserFilterQueryMikroORM {
  export const group = { and: AND, or: OR } as const;
  export const all = (...exprs: ReadonlyArray<Expr>): Expr => AND(exprs);
  export const any = (...exprs: ReadonlyArray<Expr>): Expr => OR(exprs);

  
  
  type T_age = number;
  

  /** Ops for 'age' */
  export const age = {
    eq: (v: T_age): Expr => ({ age: v }),
    neq: (v: T_age): Expr => ({ age: { $ne: v } }),
    gt: (v: T_age): Expr => ({ age: { $gt: v } }),
    gte: (v: T_age): Expr => ({ age: { $gte: v } }),
    lt: (v: T_age): Expr => ({ age: { $lt: v } }),
    lte: (v: T_age): Expr => ({ age: { $lte: v } }),
    in: (values: ReadonlyArray<T_age>): Expr => ({ age: { $in: values as readonly Value[] } }),
    between: (a: T_age, b: T_age): Expr => AND([{ age: { $gte: a } }, { age: { $lte: b } }]),
    
    
    
    
    
  } as const;

  
  
  export type roleEnum = 'admin' | 'user' | 'editor';
  type T_role = roleEnum;
  

  /** Ops for 'role' */
  export const role = {
    eq: (v: T_role): Expr => ({ role: v }),
    neq: (v: T_role): Expr => ({ role: { $ne: v } }),
    
    
    
    
    in: (values: ReadonlyArray<T_role>): Expr => ({ role: { $in: values as readonly Value[] } }),
    
    
    
    
    
    
  } as const;

  
  
  type T_isActive = boolean;
  

  /** Ops for 'isActive' */
  export const isActive = {
    eq: (v: T_isActive): Expr => ({ isActive: v }),
    neq: (v: T_isActive): Expr => ({ isActive: { $ne: v } }),
    
    
    
    
    
    
    
    
    
    
    
  } as const;

  
  
  type T_createdAt = Date;
  

  /** Ops for 'createdAt' */
  export const createdAt = {
    eq: (v: T_createdAt): Expr => ({ createdAt: v }),
    neq: (v: T_createdAt): Expr => ({ createdAt: { $ne: v } }),
    gt: (v: T_createdAt): Expr => ({ createdAt: { $gt: v } }),
    gte: (v: T_createdAt): Expr => ({ createdAt: { $gte: v } }),
    lt: (v: T_createdAt): Expr => ({ createdAt: { $lt: v } }),
    lte: (v: T_createdAt): Expr => ({ createdAt: { $lte: v } }),
    
    between: (a: T_createdAt, b: T_createdAt): Expr => AND([{ createdAt: { $gte: a } }, { createdAt: { $lte: b } }]),
    
    
    
    
    
  } as const;

  
}
