import express from 'express';
import * as leaderboardController from '../controllers/leaderboard.controller.js';

const router = express.Router();

/**
 * GET /api/leaderboard
 * Get top 5 users with lowest stress levels
 */
router.get('/', leaderboardController.getTopStressLeaderboard);

export default router;
