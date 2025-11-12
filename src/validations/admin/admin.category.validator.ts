import { z } from "zod";
import { bilingualNameSchema, bilingualUpdateNameSchema } from "../shared/validation.utils.js";

// ✅ Schema لإنشاء فئة جديدة
export const createCategorySchema = z.object({
    name: bilingualNameSchema,
    active: z.boolean().default(true),

    order: z
        .number("Order must be a number")
        .int()
        .nonnegative()
        .default(0),

    icon: z
        .string("Icon is required")
        .trim()
        .min(1, { message: "Icon cannot be empty" }),
});

// ✅ Schema لتحديث فئة موجودة
export const updateCategorySchema = z.object({
    name: bilingualUpdateNameSchema.optional(),
    active: z.boolean().optional(),

    order: z
        .number("Order must be a number")
        .int()
        .nonnegative()
        .optional(),

    icon: z
        .string()
        .trim()
        .min(1, { message: "Icon cannot be empty" })
        .optional(),
});

// ✅ Types للاستخدام في الكنترولرات
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
