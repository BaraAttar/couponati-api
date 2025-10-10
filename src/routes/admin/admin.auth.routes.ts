import express from 'express';
import { adminLogin, adminSignup } from '../../controllers/admin/admin.auth.controller.js';
// import { googleLogin, verifyToken } from '../../controllers/user/auth.controller.js';
// import { authMiddleware } from "../../middleware/auth.js"
// import { authRateLimiter } from "../../middleware/rateLimiter.js";

const router = express.Router();

router.post('/signup', adminSignup);
router.post('/login', adminLogin);
// router.post('/verifyToken', authMiddleware, verifyToken);

export default router;
