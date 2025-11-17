import z from "zod";
import { sanitizedTextSchema } from "../shared/validation.utils.js";

export const bannerIdSchema = z.object({
    id: sanitizedTextSchema(0, 100, "banner ID")
});

