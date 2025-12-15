import express from "express";
import { getDashboardStats, getTopCoupons } from "../../controllers/admin/admin.report.controller.js";
import { adminAuthMiddleware } from "../../middleware/auth.js";

const router = express.Router();

router.use(adminAuthMiddleware);

router.get("/dashboard", getDashboardStats);
router.get("/dashboard/top-coupons", getTopCoupons);

// TODO:
// router.get("/dashboard/kpi", ....);
// router.get("/dashboard/chart", ....);

export default router;