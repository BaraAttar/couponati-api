import dotenv from 'dotenv';
dotenv.config();

if (!process.env.JWT_SECRET) {
    throw new Error("FATAL ERROR: JWT_SECRET is not defined.");
}

import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

declare module "express-serve-static-core" {
    interface Request {
        user?: JwtPayload;
    }
}

export interface JwtPayload {
    googleId: string;
    email: string;
    firstName: string;
    lastName: string;
    picture: string;
    exp?: number;
    iat?: number;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // توقع "Bearer <token>"

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Token required"
        });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        req.user = payload;
        next();
    } catch (err: any) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ success: false, message: "Token expired" });
        }
        if (err.name === "JsonWebTokenError") {
            return res.status(403).json({ success: false, message: "Invalid token" });
        }
        return res.status(500).json({ success: false, message: "Token verification failed" });
    }
}