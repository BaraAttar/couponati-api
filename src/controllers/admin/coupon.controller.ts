import type { Request, Response } from "express";
import { Coupon } from "../../models/Coupon.model.js";
import { isValidObjectId } from "mongoose";
import { Store } from "../../models/Store.model.js";

export const createCoupon = async (req: Request, res: Response) => {
    try {
        const { code, discount, description, expiryDate, active, store } = req.body;

        if (!code || !code.trim() || discount === undefined || !store) {
            return res.status(400).json({
                success: false,
                message: "Coupon code and name and store and discount are required",
            });
        }

        if (!isValidObjectId(store)) {
            return res.status(400).json({
                success: false,
                message: "Invalid store ID format",
            });
        }

        const existentStore = await Store.findById(store);
        if (!existentStore) {
            return res.status(404).json({
                success: false,
                message: "Store not found",
            });
        }

        if (typeof discount !== "number" || discount < 0 || discount > 100) {
            return res.status(400).json({
                success: false,
                message: "Discount must be a number between 0 and 100",
            });
        }

        const newCoupon = new Coupon({
            code: code.trim(),
            discount: discount,
            description: description?.trim() || '',
            expiryDate: expiryDate,
            active: active ?? true,
            store: store
        });

        const savedCoupon = await newCoupon.save();

        return res.status(201).json({
            success: true,
            message: "Coupon created successfully",
            data: savedCoupon,
        });
    } catch (error) {
        console.error("createCoupon error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: process.env.NODE_ENV === "development" ? error : undefined,
        });
    }
}

export const updateCoupon = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { code, discount, description, expiryDate, active, store } = req.body;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid store ID format",
            });
        }

        if (store && !isValidObjectId(store)) {
            return res.status(400).json({
                success: false,
                message: "Invalid store ID format",
            });
        }

        if (store) {
            const existingStore = await Store.findById(store);
            if (!existingStore) {
                return res.status(404).json({
                    success: false,
                    message: "Store not found",
                });
            }
        }

        if (discount !== undefined) {
            if (typeof discount !== "number" || discount < 0 || discount > 100) {
                return res.status(400).json({
                    success: false,
                    message: "Discount must be a number between 0 and 100",
                });
            }
        }

        const coupon = await Coupon.findById(id);
        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "Coupon not found",
            });
        }

        if (code) coupon.code = code.trim();
        if (discount !== undefined) coupon.discount = discount;
        if (description !== undefined) coupon.description = description.trim();
        if (expiryDate) coupon.expiryDate = expiryDate;
        if (active !== undefined) coupon.active = active;
        if (store) coupon.store = store;

        await coupon.save();

        return res.status(200).json({
            success: true,
            message: "Coupon updated successfully",
            data: coupon,
        });

    } catch (error) {
        console.error("updateCoupon error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: process.env.NODE_ENV === "development" ? error : undefined,
        });
    }
}

export const deleteCoupon = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid coupon ID format",
            });
        }

        const coupon = await Coupon.findById(id);
        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "Coupon not found",
            });
        }

        await Coupon.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Coupon deleted successfully",
            data: coupon,
        });

    } catch (error) {
        console.error("deleteCoupon error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: process.env.NODE_ENV === "development" ? error : undefined,
        });
    }
};
