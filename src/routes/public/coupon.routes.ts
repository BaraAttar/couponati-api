import express from "express"
import { getCoupons } from "../../controllers/public/coupon.controller.js";
const router = express.Router();

router.get("/", getCoupons);

export default router