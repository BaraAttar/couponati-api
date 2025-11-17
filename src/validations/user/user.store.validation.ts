import z from "zod";
import { isValidObjectId } from "mongoose";

export const addFavouriteBodySchema = z.object({
    storeId: z.string().refine(isValidObjectId, "Invalid store ID")
});

export const removeFavouriteParamsSchema = z.object({
    storeId: z.string().refine(isValidObjectId, "Invalid store ID"),
});

export type AddFavouriteBodyInput = z.infer<typeof addFavouriteBodySchema>;
export type RemoveFavouriteParamsInput = z.infer<typeof removeFavouriteParamsSchema>;
