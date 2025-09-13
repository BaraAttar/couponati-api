import type { Request, Response } from "express";
import { Banner } from "../models/BannerSchema.js";
import mongoose from "mongoose";

interface BannerType {
    name: string;
    image: string;
    link?: string;
    active: boolean;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

interface UpdateBannerBody {
    name?: string;
    image?: string;
    link?: string;
    active?: boolean;
    order?: number;
}

export const getBanners = async (req: Request, res: Response): Promise<void> => {
    try {
        const banners = await Banner.find();

        if (banners.length === 0) {
            res.status(404).json({
                success: false,
                message: "No banners found",
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Banners retrieved successfully",
            data: banners,
        });
    } catch (error) {
        console.error("getBanners error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: process.env.NODE_ENV === "development" ? error : undefined,
        });
    }

};

export const createBanner = async (req: Request<{}, {}, BannerType>, res: Response): Promise<void> => {
    try {
        const { name, image } = req.body;

        if (!req.body || !req.body.name || !req.body.image) {

            res.status(400).json({
                success: false,
                message: "name and image url is required",
            });
            return;
        }

        const banner = new Banner({ name, image });
        await banner.save();

        res.status(201).json({
            success: true,
            message: "A new banner created successfully",
            data: banner,
        });

    } catch (error) {
        console.error("createBanner error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: process.env.NODE_ENV === "development" ? error : undefined,
        });
    }
}

export const updateBanner = async (req: Request<{ id: string }, {}, UpdateBannerBody>, res: Response): Promise<void> => {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, message: "Invalid ID format" });
        return;
    }

    try {
        const updatedBanner = await Banner.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedBanner) {
            res.status(404).json({ success: false, message: "Banner not found" });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Banner updated successfully",
            data: updatedBanner,
        });
    } catch (error) {
        console.error("updateBanner error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: process.env.NODE_ENV === "development" ? error : undefined,
        });
    }
};

export const deleteBanner = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(404).json({ success: false, message: "Invalid ID format" });
            return;
        }

        const banner = await Banner.findByIdAndDelete(id)

        if (!banner) {
            res.status(404).json({
                success: false,
                message: "Banner not found",
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Banner deleted successfully",
            data: banner,
        });
    } catch (error) {
        console.error("deleteBanner error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: process.env.NODE_ENV === "development" ? error : undefined,
        });
    }
}