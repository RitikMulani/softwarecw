import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Update user profile
 */
router.put('/profile', authenticateToken, authController.updateProfile);

export default router;
