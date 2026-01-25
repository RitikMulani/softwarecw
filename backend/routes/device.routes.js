import express from 'express';
import * as deviceController from '../controllers/device.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/device/readings:
 *   post:
 *     summary: Store a new biometric reading
 *     tags: [Device]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               heart_rate:
 *                 type: number
 *               blood_pressure_sys:
 *                 type: number
 *               blood_pressure_dia:
 *                 type: number
 *               spo2:
 *                 type: number
 *               body_temp:
 *                 type: number
 *               hrv:
 *                 type: number
 *               steps:
 *                 type: number
 */
router.post('/readings', authenticateToken, deviceController.storeReading);

/**
 * @swagger
 * /api/device/readings/latest:
 *   get:
 *     summary: Get latest biometric reading
 *     tags: [Device]
 *     security:
 *       - bearerAuth: []
 */
router.get('/readings/latest', authenticateToken, deviceController.getLatestReading);

/**
 * @swagger
 * /api/device/readings/history:
 *   get:
 *     summary: Get readings with validation status
 *     tags: [Device]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *         description: Number of days to retrieve (default 7)
 */
router.get('/readings/history', authenticateToken, deviceController.getReadingsWithValidation);

export default router;
