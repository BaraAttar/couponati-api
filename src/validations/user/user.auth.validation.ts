
import { z } from "zod";
import { sanitizedTextSchema } from "../shared/validation.utils.js";

export const googleTokenSchema = z.object({
    idToken: sanitizedTextSchema(1, 2000, "idToken"),
});

export type GoogleTokenInput = z.infer<typeof googleTokenSchema>;
