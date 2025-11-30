import express from 'express';
import { createBanner, deleteBanner, updateBanner } from '../../controllers/admin/admin.banner.controller.js';
import { adminAuthMiddleware } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validateBody.js';
import { createBannerSchema, updateBannerSchema } from '../../validations/admin/admin.banner.validation.js';
const router = express.Router();

router.use(adminAuthMiddleware);

router.post('/', validateBody(createBannerSchema), createBanner);
router.put('/:id', validateBody(updateBannerSchema), updateBanner);
router.delete('/:id', deleteBanner);

export default router; 