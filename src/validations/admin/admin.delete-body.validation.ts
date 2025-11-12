import z from "zod";
import { sanitizedTextSchema } from "../shared/validation.utils.js";

const validConfirmations = ["delete", "حذف", "confirm"];

export const deleteConfirmBody = z.object({
    confirm: sanitizedTextSchema(1, 20, "conferm field").refine(
        (val) => validConfirmations.includes(val),
        {
            message: `confirm field must be one of: ${validConfirmations.join(", ")}`
        }
    ),
})