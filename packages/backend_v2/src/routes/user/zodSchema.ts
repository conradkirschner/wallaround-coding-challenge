import { z } from "zod";
import type { FilterNode, ConditionNode } from "src/filtering/ast";
import { Role } from "src/domain/user.entity";

/* ===========================
 * Zod helpers & schemas
 * =========================== */

const primitive = z.union([z.string(), z.number(), z.boolean(), z.date()]);
const valueSchema = z.union([primitive, z.array(primitive), z.tuple([primitive, primitive])]);

const ConditionNodeSchemaIn = z.object({
    field: z.string().min(1),
    op: z.string().min(1),
    value: valueSchema.optional(),
});

const ConditionNodeSchema: z.ZodType<ConditionNode> = ConditionNodeSchemaIn.transform((o) => {
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

// NEW: allow an explicitly empty filter object `{}`
// so `filter: {}` passes validation and means “no filter”.
const EmptyFilterObjectSchema = z.object({}).strict();

// Accept object (FilterNode), empty object, or JSON string
export const FilterInputSchema = z.union([
    FilterNodeSchema,
    EmptyFilterObjectSchema,
    z.string(),
]);

// Reusable “DB shape” helpers
const dateLike = z.union([z.date(), z.string()]); // keep as-is
const idLike   = z.union([z.string(), z.number()]); // sqlite autoincrement or uuid string
const boolLike = z.union([z.boolean(), z.literal(0), z.literal(1)]); // 0/1 or boolean
const roleLike = z.union([z.nativeEnum(Role), z.enum(["Admin", "User", "Editor"])]); // both casings

// Address payload (allow id too if you ever include it)
export const AddressSchema = z.object({
    id: idLike.optional(),                // ← allow numeric/string id if present
    city: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
    street1: z.string().optional(),
    street2: z.union([z.string(), z.null()]).optional(),
    createdAt: dateLike.optional(),
    updatedAt: dateLike.optional(),
});

// Post payload (published may be 0/1)
export const PostSchema = z.object({
    id: idLike.optional(),
    title: z.string().optional(),
    content: z.union([z.string(), z.null()]).optional(),
    published: boolLike.optional(),       // ← accept 0/1 or boolean
    createdAt: dateLike.optional(),
    updatedAt: dateLike.optional(),
});

// User payload: relax id/role/isActive
export const UserOutSchema = z.object({
    id: idLike.optional(),                // ← accept number or string
    email: z.string().email().optional(),
    displayName: z.string().optional(),
    age: z.number().optional(),
    role: roleLike.optional(),            // ← accept lower or Capitalized
    isActive: boolLike.optional(),        // ← accept 0/1 or boolean
    createdAt: dateLike.optional(),
    updatedAt: dateLike.optional(),
    address: AddressSchema.optional(),
    posts: z.array(PostSchema).optional(),
});

export type UserResponse = z.infer<typeof UserOutSchema>;

export const UsersInputSchema = z.object({
    filter: FilterInputSchema.optional(),
});
