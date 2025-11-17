import type { Request, Response, NextFunction } from "express";
import type { ZodType } from 'zod';

export const validateParams = (schema: ZodType) => (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
        const firstError = result.error.issues[0];
        const message = firstError?.message;

        return res.status(400).json({
            success: false,
            message: `${message}`,
        });
    }

    req.params = result.data as any;
    next();
};

