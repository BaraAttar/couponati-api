import type { Request, Response, NextFunction } from "express";
import type { ZodType } from 'zod';

export const validateQuery = (schema: ZodType) => (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
        const firstError = result.error.issues[0];
        const message = firstError?.message;

        return res.status(400).json({
            success: false,
            message: `${message}`,
        });
    }
    req.query = result.data as any;
    next();
};
