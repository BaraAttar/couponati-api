import express from "express";
import { getStoreById, getStores } from "../../controllers/public/store.controller.js";
const router = express.Router();

router.get("/", getStores)
router.get("/:id", getStoreById)

export default router;