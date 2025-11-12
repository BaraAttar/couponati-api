import { z } from "zod";
import { bilingualDescriptionSchema, bilingualNameSchema, bilingualUpdateNameSchema, urlSchema } from "../shared/validation.utils.js";


// Schema for creating a new store
export const createStoreSchema = z.object({
    name: bilingualNameSchema,
    icon: urlSchema.optional(),
    banner: urlSchema.optional(),
    description: bilingualDescriptionSchema,
    link: urlSchema.optional(),

    active: z
        .boolean()
        .default(true),

    order: z
        .number("Order is required")
        .int("Order must be an integer")
        .min(0, "Order cannot be negative")
        .default(0),

    category: z
        .array(
            z.string()
        )
        .min(1, "At least one category is required")
        .max(10, "Cannot exceed 10 categories"),
});

// Schema for updating a store
export const updateStoreSchema = z.object({
    name: bilingualUpdateNameSchema.optional(),
    icon: urlSchema.optional(),
    banner: urlSchema.optional(),

    description: bilingualDescriptionSchema,
    link: urlSchema.optional(),

    active: z
        .boolean()
        .optional(),

    order: z
        .number()
        .int("Order must be an integer")
        .min(0, "Order cannot be negative")
        .optional(),

    category: z
        .array(
            z.string()
        )
        .min(1, "At least one category is required")
        .max(10, "Cannot exceed 10 categories")
        .optional(),
});

// Type exports
export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;
