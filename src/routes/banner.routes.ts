import express from 'express';
import { createBanner, deleteBanner, getBannerById, getBanners, updateBanner } from '../controllers/banner.controller.js';
const router = express.Router();

router.get('/', getBanners);
router.get('/:id', getBannerById);
router.post('/', createBanner);
router.put('/:id', updateBanner);
router.delete('/:id', deleteBanner);

export default router; 