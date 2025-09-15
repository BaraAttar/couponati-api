import type { Request, Response } from "express";
import { Coupon } from "../models/Coupon.model.js";
import { isValidObjectId } from "mongoose";
import { Store } from "../models/Store.model.js";

export const getCoupons = async (req: Request, res: Response): Promise<void> => {
    try {
        const { store, active } = req.query;
        const filter: any = {};

        if (store) {
            if (isValidObjectId(store)) {
                filter.store = store;
            } else {
                res.status(200).json({
                    success: true,
                    message: "No Coupons found",
                    data: [],
                    count: 0
                });
                return
            }
        }

        if (active !== undefined) filter.active = active === "true";

        const coupons = await Coupon.find(filter).sort({ usedCount: -1 });

        res.status(200).json({
            success: true,
            message: coupons.length > 0 ? "Coupons retrieved successfully" : "No Coupons found",
            data: coupons,
            count: coupons.length
        })
    } catch (error) {
        console.error("getCoupons error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: process.env.NODE_ENV === "development" ? error : undefined,
        });
    }
}

export const createCoupon = async (req: Request, res: Response): Promise<void> => {
    try {
        const { code, discount, description, expiryDate, active, store } = req.body;

        if (!code || !code.trim() || discount === undefined || !store) {
            res.status(400).json({
                success: false,
                message: "Coupon code and name and store and discount are required",
            })
            return;
        }

        if (!isValidObjectId(store)) {
            res.status(400).json({
                success: false,
                message: "Invalid store ID format",
            });
            return;
        }

        const existentStore = await Store.findById(store);
        if (!existentStore) {
            res.status(404).json({
                success: false,
                message: "Store not found",
            });
            return;
        }

        if (typeof discount !== "number" || discount < 0 || discount > 100) {
            res.status(400).json({
                success: false,
                message: "Discount must be a number between 0 and 100",
            });
            return;
        }

        const newCoupon = new Coupon({
            code: code.trim(),
            discount: discount,
            description: description?.trim() || '',
            expiryDate: expiryDate,
            active: active ?? true,
            store: store
        })

        const savedCoupon = await newCoupon.save();

        res.status(201).json({
            success: true,
            message: "Coupon created successfully",
            data: savedCoupon,
        });
    } catch (error) {
        console.error("createCoupon error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: process.env.NODE_ENV === "development" ? error : undefined,
        });
    }
}


export const updateCoupon = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { code, discount, description, expiryDate, active, store } = req.body;

        if (!isValidObjectId(id)) {
            res.status(400).json({
                success: false,
                message: "Invalid store ID format",
            });
            return;
        }

        if (store && !isValidObjectId(store)) {
            res.status(400).json({
                success: false,
                message: "Invalid store ID format",
            });
            return;
        }

        if (store) {
            const existingStore = await Store.findById(store);
            if (!existingStore) {
                res.status(404).json({
                    success: false,
                    message: "Store not found",
                });
                return;
            }
        }

        if (discount !== undefined) {
            if (typeof discount !== "number" || discount < 0 || discount > 100) {
                res.status(400).json({
                    success: false,
                    message: "Discount must be a number between 0 and 100",
                });
                return;
            }
        }

        const coupon = await Coupon.findById(id);
        if (!coupon) {
            res.status(404).json({
                success: false,
                message: "Coupon not found",
            });
            return;
        }

        if (code) coupon.code = code.trim();
        if (discount !== undefined) coupon.discount = discount;
        if (description !== undefined) coupon.description = description.trim();
        if (expiryDate) coupon.expiryDate = expiryDate;
        if (active !== undefined) coupon.active = active;
        if (store) coupon.store = store;

        await coupon.save();

        res.status(200).json({
            success: true,
            message: "Coupon updated successfully",
            data: coupon,
        });

    } catch (error) {
        console.error("updateCoupon error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: process.env.NODE_ENV === "development" ? error : undefined,
        });
    }
}

export const deleteCoupon = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            res.status(400).json({
                success: false,
                message: "Invalid coupon ID format",
            });
            return;
        }

        const coupon = await Coupon.findById(id);
        if (!coupon) {
            res.status(404).json({
                success: false,
                message: "Coupon not found",
            });
            return;
        }

        await Coupon.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Coupon deleted successfully",
            data: coupon,
        });

    } catch (error) {
        console.error("deleteCoupon error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: process.env.NODE_ENV === "development" ? error : undefined,
        });
    }
};
