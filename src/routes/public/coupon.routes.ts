import express from "express"
import { getCoupons } from "../../controllers/public/coupon.controller.js";
import { validateParams } from "../../middleware/validateParams.js";
import { searchCouponsSchema } from "../../validations/public/public.coupon.validation.js";
const router = express.Router();

router.get("/", validateParams(searchCouponsSchema), getCoupons);

export default router