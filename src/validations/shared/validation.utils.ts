// src/validations/shared/validation.utils.ts
import { z } from "zod";

// Sanitized text schema with XSS protection
export const sanitizedTextSchema = (
    minLength: number,
    maxLength: number,
    fieldName: string
) =>
    z
        .string(`${fieldName} can't be empty`)
        .trim()
        .min(minLength, `${fieldName} must be at least ${minLength} character(s)`)
        .max(maxLength, `${fieldName} cannot exceed ${maxLength} characters`)
        .refine(
            (text) => {
                // Remove dangerous HTML tags and scripts
                const dangerousPatterns = [
                    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
                    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
                    /javascript:/gi,
                    /on\w+\s*=/gi, // onclick, onload, etc.
                    /<embed\b/gi,
                    /<object\b/gi,
                ];

                return !dangerousPatterns.some(pattern => pattern.test(text));
            },
            { message: `${fieldName} contains potentially dangerous content` }
        );

// URL validation with protocol check
export const urlSchema = z
    .url("Must be a valid URL")
    .trim()
    .refine(
        (url) => {
            try {
                const parsedUrl = new URL(url);
                return ['http:', 'https:'].includes(parsedUrl.protocol);
            } catch {
                return false;
            }
        },
        { message: "Only HTTP and HTTPS protocols are allowed" }
    );

/**
 * Optional URL (can be empty string or undefined)
 */
export const optionalUrlSchema = z
    .string()
    .trim()
    .optional()
    .refine(
        (url) => {
            if (!url || url === '') return true;
            try {
                const parsedUrl = new URL(url);
                return ['http:', 'https:'].includes(parsedUrl.protocol);
            } catch {
                return false;
            }
        },
        { message: "Must be a valid HTTP/HTTPS URL" }
    )
    .or(z.literal("").transform(() => undefined));


// Bilingual name validation
export const bilingualNameSchema = z.object({
    ar: sanitizedTextSchema(1, 100, "Arabic name"),
    en: sanitizedTextSchema(1, 100, "English name"),
}, "Name field is empty");

export const bilingualUpdateNameSchema = z.object({
    ar: sanitizedTextSchema(1, 100, "Arabic name").optional(),
    en: sanitizedTextSchema(1, 100, "English name").optional(),
}, "Name field is empty");

//  Optional bilingual description
export const bilingualDescriptionSchema = z
    .object({
        ar: sanitizedTextSchema(1, 500, "Arabic description"),
        en: sanitizedTextSchema(1, 500, "English description"),
    })
    .optional()
    .refine(
        (desc) => {
            if (!desc) return true;
            // Both must be filled or both empty
            const hasAr = desc.ar && desc.ar.trim() !== '';
            const hasEn = desc.en && desc.en.trim() !== '';
            return (hasAr && hasEn) || (!hasAr && !hasEn);
        },
        { message: "Both Arabic and English descriptions must be filled or both empty" }
    );