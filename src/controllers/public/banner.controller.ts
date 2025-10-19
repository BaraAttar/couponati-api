import type { Request, Response } from "express";
import { Banner } from "../../models/Banner.model.js";
import { isValidObjectId } from "mongoose";

export const getBanners = async (req: Request, res: Response) => {
    try {
        const banners = await Banner.find().sort({ order: 1, createdAt: -1 }).lean();

        return res.status(200).json({
            success: true,
            message: "Banners retrieved successfully",
            data: banners,
        });
    } catch (error) {
        console.error("getBanners error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: process.env.NODE_ENV === "development" ? error : undefined,
        });
    }

};

export const getBannerById = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid banner ID format",
            });
        }

        const banner = await Banner.findById(id).lean();

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: "Banner not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Banner retrieved successfully",
            data: banner,
        });
    } catch (error) {
        console.error("getBannerById error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: process.env.NODE_ENV === "development" ? error : undefined,
        });
    }
};