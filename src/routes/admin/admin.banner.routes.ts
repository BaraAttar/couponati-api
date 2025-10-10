import express from 'express';
import { createBanner, deleteBanner, updateBanner } from '../../controllers/admin/admin.banner.controller.js';
import { adminAuthMiddleware } from '../../middleware/auth.js';
const router = express.Router();

router.use(adminAuthMiddleware);

router.post('/', createBanner);
router.put('/:id', updateBanner);
router.delete('/:id', deleteBanner);

export default router; 