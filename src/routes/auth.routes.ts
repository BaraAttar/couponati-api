import express from 'express';
import { googleLogin, verifyToken } from '../controllers/auth.controller.js';
import { authMiddleware } from "../middleware/auth.js"
const router = express.Router();

router.post('/google/token', googleLogin);
router.post('/verifyToken', authMiddleware, verifyToken);

export default router;
