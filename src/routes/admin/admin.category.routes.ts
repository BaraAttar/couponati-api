import express from "express";
import { createCategory, deleteCategory, updateCategory } from "../../controllers/admin/admin.category.controller.js";
import { adminAuthMiddleware } from '../../middleware/auth.js';
import { validateBody } from "../../middleware/validateBody.js";
import { createCategorySchema, updateCategorySchema } from "../../validations/admin/admin.category.validator.js";
import { deleteConfirmBody } from "../../validations/admin/admin.delete-body.validation.js";
const router = express.Router();

router.use(adminAuthMiddleware);

router.post("/", validateBody(createCategorySchema), createCategory)
router.put("/:id", validateBody(updateCategorySchema), updateCategory)
router.delete("/:id", validateBody(deleteConfirmBody), deleteCategory)

export default router;