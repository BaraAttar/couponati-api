import express from "express"
import { createCoupon, activateCoupon, deactivateCoupon, deleteCoupon, updateCoupon } from "../../controllers/admin/admin.coupon.controller.js";
import { adminAuthMiddleware } from '../../middleware/auth.js';
const router = express.Router();

router.use(adminAuthMiddleware);

router.post("/", createCoupon);
router.put("/:id", updateCoupon);
router.delete("/:id", deleteCoupon);
router.put("/:id/activate", activateCoupon);
router.put("/:id/deactivate", deactivateCoupon);

export default router