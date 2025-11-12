import type { Request, Response } from "express";
import { Category } from "../../models/Category.model.js";
import { Store } from "../../models/Store.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import type { CreateCategoryInput, UpdateCategoryInput } from "../../validations/admin/admin.category.validator.js";

//  Create new category 
export const createCategory = async (req: Request<{}, {}, CreateCategoryInput>, res: Response) => {
    try {
        const { name, active, order, icon } = req.body;

        //  تحقق من التكرار
        const exists = await Category.findOne({
            $or: [
                { 'name.ar': name.ar.trim() },
                { 'name.en': name.en.trim() },
            ],
        }).lean();

        if (exists) {
            return res.status(409).json({
                success: false,
                message: "Category with this name already exists"
            });
        }

        // إنشاء الفئة
        const category = new Category({
            name: {
                ar: name.ar.trim(),
                en: name.en.trim(),
            },
            active: active ?? true,
            order: order || 0,
            icon: icon || ''
        });

        const savedCategory = await category.save();

        //  إرجاع البيانات مع .lean()
        const categoryData = await Category.findById(savedCategory._id).lean();

        return res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: categoryData,
        });
    } catch (error) {
        console.error("createCategory error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            ...(process.env.NODE_ENV === "development" && {
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        });
    }
};

export const updateCategory = async (req: Request<{ id: string }, {}, UpdateCategoryInput>, res: Response) => {
    try {
        const { id } = req.params;
        const { name } = req.body;


        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID format",
            });
        }

        //  تحقق من وجود الفئة
        const existingCategory = await Category.findById(id).lean();
        if (!existingCategory) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        const updateData: Partial<UpdateCategoryInput> = {};

        //  تحديث الاسم مع التحقق من التكرار
        if (name !== undefined) {

            const newName: any = {};
            if (name.ar?.trim()) newName.ar = name.ar.trim();
            if (name.en?.trim()) newName.en = name.en.trim();

            // دمج الاسم القديم مع الجديد
            const mergedName = {
                ar: newName.ar ?? existingCategory.name?.ar,
                en: newName.en ?? existingCategory.name?.en,
            };

            // ✅ تحقق بعد الدمج: لا يمكن أن تكون أي لغة فارغة
            if (!mergedName.ar?.trim() || !mergedName.en?.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Both Arabic and English names must be filled (cannot be empty).",
                });
            }

            // تحقق من التكرار
            const nameConditions = [];
            if (newName.ar) nameConditions.push({ 'name.ar': newName.ar });
            if (newName.en) nameConditions.push({ 'name.en': newName.en });

            if (nameConditions.length > 0) {
                const duplicate = await Category.aggregate([
                    {
                        $match: {
                            $or: nameConditions,
                            _id: { $ne: new mongoose.Types.ObjectId(id) },
                        },

                    },
                    { $limit: 1 }
                ])

                if (duplicate.length > 0) {
                    return res.status(409).json({
                        success: false,
                        message: "Category with this name already exists.",
                    });
                }
            }

            updateData.name = mergedName;
        }

        //  باقي الحقول
        if (req.body.active !== undefined) {
            updateData.active = req.body.active;
        }

        if (req.body.order !== undefined) {
            updateData.order = req.body.order;
        }
        if (req.body.icon !== undefined) {
            updateData.icon = req.body.icon;
        }

        const category = await Category.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        }).lean();

        return res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: category,
        });
    } catch (error) {
        console.error("updateCategory error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            ...(process.env.NODE_ENV === "development" && {
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        });
    }
};

export const deleteCategory = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID format",
            });
        }

        // تحقق من المتاجر المرتبطة
        const relatedStoresCount = await Store.countDocuments({
            category: id
        });

        if (relatedStoresCount > 0) {
            return res.status(409).json({
                success: false,
                message: `Cannot delete category. ${relatedStoresCount} store(s) are using this category.`,
                data: { relatedStoresCount }
            });
        }

        //  حذف مع التحقق من الوجود (محسّن)
        const deletedCategory = await Category.findByIdAndDelete(id).lean();

        if (!deletedCategory) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully",
        });
    } catch (error) {
        console.error("deleteCategory error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            ...(process.env.NODE_ENV === "development" && {
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        });
    }
};

//  Toggle category status (دالة مشتركة)
const toggleCategoryStatus = async (req: Request, res: Response, activeStatus: boolean) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID format",
            });
        }

        //  تحديث مع التحقق من الوجود بـ query واحد فقط (محسّن)
        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            { active: activeStatus },
            { new: true, runValidators: true }
        ).lean();

        if (!updatedCategory) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: `Category ${activeStatus ? 'activated' : 'deactivated'} successfully`,
            data: updatedCategory,
        });
    } catch (error) {
        console.error(`${activeStatus ? 'activate' : 'deactivate'}Category error:`, error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            ...(process.env.NODE_ENV === "development" && {
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        });
    }
}

//  Deactivate category
export const deactivateCategory = async (req: Request, res: Response) => {
    return toggleCategoryStatus(req, res, false);
}

//  Activate category
export const activateCategory = async (req: Request, res: Response) => {
    return toggleCategoryStatus(req, res, true);
}