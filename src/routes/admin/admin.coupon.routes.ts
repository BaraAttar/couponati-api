import express from "express"
import { createCoupon, deleteCoupon, updateCoupon } from "../../controllers/admin/admin.coupon.controller.js";
import { adminAuthMiddleware } from '../../middleware/auth.js';
const router = express.Router();

router.use(adminAuthMiddleware);

router.post("/", createCoupon);
router.put("/:id", updateCoupon);
router.delete("/:id", deleteCoupon);

export default router