import express from "express"
import { getCoupons, getCouponsByStoreId, getCouponById } from "../../controllers/public/coupon.controller.js";
import { validateParams } from "../../middleware/validateParams.js";
import { searchCouponsSchema, searchCouponsByIdSchema } from "../../validations/public/public.coupon.validation.js";
import { validateQuery } from "../../middleware/validateQuery.js";
const router = express.Router();

router.get("/", validateQuery(searchCouponsSchema), getCoupons);
router.get("/store/:id", validateParams(searchCouponsByIdSchema), getCouponsByStoreId);
router.get("/:id", validateParams(searchCouponsByIdSchema), getCouponById);

export default router