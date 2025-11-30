import type { Request, Response } from "express";
import { Store } from "../../models/Store.model.js";
import mongoose, { isValidObjectId } from "mongoose";

// ✅ Get all stores
export const getStores = async (req: Request, res: Response) => {
    try {
        const lang = req.language || 'en';
        const page = parseInt((req.query.page as string) || "1");
        const limit = Number(req.query.limit) || 20;
        const skipped = (page - 1) * limit;

        const { active, category, name } = req.query;
        const filter: any = {};

        if (active === undefined || active === null) {
            filter.active = true
        }

        if (category) {
            if (!isValidObjectId(category)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category ID format",
                });
            }
            // filter.category = category;
            filter.category = { $in: [new mongoose.Types.ObjectId(category as string)] };

        }

        if (name && typeof name === 'string' && name.trim() !== '') {
            filter.$or = [
                { 'name.ar': new RegExp(name.trim(), 'i') },
                { 'name.en': new RegExp(name.trim(), 'i') }
            ];
        }

        const stores = await Store.aggregate([
            { $match: filter },

            // ✅ جلب بيانات الكوبونات بدل populate
            {
                $lookup: {
                    from: 'coupons',
                    localField: '_id',
                    foreignField: 'store',
                    as: 'coupons'
                },
            },

            // ✅ اختيار اللغة حسب lang
            {
                $addFields: {
                    name: `$name.${lang}`,
                    description: `$description.${lang}`,
                    // 'coupons.description': `$coupons.description.${lang}`
                }
            },

            // ✅ اختيار اللغة لكل كوبون بداخل المتجر
            {
                $addFields: {
                    coupons: {
                        $map: {
                            input: '$coupons',
                            as: 'coupon',
                            in: {
                                $mergeObjects: [
                                    '$$coupon',
                                    { description: `$$coupon.description.${lang}` }
                                ]
                            }
                        }
                    }
                }
            },

            // ✅ استثناء الفئة
            { $project: { category: 0 } },

            // ✅ الترتيب والتصفح
            { $sort: { order: 1, createdAt: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
        ]);

        const totalCount = await Store.countDocuments(filter);
        const remainingPages = Math.max(Math.ceil((totalCount - skipped - stores.length) / limit), 0);

        res.status(200).json({
            success: true,
            message: stores.length > 0 ? "Stores retrieved successfully" : "No stores found",
            data: stores,
            pagination: {
                page,
                totalCount,
                remainingPages
            }
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
            .lean();

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