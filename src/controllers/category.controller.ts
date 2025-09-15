import type { Request, Response } from "express";
import { Category } from "../models/Category.model.js";
import { isValidObjectId } from "mongoose";


// ✅ Get all categories 
export const getCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const categories = await Category.find().sort({ order: 1 });
        res.status(200).json({
            success: true,
            message: "Categories retrieved successfully",
            count: categories.length,
            data: categories,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error });
    }
};

// ✅ Get single category 
export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            res.status(400).json({
                success: false,
                message: "Invalid store ID format",
            });
            return;
        }

        const category = await Category.findById(id);
        if (!category) {
            res.status(404).json({ success: false, message: "Category not found" });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Category retrieved successfully",
            data: category,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error });
    }
};

// ✅ Create new category 
export const createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, active, order } = req.body;

        const exists = await Category.findOne({ name });
        if (exists) {
            res.status(400).json({ success: false, message: "Category with this name already exists" });
            return;
        }

        const category = new Category({ name, active, order });
        await category.save();

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error });
    }
};

// ✅ Update category 
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            res.status(400).json({
                success: false,
                message: "Invalid category ID format",
            });
            return;
        }

        // السماح فقط بتحديث هذه الحقول
        const allowedUpdates = ["name", "active", "order"];
        const updateData: any = {};
        for (const key of allowedUpdates) {
            if (req.body[key] !== undefined) {
                updateData[key] = req.body[key];
            }
        }

        const category = await Category.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!category) {
            res.status(404).json({ success: false, message: "Category not found" });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: category,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error });
    }
};

// ✅ Delete category 
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!isValidObjectId(id)) {
            res.status(400).json({
                success: false,
                message: "Invalid category ID format",
            });
            return;
        }

        const category = await Category.findById(id);
        if (!category) {
            res.status(404).json({ success: false, message: "Category not found" });
            return;
        }

        // تحقق من الاسم
        if (!name?.trim() || name.trim() !== category.name) {
            res.status(400).json({
                success: false,
                message: "Category name does not match. Please provide the exact name to confirm deletion.",
            });
            return;
        }

        await category.deleteOne(); // أو findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Category deleted successfully",
            data: category,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error });
    }
};

