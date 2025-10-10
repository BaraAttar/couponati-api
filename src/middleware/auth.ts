import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { Admin } from "../models/Admin.model.js";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("FATAL ERROR: JWT_SECRET is not defined in environment variables");
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

export function userAuthMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        console.log("❌ No authorization header");
        return res.status(401).json({ success: false, message: "Authorization header required" });
    }

    const token = authHeader.startsWith("Bearer ")
        ? authHeader.substring(7).trim()
        : authHeader.trim();

    if (!token || token === "undefined" || token === "null") {
        console.log("❌ Invalid token value:", token);
        return res.status(401).json({ success: false, message: "Token required" });
    }

    if (!token) return res.status(401).json({ success: false, message: "Token required" });

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload
        req.user = payload;
        next();
    } catch (err: any) {
        if (err.name === "TokenExpiredError") return res.status(401).json({ success: false, message: "Token expired" });
        if (err.name === "JsonWebTokenError") return res.status(403).json({ success: false, message: "Invalid token" });
        return res.status(500).json({ success: false, message: "Token verification failed" });
    }
}

export async function adminAuthMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        console.log("❌ No authorization header");
        return res.status(401).json({ success: false, message: "Authorization header required" });
    }

    const token = authHeader.startsWith("Bearer ")
        ? authHeader.substring(7).trim()
        : authHeader.trim();

    if (!token || token === "undefined" || token === "null") {
        console.log("❌ Invalid token value:", token);
        return res.status(401).json({ success: false, message: "Token required" });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET!) as AdminPayload

        const account = await Admin.findById(payload._id);
        if (!account) {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }
        if (account.role !== "admin") {
            return res.status(403).json({ success: false, message: "Admin access required" });

        }

        req.admin = payload;
        next();
    } catch (err: any) {
        console.log(err);
        if (err.name === "TokenExpiredError") return res.status(401).json({ success: false, message: "Token expired" });
        if (err.name === "JsonWebTokenError") return res.status(403).json({ success: false, message: "Invalid token" });
        return res.status(500).json({ success: false, message: "Token verification failed" });
    }
}
