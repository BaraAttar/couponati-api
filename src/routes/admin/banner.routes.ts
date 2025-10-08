import express from 'express';
import { createBanner, deleteBanner, updateBanner } from '../../controllers/admin/banner.controller.js';
import { authMiddleware, adminMiddleware } from '../../middleware/auth.js';
const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.post('/', createBanner);
router.put('/:id', updateBanner);
router.delete('/:id', deleteBanner);

export default router; 