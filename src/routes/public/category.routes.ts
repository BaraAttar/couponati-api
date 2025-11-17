import express from "express";
import { getCategories, getCategoryById } from "../../controllers/public/category.controller.js";
import { validateQuery } from "../../middleware/validateQuery.js";
import { categoryIdSchema, searchCategoriesSchema } from "../../validations/public/public.category.validation.js";
import { validateParams } from "../../middleware/validateParams.js";

const router = express.Router();

router.get("/", validateQuery(searchCategoriesSchema), getCategories)
router.get("/:id", validateParams(categoryIdSchema), getCategoryById)

export default router;