import express from "express";
import { getStoreById, getStores } from "../../controllers/public/store.controller.js";
import { validateQuery } from "../../middleware/validateQuery.js";
import { searchStoreSchema, storeIdSchema } from "../../validations/public/public.store.validation.js";
import { validateParams } from "../../middleware/validateParams.js";
const router = express.Router();

router.get("/", validateQuery(searchStoreSchema), getStores)
router.get("/:id", validateParams(storeIdSchema), getStoreById)

export default router;