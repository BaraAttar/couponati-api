import type { Request, Response } from "express";
import { Category } from "../../models/Category.model.js";
import { Store } from "../../models/Store.model.js";
import mongoose, { isValidObjectId } from "mongoose";

//  Create new category 
export const createCategory = async (req: Request, res: Response) => {
    try {
        const { name, active, order, icon } = req.body;

        //  تحقق من الاسم
        if (!name || typeof name !== 'object' || !name.ar?.trim() || !name.en?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Category name in Arabic and English are both required.',
            });
        }

        if (!icon) {
            return res.status(400).json({
                success: false,
                message: 'Category icon is required.',
            });
        }

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

//  Update category 
interface UpdateCategoryBody {
    name?: {
        ar?: string;
        en?: string;
    };
    active?: boolean;
    order?: number;
    icon?: string;
}

export const updateCategory = async (req: Request<{ id: string }, {}, UpdateCategoryBody>, res: Response) => {
    try {
        const { id } = req.params;

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

        const updateData: Partial<UpdateCategoryBody> = {};

        //  تحديث الاسم مع التحقق من التكرار
        if (req.body.name !== undefined) {
            const { ar, en } = req.body.name;

            if (!ar?.trim() || !en?.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Both Arabic and English names are required."
                });
            }

            // تحقق من التكرار
            const duplicate = await Category.aggregate([
                {
                    $match: {
                        $and: [
                            {
                                $or: [
                                    { 'name.ar': ar.trim() },
                                    { 'name.en': en.trim() }
                                ]
                            },
                            {
                                _id: { $ne: new mongoose.Types.ObjectId(id) }
                            }
                        ]
                    }
                },
                { $limit: 1 }
            ]);

            if (duplicate.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: "Category with this name already exists"
                });
            }

            updateData.name = { ar: ar.trim(), en: en.trim() };
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

        //  التحديث مع .lean() (محسّن)
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

//  Delete category 
interface DeleteCategoryBody {
    confirm: string
}

export const deleteCategory = async (req: Request<{ id: string }, {}, DeleteCategoryBody>, res: Response) => {
    try {
        const { id } = req.params;
        const { confirm } = req.body;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID format",
            });
        }

        //  تحقق من كلمة التأكيد
        const normalizedConfirm = confirm?.trim().toLowerCase();
        const validConfirmations = ["delete", "حذف", "confirm"];

        if (!validConfirmations.includes(normalizedConfirm)) {
            return res.status(400).json({
                success: false,
                message: "Please type 'delete' or 'حذف' to confirm category deletion.",
            });
        }

        //  تحقق من المتاجر المرتبطة (محسّن)
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