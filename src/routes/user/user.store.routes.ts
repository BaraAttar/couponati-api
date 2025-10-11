import express from "express";
import { userAuthMiddleware } from "../../middleware/auth.js";
import { getUserFavourites, addToFavourites, removeFromFavourites } from "../../controllers/user/user.store.controller.js";
const router = express.Router();
router.use(userAuthMiddleware);

router.get("/favourites", getUserFavourites);
router.post("/favourites", addToFavourites);
router.delete("/favourites/:storeId", removeFromFavourites);

export default router;