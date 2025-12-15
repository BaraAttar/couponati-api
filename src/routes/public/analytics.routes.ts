import express from "express";
import { trackUserAction } from "../../controllers/public/analytics.controller.js";
import { apiRateLimiter } from "../../middleware/rateLimiter.js";

const router = express.Router();

// نستخدم Rate Limit لتجنب التلاعب بالعدادات بشكل مفرط
router.post("/track", apiRateLimiter, trackUserAction);

export default router;