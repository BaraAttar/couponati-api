import express from "express";
import { activateStore, createStore, deactivateStore, deleteStore, updateStore } from "../../controllers/admin/admin.store.controller.js";
import { adminAuthMiddleware } from '../../middleware/auth.js';
const router = express.Router();

router.use(adminAuthMiddleware);

router.post("/", createStore)

router.put("/:id", updateStore)
router.put("/:id/deactivate", deactivateStore)
router.put("/:id/activate", activateStore)

router.delete("/:id", deleteStore)


export default router;