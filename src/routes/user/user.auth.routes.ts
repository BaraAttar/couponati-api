import express from 'express';
import { googleLogin, verifyToken } from '../../controllers/user/user.auth.controller.js';
import { userAuthMiddleware } from "../../middleware/auth.js"
import { authRateLimiter } from "../../middleware/rateLimiter.js";
import { validateBody } from '../../middleware/validateBody.js';
import { googleTokenSchema } from '../../validations/user/user.auth.validation.js';

const router = express.Router();

router.post('/google/token',
    validateBody(googleTokenSchema),
    authRateLimiter,
    googleLogin
);


router.post('/verifyToken',
    userAuthMiddleware,
    verifyToken
);

export default router;
