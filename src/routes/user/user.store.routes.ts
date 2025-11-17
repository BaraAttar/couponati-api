import express from "express";
import { userAuthMiddleware } from "../../middleware/auth.js";
import { getUserFavourites, addToFavourites, removeFromFavourites } from "../../controllers/user/user.store.controller.js";
import { validateBody } from "../../middleware/validateBody.js";
import { addFavouriteBodySchema, removeFavouriteParamsSchema } from "../../validations/user/user.store.validation.js";
import { validateParams } from "../../middleware/validateParams.js";
const router = express.Router();
router.use(userAuthMiddleware);

router.get("/favourites",
    getUserFavourites
);

router.post("/favourites",
    validateBody(addFavouriteBodySchema),
    addToFavourites
);

router.delete("/favourites/:storeId",
    validateParams(removeFavouriteParamsSchema),
    removeFromFavourites
);

export default router;