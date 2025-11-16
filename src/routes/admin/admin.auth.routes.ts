import express from 'express';
import { adminLogin, adminSignup } from '../../controllers/admin/admin.auth.controller.js';
import { validateBody } from '../../middleware/validateBody.js';
import { createAdminSchema, loginAdminSchema } from '../../validations/admin/admin.auth.validation.js';
import { authRateLimiter } from "../../middleware/rateLimiter.js";

const router = express.Router();
router.use(authRateLimiter)

router.post('/signup', validateBody(createAdminSchema), adminSignup);
router.post('/login', validateBody(loginAdminSchema), adminLogin);

export default router;
