import express from "express"
import { createCoupon, deleteCoupon, getCoupons, updateCoupon } from "../controllers/coupon.controller.js";
const router = express.Router();

router.get("/" , getCoupons);
router.post("/" , createCoupon);
router.put("/:id" , updateCoupon);
router.delete("/:id", deleteCoupon); // إضافة DELETE

export default router