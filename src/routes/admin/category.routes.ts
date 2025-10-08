import express from "express";
import { createCategory, deleteCategory, updateCategory } from "../../controllers/admin/category.controller.js";
import { authMiddleware, adminMiddleware } from '../../middleware/auth.js';
const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.post("/", createCategory)

router.put("/:id", updateCategory)

router.delete("/:id", deleteCategory)

export default router;