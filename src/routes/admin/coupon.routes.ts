import express from "express"
import { createCoupon, deleteCoupon, updateCoupon } from "../../controllers/admin/coupon.controller.js";
import { authMiddleware, adminMiddleware } from '../../middleware/auth.js';
const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.post("/", createCoupon);
router.put("/:id", updateCoupon);
router.delete("/:id", deleteCoupon);

export default router