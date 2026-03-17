import express from 'express';
import * as pointsController from '../controllers/points.controller.js';

const router = express.Router();

/**
 * GET /api/points
 * Get top 5 users with highest points
 */
router.get('/', pointsController.getTopPointsLeaderboard);

export default router;
