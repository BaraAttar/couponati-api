import z from "zod";
import { sanitizedTextSchema } from "../shared/validation.utils.js";

export const searchCategoriesSchema = z.object({
    name: sanitizedTextSchema(0, 100, "category name").optional(),

    active: z
        .enum(["true", "false"])
        .optional(),

    page: z
        .coerce.number().int()
        .default(1)
        .optional(),

    limit: z
        .coerce.number().int()
        .min(1)
        .max(100)
        .default(20)
        .optional(),
});

export const categoryIdSchema = z.object({
    id: sanitizedTextSchema(0, 100, "store ID")
});

export type SearchCategoriesInput = z.infer<typeof searchCategoriesSchema>;