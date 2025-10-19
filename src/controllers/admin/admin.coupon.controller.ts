import type { Request, Response } from "express";
import { Coupon } from "../../models/Coupon.model.js";
import { isValidObjectId, Types } from "mongoose";
import { Store } from "../../models/Store.model.js";

// أنواع البيانات القادمة من العميل
interface Description {
    ar: string;
    en: string;
}

interface CreateCouponBody {
    code: string;
    discount: number;
    description?: Description;
    expiryDate?: Date;
    active?: boolean;
    store: string;
}

interface UpdateCouponBody {
    code?: string;
    discount?: number;
    description?: Description;
    expiryDate?: Date;
    active?: boolean;
    store?: string;
}

interface DeleteCouponBody {
    confirm: string;
}

// إنشاء كوبون جديد
export const createCoupon = async (req: Request<{}, {}, CreateCouponBody>, res: Response) => {
    try {
        const { code, discount, description, expiryDate, active, store } = req.body;

        // تحقق من الحقول المطلوبة
        if (!code?.trim() || discount === undefined || !store) {
            return res.status(400).json({
                success: false,
                message: "Coupon code, discount, and store are required.",
            });
        }

        // تحقق من صحة ID المتجر
        if (!isValidObjectId(store)) {
            return res.status(400).json({
                success: false,
                message: "Invalid store ID format.",
            });
        }

        // تحقق من وجود المتجر وأنه فعّال 
        const existentStore = await Store.findById(store).lean();
        if (!existentStore) {
            return res.status(404).json({
                success: false,
                message: "Store not found.",
            });
        }

        if (!existentStore.active) {
            return res.status(400).json({
                success: false,
                message: "Cannot create coupon for inactive store.",
            });
        }

        // تحقق من الخصم
        if (typeof discount !== "number" || discount < 0 || discount > 100) {
            return res.status(400).json({
                success: false,
                message: "Discount must be a number between 0 and 100.",
            });
        }

        // تحقق من تاريخ الصلاحية 
        if (expiryDate) {
            const expiry = new Date(expiryDate);
            const now = new Date();
            now.setHours(0, 0, 0, 0); // بداية اليوم

            if (expiry < now) {
                return res.status(400).json({
                    success: false,
                    message: "Expiry date cannot be in the past.",
                });
            }
        }

        // تحقق من الوصف
        if (description) {
            if (!description.ar?.trim() || !description.en?.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Description must be in both Arabic and English.",
                });
            }
        }

        // تحقق من تكرار الكود في نفس المتجر 
        const existingCoupon = await Coupon.findOne({
            code: code.trim().toUpperCase(),
            store: store
        }).lean();

        if (existingCoupon) {
            return res.status(409).json({
                success: false,
                message: "Coupon code already exists for this store.",
            });
        }

        // إنشاء الكوبون
        const newCoupon = new Coupon({
            code: code.trim().toUpperCase(),
            discount,
            description: description
                ? {
                    ar: description.ar.trim(),
                    en: description.en.trim(),
                }
                : undefined,
            expiryDate,
            active: active ?? true,
            store,
        });

        const savedCoupon = await newCoupon.save();

        // جلب الكوبون مع بيانات المتجر 
        // ج 
        const populatedCoupon = await Coupon.findById(savedCoupon._id)
            .populate('store', 'name icon active')
            .lean();

        return res.status(201).json({
            success: true,
            message: "Coupon created successfully.",
            data: populatedCoupon,
        });
    } catch (error) {
        console.error("createCoupon error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error.",
            ...(process.env.NODE_ENV === "development" && {
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        });
    }
};

// تحديث كوبون
export const updateCoupon = async (req: Request<{ id: string }, {}, UpdateCouponBody>, res: Response) => {
    try {
        const { id } = req.params;
        const { code, discount, description, expiryDate, active, store } = req.body;

        // تحقق من صحة ID الكوبون
        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid coupon ID format.",
            });
        }

        // تحقق من وجود الكوبون
        const existingCoupon = await Coupon.findById(id).lean();
        if (!existingCoupon) {
            return res.status(404).json({
                success: false,
                message: "Coupon not found.",
            });
        }

        const updateData: any = {};

        // تحديث الكود مع التحقق من التكرار
        if (code !== undefined) {
            if (!code?.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Coupon code cannot be empty.",
                });
            }

            const normalizedCode = code.trim().toUpperCase();
            const storeToCheck = store || existingCoupon.store;

            // تحقق من التكرار 
            const duplicate = await Coupon.findOne({
                code: normalizedCode,
                store: storeToCheck,
                _id: { $ne: id }
            }).lean();

            if (duplicate) {
                return res.status(409).json({
                    success: false,
                    message: "Coupon code already exists for this store.",
                });
            }

            updateData.code = normalizedCode;
        }

        // تحديث المتجر
        if (store !== undefined) {
            if (!isValidObjectId(store)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid store ID format.",
                });
            }

            // تحقق من وجود المتجر وأنه فعّال 
            const existingStore = await Store.findById(store).lean();
            if (!existingStore) {
                return res.status(404).json({
                    success: false,
                    message: "Store not found.",
                });
            }

            if (!existingStore.active) {
                return res.status(400).json({
                    success: false,
                    message: "Cannot assign coupon to inactive store.",
                });
            }

            updateData.store = store;
        }

        // تحديث الخصم
        if (discount !== undefined) {
            if (typeof discount !== "number" || discount < 0 || discount > 100) {
                return res.status(400).json({
                    success: false,
                    message: "Discount must be a number between 0 and 100.",
                });
            }
            updateData.discount = discount;
        }

        // تحديث الوصف
        if (description !== undefined) {
            if (!description.ar?.trim() || !description.en?.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Description must be in both Arabic and English.",
                });
            }
            updateData.description = {
                ar: description.ar.trim(),
                en: description.en.trim(),
            };
        }

        // تحديث تاريخ الصلاحية 
        if (expiryDate !== undefined) {
            const expiry = new Date(expiryDate);
            const now = new Date();
            now.setHours(0, 0, 0, 0);

            if (expiry < now) {
                return res.status(400).json({
                    success: false,
                    message: "Expiry date cannot be in the past.",
                });
            }
            updateData.expiryDate = expiryDate;
        }

        // تحديث الحالة
        if (active !== undefined) {
            updateData.active = active;
        }

        // تحديث الكوبون 
        const updatedCoupon = await Coupon.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        )
            .populate('store', 'name icon active')
            .lean();

        return res.status(200).json({
            success: true,
            message: "Coupon updated successfully.",
            data: updatedCoupon,
        });
    } catch (error) {
        console.error("updateCoupon error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error.",
            ...(process.env.NODE_ENV === "development" && {
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        });
    }
};

// حذف كوبون
export const deleteCoupon = async (req: Request<{ id: string }, {}, DeleteCouponBody>, res: Response) => {
    try {
        const { id } = req.params;
        const { confirm } = req.body;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid coupon ID format.",
            });
        }

        // تحقق من كلمة التأكيد
        const normalizedConfirm = confirm?.trim().toLowerCase();
        const validConfirmations = ["delete", "حذف", "confirm"];

        if (!validConfirmations.includes(normalizedConfirm)) {
            return res.status(400).json({
                success: false,
                message: "Please type 'delete' or 'حذف' to confirm coupon deletion.",
            });
        }

        // حذف مع التحقق من الوجود 
        const deletedCoupon = await Coupon.findByIdAndDelete(id).lean();

        if (!deletedCoupon) {
            return res.status(404).json({
                success: false,
                message: "Coupon not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Coupon deleted successfully.",
        });
    } catch (error) {
        console.error("deleteCoupon error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error.",
            ...(process.env.NODE_ENV === "development" && {
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        });
    }
};

// Toggle coupon status (دالة مشتركة)
const toggleCouponStatus = async (req: Request, res: Response, activeStatus: boolean) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid coupon ID format.",
            });
        }

        // تحديث مع التحقق من الوجود بـ query واحد فقط 
        const updatedCoupon = await Coupon.findByIdAndUpdate(
            id,
            { active: activeStatus },
            { new: true, runValidators: true }
        )
            .populate('store', 'name icon')
            .lean();

        if (!updatedCoupon) {
            return res.status(404).json({
                success: false,
                message: "Coupon not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: `Coupon ${activeStatus ? 'activated' : 'deactivated'} successfully.`,
            data: updatedCoupon,
        });
    } catch (error) {
        console.error(`${activeStatus ? 'activate' : 'deactivate'}Coupon error:`, error);
        return res.status(500).json({
            success: false,
            message: "Server error.",
            ...(process.env.NODE_ENV === "development" && {
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        });
    }
};

// Deactivate coupon
export const deactivateCoupon = async (req: Request, res: Response) => {
    return toggleCouponStatus(req, res, false);
};

// Activate coupon
export const activateCoupon = async (req: Request, res: Response) => {
    return toggleCouponStatus(req, res, true);
};