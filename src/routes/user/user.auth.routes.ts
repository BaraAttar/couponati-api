import express from 'express';
import { googleLogin, verifyToken } from '../../controllers/user/user.auth.controller.js';
import { userAuthMiddleware } from "../../middleware/auth.js"
import { authRateLimiter } from "../../middleware/rateLimiter.js";

const router = express.Router();

router.post('/google/token', authRateLimiter, googleLogin);
router.post('/verifyToken', userAuthMiddleware, verifyToken);

export default router;
