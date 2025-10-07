// src/middleware/rateLimiter.ts
import rateLimit from "express-rate-limit";
import type { RequestHandler } from "express";

export const authRateLimiter: RequestHandler = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 5,
    handler: (req, res , next) => {
        return res.status(429).json({
            success: false,
            message: "Too many authentication attempts, please try again later",
        });
    }
});

export const apiRateLimiter: RequestHandler = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res , next) => {
        return res.status(429).json({
            success: false,
            message: "Too many requests, please try again later",
        });
    },
});
