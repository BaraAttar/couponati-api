import type { Request, Response } from "express";
import { Store } from "../../models/Store.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import type { CreateStoreInput, UpdateStoreInput } from "../../validations/admin/admin.store.validation.js";

// ✅ Create new store 
export const createStore = async (req: Request<{}, {}, CreateStoreInput>, res: Response) => {
    try {
        const { name, icon, banner, description, link, active, order, category } = req.body;
        const categoryArray = Array.isArray(category) ? category : [category]

        // ✅ تحقق من صحة IDs
        for (const cat of categoryArray) {
            if (!isValidObjectId(cat)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category ID format",
                });
            }
        };

        // ✅ تحقق من التكرار بـ query واحد (محسّن)
        const existingStore = await Store.findOne({
            $or: [
                { 'name.ar': name.ar.trim() },
                { 'name.en': name.en.trim() },
            ],
        }).lean();

        if (existingStore) {
            return res.status(409).json({
                success: false,
                message: `Store with this name already exists in one of these categories.`,
            });
        }

        // إنشاء المتجر الجديد
        const newStore = new Store({
            name: {
                ar: name.ar.trim(),
                en: name.en.trim(),
            },
            icon: icon?.trim() || null,
            banner: banner?.trim() || null,
            description: {
                ar: description?.ar?.trim() || '',
                en: description?.en?.trim() || '',
            },
            link: link?.trim() || null,
            active: active ?? true,
            order: order || 0,
            category: categoryArray,
        });

        const savedStore = await newStore.save();

        // ✅ جلب المتجر مع البيانات المرتبطة (محسّن بـ .lean())
        const populatedStore = await Store.findById(savedStore._id)
            .populate('category', 'name description')
            .lean();

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
            ...(process.env.NODE_ENV === "development" && {
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        });
    }
}

// ✅ Update store 
export const updateStore = async (req: Request<{ id: string }, {}, UpdateStoreInput>, res: Response) => {
    try {
        const { id } = req.params;
        const { name, icon, banner, description, link, active, order, category } = req.body;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid store ID format" });
        }

        const existingStore = await Store.findById(id).lean();
        if (!existingStore) {
            return res.status(404).json({ success: false, message: "Store not found" });
        }

        // const updateData: any = {};
        const updateData: Partial<UpdateStoreInput> = {};

        // ✅ تحديث الاسم
        if (name !== undefined) {

            const newName: any = {};
            if (name.ar?.trim()) newName.ar = name.ar.trim();
            if (name.en?.trim()) newName.en = name.en.trim();

            // دمج الاسم القديم مع الجديد
            const mergedName = {
                ar: newName.ar ?? existingStore.name?.ar,
                en: newName.en ?? existingStore.name?.en,
            };

            // تحقق من التكرار
            const nameConditions = [];
            if (newName.ar) nameConditions.push({ 'name.ar': newName.ar });
            if (newName.en) nameConditions.push({ 'name.en': newName.en });

            const duplicate = await Store.aggregate([
                {
                    $match: {
                        $or: nameConditions,
                        _id: { $ne: new mongoose.Types.ObjectId(id) }
                    }
                },
                { $limit: 1 }
            ]);

            if (duplicate.length > 0) {
                return res.status(409).json({ success: false, message: "Store name already exists in one of these categories." });
            }

            updateData.name = mergedName;
        }

        // ✅ تحديث التصنيفات
        if (category !== undefined) {
            const categoryArray = Array.isArray(category) ? category : [category];

            // تحقق من صحة IDs
            for (const cat of categoryArray) {
                if (!isValidObjectId(cat)) {
                    return res.status(400).json({ success: false, message: "Invalid category ID format" });
                }
            }

            updateData.category = Array.from(new Set([
                ...existingStore.category.map(String),
                ...categoryArray.map(String)
            ])).map(id => id);

        }

        // ✅ باقي الحقول
        if (icon !== undefined) updateData.icon = icon?.trim();

        if (banner !== undefined) updateData.banner = banner?.trim();
        if (description !== undefined)
            updateData.description = {
                ar: description?.ar?.trim() || '',
                en: description?.en?.trim() || '',
            };
        if (link !== undefined) updateData.link = link?.trim();
        if (active !== undefined) updateData.active = active;
        if (order !== undefined) updateData.order = order;

        // ✅ التحديث مع .lean() (محسّن)
        const updatedStore = await Store.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
            .populate('category', 'name description')
            .lean();

        res.status(200).json({
            success: true,
            message: "Store updated successfully",
            data: updatedStore,
        });
    } catch (error) {
        console.error("updateStore error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            ...(process.env.NODE_ENV === "development" && {
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        });
    }
};

// ✅ Delete store
export const deleteStore = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid store ID format",
            });
        }

        const deletedStore = await Store.findByIdAndDelete(id).lean();

        if (!deletedStore) {
            return res.status(404).json({
                success: false,
                message: "Store not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Store deleted successfully",
        });
    } catch (error) {
        console.error("deleteStore error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            ...(process.env.NODE_ENV === "development" && {
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        });
    }
}

// ✅ Toggle store status (دالة مشتركة)
const toggleStoreStatus = async (req: Request, res: Response, activeStatus: boolean) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid store ID format",
            });
        }

        // ✅ تحديث مع التحقق من الوجود بـ query واحد فقط (محسّن)
        const updatedStore = await Store.findByIdAndUpdate(
            id,
            { active: activeStatus },
            { new: true, runValidators: true }
        )
            .populate('category', 'name')
            .lean();

        if (!updatedStore) {
            return res.status(404).json({
                success: false,
                message: "Store not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: `Store ${activeStatus ? 'activated' : 'deactivated'} successfully`,
            data: updatedStore,
        });
    } catch (error) {
        console.error(`${activeStatus ? 'activate' : 'deactivate'}Store error:`, error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            ...(process.env.NODE_ENV === "development" && {
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        });
    }
}

// ✅ Deactivate store
export const deactivateStore = async (req: Request, res: Response) => {
    return toggleStoreStatus(req, res, false);
}

// ✅ Activate store
export const activateStore = async (req: Request, res: Response) => {
    return toggleStoreStatus(req, res, true);
}