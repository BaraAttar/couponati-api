import express from "express";
import { authMiddleware } from "../../middleware/auth.js";
import { getUserFavourites, addToFavourites, removeFromFavourites } from "../../controllers/user/store.controller.js";
const router = express.Router();
router.use(authMiddleware);

router.get("/favourites/my", getUserFavourites);
router.post("/favourites", addToFavourites);
router.delete("/favourites/:storeId", removeFromFavourites);

export default router;