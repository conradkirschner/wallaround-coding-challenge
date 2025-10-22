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
export type PostExpr = Expr;

const AND = (parts: ReadonlyArray<Expr>): Expr => ({ $and: parts as Expr[] });
const OR  = (parts: ReadonlyArray<Expr>): Expr => ({ $or: parts as Expr[] });

/** Escape % and _ for SQL LIKE (no replaceAll to keep lib target broad) */
const likeEscape = (s: string): string => s.replace(/[%_]/g, (m) => '\\' + m);

/** Parse fields JSON coming from hygen CLI and prep helpers */


export namespace PostFilterQueryMikroORM {
  export const group = { and: AND, or: OR } as const;
  export const all = (...exprs: ReadonlyArray<Expr>): Expr => AND(exprs);
  export const any = (...exprs: ReadonlyArray<Expr>): Expr => OR(exprs);

  
  
  type T_title = string;
  

  /** Ops for 'title' */
  export const title = {
    eq: (v: T_title): Expr => ({ title: v }),
    neq: (v: T_title): Expr => ({ title: { $ne: v } }),
    
    
    
    
    in: (values: ReadonlyArray<T_title>): Expr => ({ title: { $in: values as readonly Value[] } }),
    
    contains: (s: string): Expr => ({ title: { $like: `%${likeEscape(s)}%` } }),
    starts_with: (s: string): Expr => ({ title: { $like: `${likeEscape(s)}%` } }),
    ends_with: (s: string): Expr => ({ title: { $like: `%${likeEscape(s)}` } }),
    
    
  } as const;

  
  
  type T_content = string;
  

  /** Ops for 'content' */
  export const content = {
    eq: (v: T_content): Expr => ({ content: v }),
    neq: (v: T_content): Expr => ({ content: { $ne: v } }),
    
    
    
    
    in: (values: ReadonlyArray<T_content>): Expr => ({ content: { $in: values as readonly Value[] } }),
    
    contains: (s: string): Expr => ({ content: { $like: `%${likeEscape(s)}%` } }),
    starts_with: (s: string): Expr => ({ content: { $like: `${likeEscape(s)}%` } }),
    ends_with: (s: string): Expr => ({ content: { $like: `%${likeEscape(s)}` } }),
    is_null: (): Expr => ({ content: null }),
    is_not_null: (): Expr => ({ content: { $ne: null } }),
  } as const;

  
  
  type T_published = boolean;
  

  /** Ops for 'published' */
  export const published = {
    eq: (v: T_published): Expr => ({ published: v }),
    neq: (v: T_published): Expr => ({ published: { $ne: v } }),
    
    
    
    
    
    
    
    
    
    
    
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
