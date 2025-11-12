import { z } from "zod";
import { bilingualDescriptionSchema } from "../shared/validation.utils.js";

// Schema for creating a new coupon
export const createCouponSchema = z.object({
    code: z
        .string()
        .trim()
        .min(1, "Coupon code must be at least 1 character")
        .max(30, "Coupon code cannot exceed 30 characters")
        .regex(
            /^[A-Z0-9-_]+$/,
            "Coupon code can only contain uppercase letters, numbers, hyphens, and underscores"
        )
        .transform(val => val.toUpperCase()),

    discount: z
        .number("Discount is required")
        .min(0, "Discount cannot be negative")
        .max(100, "Discount cannot exceed 100%"),

    description: bilingualDescriptionSchema,

    expiryDate: z
        .date("Invalid date format")
        .optional()
        .refine(
            (date) => !date || new Date(date) > new Date(),
            "Expiry date must be in the future"
        ),

    active: z
        .boolean()
        .default(true),

    store: z
        .string("Store ID is required")
});

// Schema for updating a coupon
export const updateCouponSchema = z.object({
    code: z
        .string()
        .trim()
        .min(1, "Coupon code must be at least 1 character")
        .max(30, "Coupon code cannot exceed 30 characters")
        .regex(
            /^[A-Z0-9-_]+$/,
            "Coupon code can only contain uppercase letters, numbers, hyphens, and underscores"
        )
        .optional(),

    discount: z
        .number()
        .min(0, "Discount cannot be negative")
        .max(100, "Discount cannot exceed 100%")
        .optional(),

    description: bilingualDescriptionSchema,

    expiryDate: z
        .date("Invalid date format")
        .optional()
        .refine(
            (date) => !date || new Date(date) > new Date(),
            "Expiry date must be in the future"
        ),

    active: z
        .boolean()
        .optional(),

    store: z
        .string()
        .optional(),
});

// Type exports
export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
