import type { Request, Response } from "express"
import { Admin } from "../../models/Admin.model.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "1d";

if (!JWT_SECRET) {
    throw new Error("FATAL ERROR: JWT_SECRET is not defined in environment variables");
}

export const adminSignup = async (req: Request, res: Response) => {
    try {
        const { userName, password } = req.body

        if (!userName || !password) {
            return res.status(400).json({
                success: false,
                message: "user name and password are required"
            });
        }

        const existingAccount = await Admin.findOne({ userName });
        if (existingAccount) {
            return res.status(400).json({
                success: false,
                message: "username already exists"
            });
        }

        const newAdmin = new Admin({
            userName,
            password
        });
        await newAdmin.save();

        const token = jwt.sign(
            { _id: newAdmin._id, userName: newAdmin.userName, role: newAdmin.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return res.status(201).json({
            success: true,
            message: "Admin account created successfully",
            token,
            admin: {
                id: newAdmin._id,
                userName: newAdmin.userName,
                role: newAdmin.role
            }
        });

    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

export const adminLogin = async (req: Request, res: Response) => {
    try {
        const { userName, password } = req.body;

        if (!userName || !password) {
            return res.status(400).json({
                success: false,
                message: "user name and password are required"
            });
        }

        const admin = await Admin.findOne({ userName }).select("+password");
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "invalid credentials"
            });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "invalid credentials"
            });
        }

        const token = jwt.sign(
            { _id: admin._id, userName: admin.userName, role: admin.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );


        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            admin: {
                id: admin._id,
                userName: admin.userName,
                role: admin.role
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};