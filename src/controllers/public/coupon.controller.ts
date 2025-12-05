import type { Request, Response } from "express";
import { Coupon } from "../../models/Coupon.model.js";
import mongoose, { isValidObjectId } from "mongoose";

export const getCoupons = async (req: Request, res: Response) => {
    try {
        const { store, active } = req.query;
        const filter: any = {};

        if (store) {
            if (isValidObjectId(store)) {
                filter.store = store;
            } else {
                return res.status(200).json({
                    success: true,
                    message: "No Coupons found",
                    data: [],
                    count: 0
                });
            }
        }

        if (active !== undefined) filter.active = active === "true";

        const coupons = await Coupon.find(filter).sort({ usedCount: -1 }).lean();

        return res.status(200).json({
            success: true,
            message: coupons.length > 0 ? "Coupons retrieved successfully" : "No Coupons found",
            data: coupons,
            count: coupons.length
        });
    } catch (error) {
        console.error("getCoupons error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: process.env.NODE_ENV === "development" ? error : undefined,
        });
    }
}

export const getCouponsByStoreId = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const coupons = await Coupon.find({ store: new mongoose.Types.ObjectId(id) }).sort({ usedCount: -1 }).lean();

        return res.status(200).json({
            success: true,
            message: coupons.length > 0 ? "Coupons retrieved successfully" : "No Coupons found",
            data: coupons,
            count: coupons.length
        });
    } catch (error) {
        console.error("getCoupons error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: process.env.NODE_ENV === "development" ? error : undefined,
        });
    }
}
export const getCouponById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const coupon = await Coupon.findById(id).lean();

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "No Coupon found with this id",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Coupons retrieved successfully",
            data: coupon,
        });
    } catch (error) {
        console.error("getCoupons error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: process.env.NODE_ENV === "development" ? error : undefined,
        });
    }
}

