import express from "express";
import { activateStore, createStore, deactivateStore, deleteStore, getStoreById, getStores, updateStore } from "../controllers/store.controller.js";
const router = express.Router();

router.get("/", getStores)
router.get("/:id", getStoreById)

router.post("/", createStore)

router.put("/:id", updateStore)
router.put("/:id/deactivate", deactivateStore)
router.put("/:id/activate", activateStore)

router.delete("/:id", deleteStore)


export default router;