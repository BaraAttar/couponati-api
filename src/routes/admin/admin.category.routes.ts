import express from "express";
import { createCategory, deleteCategory, updateCategory } from "../../controllers/admin/admin.category.controller.js";
import { adminAuthMiddleware } from '../../middleware/auth.js';
import { validateBody } from "../../middleware/validateBody.js";
import { createCategorySchema, updateCategorySchema } from "../../validations/admin/admin.category.validator.js";
const router = express.Router();

router.use(adminAuthMiddleware);

router.post("/", validateBody(createCategorySchema), createCategory)
router.put("/:id", validateBody(updateCategorySchema), updateCategory)
router.delete("/:id", deleteCategory)

export default router;