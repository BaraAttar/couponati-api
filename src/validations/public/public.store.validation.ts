import z from "zod";
import { sanitizedTextSchema } from "../shared/validation.utils.js";

export const searchStoreSchema = z.object({
    name: sanitizedTextSchema(0, 100, "store name").optional(),
    category: sanitizedTextSchema(0, 100, "category ID").optional(),

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

})

export const storeIdSchema = z.object({
    id: sanitizedTextSchema(0, 100, "store ID")
});

export type SearchStoreInput = z.infer<typeof searchStoreSchema>;
