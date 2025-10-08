import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { User } from '../models/User.model.js';

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


export async function adminMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        // جلب المستخدم من قاعدة البيانات
        const user = await User.findOne({ googleId: req.user.googleId }).lean();

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Admin access only" });
        }

        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}