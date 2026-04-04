import db from '../config/database.js';

/**
 * Get top 5 users by points
 * Identifies top 3 performers for special recognition
 */
export async function getTopPointsLeaderboard(req, res) {
  try {
    const [leaderboard] = await db.query(
      `SELECT 
        id, 
        full_name as name, 
        points,
        user_type
      FROM users 
      WHERE user_type IN ('patient', 'doctor')
      ORDER BY points DESC 
      LIMIT 5`
    );

    const rankedLeaderboard = (leaderboard || []).map((user, index) => ({
      rank: index + 1,
      name: user.name,
      points: user.points || 0,
      isTopThree: index < 3,
      multiplier: index < 3 ? 2 : 1
    }));

    res.json({
      leaderboard: rankedLeaderboard
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching points leaderboard', error: error.message });
  }
}

export default {
  getTopPointsLeaderboard
};
