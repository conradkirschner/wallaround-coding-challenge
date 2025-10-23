import { z } from "zod";
import type { FilterNode, ConditionNode } from "src/filtering/ast";
import { Role } from "src/domain/user.entity";

/** INPUT: primitive values in filters must be JSON-friendly */
const isoDate = z.string().datetime().or(z.string()); // accept ISO or date-like string
const primitiveIn = z.union([z.string(), z.number(), z.boolean(), isoDate]);

const valueSchemaIn = z.union([
    primitiveIn,
    z.array(primitiveIn),
    z.tuple([primitiveIn, primitiveIn]),
]);

const ConditionNodeIn = z.object({
    field: z.string().min(1),
    op: z.string().min(1),
    value: valueSchemaIn.optional(),
});

const ConditionNodeSchema: z.ZodType<ConditionNode> = ConditionNodeIn.transform((o) => {
    const out: any = { field: o.field, op: o.op };
    if (o.value !== undefined) out.value = o.value;
    return out as ConditionNode;
});

export const FilterNodeSchema: z.ZodType<FilterNode> = z.lazy(() =>
    z.union([
        z.object({ and: z.array(FilterNodeSchema).min(1) }),
        z.object({ or: z.array(FilterNodeSchema).min(1) }),
        ConditionNodeSchema,
    ]),
);

const EmptyObject = z.object({}).strict();                // allow {}
const FilterInputSchema = z.union([FilterNodeSchema, EmptyObject, z.string()]);

/** OUTPUT: tolerant coercions (numbers/0-1/enum-casing → proper types) */
const isoOut = z.preprocess(
    (v) => (v instanceof Date ? v.toISOString() : typeof v === "number" ? new Date(v).toISOString() : v),
    z.string(),
);
const idOut = z.preprocess((v) => (typeof v === "number" ? String(v) : v), z.string());
const boolOut = z.preprocess(
    (v) => (v === 1 || v === "1" || v === true ? true : v === 0 || v === "0" || v === false ? false : v),
    z.boolean(),
);
const roleOut = z.preprocess(
    (v) => (typeof v === "string" ? v.toLowerCase() : v),
    z.nativeEnum(Role),
);

const AddressSchema = z.object({
    city: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
    street1: z.string().optional(),
    street2: z.union([z.string(), z.null()]).optional(),
    createdAt: isoOut.optional(),
    updatedAt: isoOut.optional(),
});

const PostSchema = z.object({
    id: idOut.optional(),
    title: z.string().optional(),
    content: z.union([z.string(), z.null()]).optional(),
    published: boolOut.optional(),
    createdAt: isoOut.optional(),
    updatedAt: isoOut.optional(),
});

export const UserOutSchema = z.object({
    id: idOut.optional(),
    email: z.string().email().optional(),
    displayName: z.string().optional(),
    age: z.number().optional(),
    role: roleOut.optional(),
    isActive: boolOut.optional(),
    createdAt: isoOut.optional(),
    updatedAt: isoOut.optional(),
    address: AddressSchema.optional(),
    posts: z.array(PostSchema).optional(),
});

export type UserResponse = z.infer<typeof UserOutSchema>;

/** Final request schema — now only allows JSON-serializable filter */
export const UsersInputSchema = z.object({
    filter: FilterInputSchema.optional(),
});
