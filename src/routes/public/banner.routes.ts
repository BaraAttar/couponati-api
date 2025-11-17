import express from 'express';
import { getBannerById, getBanners } from '../../controllers/public/banner.controller.js';
import { bannerIdSchema } from '../../validations/public/public.banner.validation.js';
import { validateParams } from '../../middleware/validateParams.js';
const router = express.Router();

router.get('/', getBanners);
router.get('/:id', validateParams(bannerIdSchema), getBannerById);

export default router; 