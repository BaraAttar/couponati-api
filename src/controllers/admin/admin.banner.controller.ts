import type { Request, Response } from "express";
import { Banner } from "../../models/Banner.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import type { CreateBannerInput, UpdateBannerInput } from "../../validations/admin/admin.banner.validation.js";

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


export const createBanner = async (req: Request<{}, {}, CreateBannerInput>, res: Response) => {
    try {
        const { name, image } = req.body;

        if (image && !isValidUrl(image)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid image URL",
            });
        }

        const existingBanner = await Banner.findOne({
            $or: [
                { name: name.trim() },
                { image: image.trim() }
            ]
        }).lean();
        if (existingBanner) {
            return res.status(400).json({
                success: false,
                message: "Banner with this name or image already exists",
            });
        }

        const banner = new Banner({ name, image });
        const savedBanner = await banner.save();

        return res.status(201).json({
            success: true,
            message: "A new banner created successfully",
            data: savedBanner,
        });

    } catch (error) {
        console.error("createBanner error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            ...(process.env.NODE_ENV === "development" && {
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        });
    }
}

export const updateBanner = async (req: Request<{ id: string }, {}, UpdateBannerInput>, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid ID format" });
        }

        if (updateData.name) updateData.name = updateData.name.trim();
        if (updateData.image) updateData.image = updateData.image.trim();
        if (updateData.link) updateData.link = updateData.link.trim();

        // التحقق من صحة الـ URL إذا تم تحديث الصورة
        if (updateData.image || updateData.name) {
            if (updateData.image) {
                if (!isValidUrl(updateData.image)) {
                    return res.status(400).json({
                        success: false,
                        message: "Please provide a valid image URL",
                    });
                }
            }

            const existingBanner = await Banner.aggregate([
                {
                    $match: {
                        $or: [
                            { 'name': updateData?.name },
                            { 'image': updateData.image }
                        ],
                        _id: { $ne: new mongoose.Types.ObjectId(id) }
                    }
                },
                { $limit: 1 }
            ]);

            if (existingBanner.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Banner with this name or image already exists",
                });
            }
        }

        const updatedBanner = await Banner.findByIdAndUpdate(id, updateData, { new: true }).lean();

        if (!updatedBanner) {
            return res.status(404).json({ success: false, message: "Banner not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Banner updated successfully",
            data: updatedBanner,
        });
    } catch (error) {
        console.error("updateBanner error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            ...(process.env.NODE_ENV === "development" && {
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        });
    }
};

export const deleteBanner = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid ID format" });
        }

        const banner = await Banner.findByIdAndDelete(id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: "Banner not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Banner deleted successfully",
            data: banner,
        });
    } catch (error) {
        console.error("deleteBanner error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            ...(process.env.NODE_ENV === "development" && {
                error: error instanceof Error ? error.message : 'Unknown error'
            })
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