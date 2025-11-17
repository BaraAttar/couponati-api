import z from "zod";
import { sanitizedTextSchema } from "../shared/validation.utils.js";

export const searchCouponsSchema = z.object({
    store: sanitizedTextSchema(0, 100, "store ID").optional(),
    active: z.enum(["true", "false"]).optional(),
});

export type SearchCouponsQuery = z.infer<typeof searchCouponsSchema>;
