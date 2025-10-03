import type { Request, Response } from "express";
import { Store } from "../models/Store.model.js";
import { Category } from "../models/Category.model.js";
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

        if (name) {
            // filter.$or = [
            //     { name_ar: { $regex: name as string, $options: 'i' } },
            //     { name_en: { $regex: name as string, $options: 'i' } },
            // ];
            filter.name = { $regex: name as string, $options: 'i' };

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

// ✅ Create new store 
export const createStore = async (req: Request, res: Response) => {
    try {
        const { name, icon, banner, description, link, active, order, category } = req.body;

        // التحقق من الحقول المطلوبة
        if (!name?.trim() || !category) {
            return res.status(400).json({
                success: false,
                message: "Store name and category are required",
            });
        }

        // التحقق من صحة category ID
        if (!isValidObjectId(category)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID format",
            });
        }

        // التحقق من وجود الفئة
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        // التحقق من عدم تكرار الاسم في نفس الفئة
        const existingStore = await Store.findOne({
            name: name.trim(),
            category
        });
        if (existingStore) {
            return res.status(409).json({
                success: false,
                message: "Store with this name already exists in this category",
            });
        }

        // إنشاء المتجر الجديد
        const newStore = new Store({
            name: name.trim(),
            icon: icon?.trim() || null,
            banner: banner?.trim() || null,
            description: description?.trim() || '',
            link: link?.trim() || null,
            active: active ?? true,
            order: order || 0,
            category,
        });

        const savedStore = await newStore.save();

        // جلب المتجر مع البيانات المرتبطة
        const populatedStore = await Store.findById(savedStore._id)
            .populate('category', 'name description')

        return res.status(201).json({
            success: true,
            message: "Store created successfully",
            data: populatedStore,
        });
    } catch (error) {
        console.error("createStore error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: process.env.NODE_ENV === "development" ? error : undefined,
        });
    }
}

// ✅ Update store 
export const updateStore = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, icon, banner, description, link, active, order, category } = req.body;


        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid store ID format",
            });
        }

        // التحقق من صحة category ID إذا تم توفيره
        if (category && !isValidObjectId(category)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID format",
            });
        }

        // التحقق من وجود المتجر
        const existingStore = await Store.findById(id);
        if (!existingStore) {
            return res.status(404).json({
                success: false,
                message: "Store not found",
            });
        }

        // التحقق من وجود الفئة إذا تم تحديثها
        if (category && category !== existingStore.category.toString()) {
            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                return res.status(404).json({
                    success: false,
                    message: "Category not found",
                });
            }
        }

        // التحقق من عدم تكرار الاسم
        if (name && name.trim() !== existingStore.name) {
            const duplicateStore = await Store.findOne({
                name: name.trim(),
                category: category || existingStore.category,
                _id: { $ne: id }
            });
            if (duplicateStore) {
                return res.status(409).json({
                    success: false,
                    message: "Store with this name already exists in this category",
                });
            }
        }

        // بناء كائن التحديث
        const updateData: any = {};
        if (name !== undefined) updateData.name = name.trim();
        if (icon !== undefined) updateData.icon = icon?.trim() || null;
        if (banner !== undefined) updateData.banner = banner?.trim() || null;
        if (description !== undefined) updateData.description = description?.trim() || '';
        if (link !== undefined) updateData.link = link?.trim() || null;
        if (active !== undefined) updateData.active = active;
        if (order !== undefined) updateData.order = order;
        if (category !== undefined) updateData.category = category;

        // تحديث المتجر
        const updatedStore = await Store.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        ).populate('category', 'name description')

        return res.status(200).json({
            success: true,
            message: "Store updated successfully",
            data: updatedStore,
        });
    } catch (error) {
        console.error("updateStore error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: process.env.NODE_ENV === "development" ? error : undefined,
        });
    }
}

// ✅ Delete store
export const deleteStore = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name } = req.body;


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

        if (!name?.trim() || name.trim() !== store.name) {
            return res.status(400).json({
                success: false,
                message: "Store name does not match. Please provide the exact name to confirm deletion.",
            });
        }

        await Store.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Store deleted successfully",
            data: {
                deletedStore: store,
            },
        });
    } catch (error) {
        console.error("deleteStore error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: process.env.NODE_ENV === "development" ? error : undefined,
        });
    }
}

// ✅ Deactivate store
export const deactivateStore = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid store ID format",
            });
        }

        const existingStore = await Store.findById(id);
        if (!existingStore) {
            return res.status(404).json({
                success: false,
                message: "Store not found",
            });
        }

        const updatedStore = await Store.findByIdAndUpdate(
            id,
            { active: false },
            { new: true, runValidators: true }
        ).populate('category', 'name')

        return res.status(200).json({
            success: true,
            message: "Store deactivated successfully",
            data: updatedStore,
        });
    } catch (error) {
        console.error("deactivateStore error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: process.env.NODE_ENV === "development" ? error : undefined,
        });
    }
}

// ✅ Activate store
export const activateStore = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid store ID format",
            });
        }

        const existingStore = await Store.findById(id);
        if (!existingStore) {
            return res.status(404).json({
                success: false,
                message: "Store not found",
            });
        }

        const updatedStore = await Store.findByIdAndUpdate(
            id,
            { active: true },
            { new: true, runValidators: true }
        ).populate('category', 'name')

        return res.status(200).json({
            success: true,
            message: "Store activated successfully",
            data: updatedStore,
        });
    } catch (error) {
        console.error("activateStore error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: process.env.NODE_ENV === "development" ? error : undefined,
        });
    }
}