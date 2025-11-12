import { z } from "zod";

// Password validation with security requirements
const passwordSchema = z
    .string("Password is required")
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password cannot exceed 128 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character")
    .refine(
        (password) => {
            // Prevent common passwords
            const commonPasswords = [
                "password", "12345678", "qwerty123", "admin123",
                "password123", "welcome123", "letmein123"
            ];
            return !commonPasswords.some(common =>
                password.toLowerCase().includes(common)
            );
        },
        { message: "Password is too common. Please choose a stronger password" }
    );

// Username validation with sanitization
const usernameSchema = z
    .string("Username is required")
    .min(5, "Username must be at least 5 characters long")
    .max(30, "Username cannot exceed 30 characters")
    .regex(
        /^[a-zA-Z0-9_-]+$/,
        "Username can only contain letters, numbers, underscores, and hyphens"
    )
    .refine(
        (username) => {
            // Prevent reserved usernames
            const reserved = ["admin", "root", "superuser", "administrator", "system"];
            return !reserved.includes(username.toLowerCase());
        },
        { message: "This username is reserved" }
    )
    .transform((val) => val.trim().toLowerCase());

export const createAdminSchema = z.object({
    userName: usernameSchema,
    password: passwordSchema,
    role: z.enum(["user", "admin"]).optional(),
});

// Login schema (less strict for login)
export const loginAdminSchema = z.object({
    userName: z.string().min(1, "Username is required").trim(),
    password: z.string().min(1, "Password is required"),
});

export type CreateAdminInput = z.infer<typeof createAdminSchema>;
export type LoginAdminInput = z.infer<typeof loginAdminSchema>;