import express from 'express';
import { adminLogin, adminSignup } from '../../controllers/admin/admin.auth.controller.js';
import { validateBody } from '../../middleware/validateBody.js';
import { createAdminSchema } from '../../validations/admin/admin.auth.validation.js';
// import { googleLogin, verifyToken } from '../../controllers/user/auth.controller.js';
// import { authRateLimiter } from "../../middleware/rateLimiter.js";

const router = express.Router();

router.post('/signup', validateBody(createAdminSchema), adminSignup);
router.post('/login', adminLogin);

export default router;
