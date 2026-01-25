import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, provider]
 */
router.post('/register', authLimiter, authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 */
router.post('/login', authLimiter, authController.login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 */
router.post('/refresh', authController.refresh);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.get('/me', authenticateToken, authController.me);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 */
router.post('/logout', authenticateToken, authController.logout);

/**
 * @swagger
 * /api/auth/profile:
 *   patch:
 *     summary: Update user profile
 *     tags: [Auth]
 */
router.patch(
  '/profile',
  authenticateToken,
  authController.updateProfile
);

/**
 * @swagger
 * /api/auth/delete-account:
 *   delete:
 *     summary: Delete user account (GDPR)
 *     tags: [Auth]
 */
router.delete('/delete-account', authenticateToken, authController.deleteAccount);

export default router;
