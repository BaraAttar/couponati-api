import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { Admin } from "../models/Admin.model.js";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("❌ FATAL ERROR: JWT_SECRET is not defined in environment variables");
}

declare module "express-serve-static-core" {
    interface Request {
        user?: UserPayload;
        admin?: AdminPayload;
    }
}

export interface UserPayload {
    googleId: string;
    email: string;
    firstName: string;
    lastName: string;
    picture: string;
    exp?: number;
    iat?: number;
}

export interface AdminPayload {
    _id: string;
    userName: string;
    role: "user" | "admin";
}

function extractToken(req: Request): string | null {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return null;

    const token = authHeader.startsWith("Bearer ")
        ? authHeader.substring(7).trim()
        : authHeader.trim();

    if (!token || token === "undefined" || token === "null") return null;

    return token;
}

export function userAuthMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = extractToken(req);
    if (!token)
        return res.status(401).json({ success: false, message: "Unauthorized access" });

    try {
        const payload = jwt.verify(token, JWT_SECRET!) as UserPayload;
        req.user = payload;
        next();
    } catch (err: any) {
        console.log(`❌ userAuthMiddleware: ${err.message}`);
        if (err.name === "TokenExpiredError") return res.status(401).json({ success: false, message: "Token expired" });
        if (err.name === "JsonWebTokenError") return res.status(403).json({ success: false, message: "Invalid token" });
        return res.status(500).json({ success: false, message: "Token verification failed" });
    }
}

export async function adminAuthMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = extractToken(req);
    if (!token)
        return res.status(401).json({ success: false, message: "Unauthorized access" });

    try {
        const payload = jwt.verify(token, JWT_SECRET!) as AdminPayload

        const account = await Admin.findById(payload._id).select("role").lean();
        if (!account) {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }
        if (account.role !== "admin") {
            return res.status(403).json({ success: false, message: "Admin access required" });

        }

        req.admin = payload;
        next();
    } catch (err: any) {
        console.log(`❌ adminAuthMiddleware: ${err.message}`);
        if (err.name === "TokenExpiredError") return res.status(401).json({ success: false, message: "Token expired" });
        if (err.name === "JsonWebTokenError") return res.status(403).json({ success: false, message: "Invalid token" });
        return res.status(500).json({ success: false, message: "Token verification failed" });
    }
}
