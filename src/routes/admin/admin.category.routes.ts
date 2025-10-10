import express from "express";
import { createCategory, deleteCategory, updateCategory } from "../../controllers/admin/admin.category.controller.js";
import { adminAuthMiddleware } from '../../middleware/auth.js';
const router = express.Router();

router.use(adminAuthMiddleware);

router.post("/", createCategory)

router.put("/:id", updateCategory)

router.delete("/:id", deleteCategory)

export default router;