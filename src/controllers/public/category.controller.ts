import type { Request, Response } from "express";
import { Category } from "../../models/Category.model.js";
import { isValidObjectId } from "mongoose";


// ✅ Get all categories 
export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await Category.find().sort({ order: 1 }).lean();
        return res.status(200).json({
            success: true,
            message: "Categories retrieved successfully",
            count: categories.length,
            data: categories,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error", error });
    }
};

// ✅ Get single category 
export const getCategoryById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid store ID format",
            });
        }

        const category = await Category.findById(id).lean();
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Category retrieved successfully",
            data: category,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error", error });
    }
};