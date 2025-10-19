import type { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { User } from "../../models/User.model.js";
import { Store } from "../../models/Store.model.js";

export const getUserFavourites = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.googleId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const user = await User.findOne({ googleId: userId })
            .select('favourites')
            .populate({
                path: 'favourites',
                match: { active: true },
                select: 'name icon banner description coupons',
                populate: [
                    { path: 'category', select: 'name' },
                    { path: 'coupons', select: 'code discount description' }
                ]
            })
            .lean()

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Favourites retrieved successfully",
            data: user.favourites || [],
            count: user.favourites?.length || 0
        });
    } catch (error) {
        console.error("getUserFavourites error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

export const addToFavourites = async (req: Request, res: Response) => {
    try {
        const { storeId } = req.body;
        const userId = req.user?.googleId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        if (!storeId || !isValidObjectId(storeId)) {
            return res.status(400).json({
                success: false,
                message: "Valid store ID is required",
            });
        }

        // التحقق من وجود المتجر وأنه نشط
        const store = await Store.findOne({ _id: storeId, active: true }).lean();
        if (!store) {
            return res.status(404).json({
                success: false,
                message: "Store not found",
            });
        }

        const user = await User.findOne({ googleId: userId });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (user.favourites.includes(storeId)) {
            return res.status(400).json({
                success: false,
                message: "Store already in favourites",
            });
        }

        user.favourites.push(storeId);
        await user.save();

        const updatedUser = await user.populate("favourites");

        return res.status(200).json({
            success: true,
            message: "Store added to favourites successfully",
            data: {
                favourites: updatedUser?.favourites ?? []
            }
        });
    } catch (error) {
        console.error("addToFavourites error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

export const removeFromFavourites = async (req: Request, res: Response) => {
    try {
        const { storeId } = req.params;
        const userId = req.user?.googleId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        if (!isValidObjectId(storeId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid store ID format",
            });
        }

        const user = await User.findOne({ googleId: userId });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const index = user.favourites.indexOf(storeId as any);
        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: "Store not found in favourites",
            });
        }

        user.favourites.splice(index, 1);
        await user.save();


        const updatedUser = await user.populate("favourites");


        return res.status(200).json({
            success: true,
            message: "Store removed from favourites successfully",
            data: {
                favourites: updatedUser?.favourites ?? []
            }
        });
    } catch (error) {
        console.error("removeFromFavourites error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
