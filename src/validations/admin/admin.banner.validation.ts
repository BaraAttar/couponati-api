import { z } from "zod";
import { optionalUrlSchema, sanitizedTextSchema, urlSchema } from "../shared/validation.utils.js";

export const createBannerSchema = z.object({
    name: sanitizedTextSchema(2, 100, "Banner name"),
    image: urlSchema,
    link: optionalUrlSchema,
    active: z.boolean().default(true),
    order: z.number().int().nonnegative().default(0),
});

export const updateBannerSchema = z.object({
    name: sanitizedTextSchema(2, 100, "Banner name").optional(),
    image: urlSchema,
    link: optionalUrlSchema,
    active: z.boolean().default(true),
    order: z.number().int().nonnegative().default(0),
});

// ✅ نوع الإدخال عند الإنشاء
export type CreateBannerInput = z.infer<typeof createBannerSchema>;
export type UpdateBannerInput = z.infer<typeof updateBannerSchema>;
