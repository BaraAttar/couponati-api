import express from 'express';
import { getBannerById, getBanners } from '../../controllers/public/banner.controller.js';
const router = express.Router();

router.get('/', getBanners);
router.get('/:id', getBannerById);

export default router; 