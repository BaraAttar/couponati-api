import type { Request, Response } from "express";
import { Store } from "../../models/Store.model.js";
import { isValidObjectId } from "mongoose";

// ✅ Get all stores
export const getStores = async (req: Request, res: Response) => {
    try {
        const page = parseInt((req.query.page as string) || "1");
        const limit = 20;
        const skipped = (page - 1) * limit;

        const { active, category, name } = req.query;
        const filter: any = {};

        if (active !== undefined) {
            filter.active = active === 'true';
        }

        if (category) {
            if (!isValidObjectId(category)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category ID format",
                });
            }
            filter.category = category;
        }

        if (name && typeof name === 'string' && name.trim() !== '') {
            filter.name = new RegExp(name, 'i');
        }

        const totalCount = await Store.countDocuments(filter);
        const remaining = Math.max(totalCount - skipped - limit, 0);

        const stores = await Store.find(filter)
            .populate('category', 'name')
            .populate('coupons')
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ order: 1, createdAt: -1 })

        res.status(200).json({
            success: true,
            message: stores.length > 0 ? "Stores retrieved successfully" : "No stores found",
            data: stores,
            pageCount: stores.length,
            totalCount,
            remaining
        });
    } catch (error) {
        console.error("getStores error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: process.env.NODE_ENV === "development" ? error : undefined,
        });
    }
}

export const getStoreById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid store ID format",
            });
        }

        const store = await Store.findById(id)
            .populate('category', 'name')

        if (!store) {
            return res.status(404).json({
                success: false,
                message: "Store not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Store retrieved successfully",
            data: store,
        });
    } catch (error) {
        console.error("getStoreById error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: process.env.NODE_ENV === "development" ? error : undefined,
        });
    }
}