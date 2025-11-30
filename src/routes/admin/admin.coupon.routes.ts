import express from "express"
import { createCoupon, activateCoupon, deactivateCoupon, deleteCoupon, updateCoupon } from "../../controllers/admin/admin.coupon.controller.js";
import { adminAuthMiddleware } from '../../middleware/auth.js';
import { validateBody } from "../../middleware/validateBody.js";
import { createCouponSchema, updateCouponSchema } from "../../validations/admin/admin.coupon.validation.js";
const router = express.Router();

router.use(adminAuthMiddleware);

router.post("/", validateBody(createCouponSchema), createCoupon);
router.put("/:id", validateBody(updateCouponSchema), updateCoupon);
router.delete("/:id", deleteCoupon);

router.put("/:id/activate", activateCoupon);
router.put("/:id/deactivate", deactivateCoupon);

export default router