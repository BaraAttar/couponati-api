import type { Request, Response } from "express";
import { Banner } from "../models/Banner.model.js";
import mongoose, { isValidObjectId } from "mongoose";

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
        const banners = await Banner.find().sort({ order: 1, createdAt: -1 });

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

export const getBannerById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            res.status(400).json({
                success: false,
                message: "Invalid banner ID format",
            });
            return;
        }

        const banner = await Banner.findById(id);

        if (!banner) {
            res.status(404).json({
                success: false,
                message: "Banner not found",
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Banner retrieved successfully",
            data: banner,
        });
    } catch (error) {
        console.error("getBannerById error:", error);
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

        if (image && !isValidUrl(image)) {
            res.status(400).json({
                success: false,
                message: "Please provide a valid image URL",
            });
            return;
        }

        const existingBanner = await Banner.findOne({ name: name.trim() });
        if (existingBanner) {
            res.status(400).json({
                success: false,
                message: "Banner with this name already exists",
            });
            return;
        }

        const banner = new Banner({ name, image });
        const savedBanner = await banner.save();

        res.status(201).json({
            success: true,
            message: "A new banner created successfully",
            data: savedBanner,
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
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!isValidObjectId(id)) {
            res.status(400).json({ success: false, message: "Invalid ID format" });
            return;
        }

        if (updateData.name) updateData.name = updateData.name.trim();
        if (updateData.image) updateData.image = updateData.image.trim();
        if (updateData.link) updateData.link = updateData.link.trim();

        // التحقق من صحة الـ URL إذا تم تحديث الصورة
        if (updateData.image && !isValidUrl(updateData.image)) {
            res.status(400).json({
                success: false,
                message: "Please provide a valid image URL",
            });
            return;
        }

        // التحقق من عدم تكرار الاسم (إذا تم تغييره)
        if (updateData.name) {
            const existingBanner = await Banner.findOne({
                name: updateData.name,
                _id: { $ne: id }
            });
            if (existingBanner) {
                res.status(400).json({
                    success: false,
                    message: "Banner with this name already exists",
                });
                return;
            }
        }

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
        if (!isValidObjectId(id)) {
            res.status(400).json({ success: false, message: "Invalid ID format" });
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

// Helper function للتحقق من صحة الـ URL
function isValidUrl(string: string): boolean {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}