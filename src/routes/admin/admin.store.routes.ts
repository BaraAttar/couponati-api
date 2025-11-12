import express from "express";
import { activateStore, createStore, deactivateStore, deleteStore, updateStore } from "../../controllers/admin/admin.store.controller.js";
import { adminAuthMiddleware } from '../../middleware/auth.js';
import { validateBody } from "../../middleware/validateBody.js";
import { createStoreSchema, updateStoreSchema } from "../../validations/admin/admin.store.validation.js";
import { deleteConfirmBody } from "../../validations/admin/admin.delete-body.validation.js";
const router = express.Router();

router.use(adminAuthMiddleware);

router.post("/", validateBody(createStoreSchema), createStore)
router.put("/:id", validateBody(updateStoreSchema), updateStore)

router.put("/:id/deactivate", deactivateStore)
router.put("/:id/activate", activateStore)

router.delete("/:id", validateBody(deleteConfirmBody), deleteStore)


export default router;