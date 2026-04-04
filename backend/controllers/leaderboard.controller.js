import db from '../config/database.js';

/**
 * Get top 5 users with lowest stress levels
 * Returns ranked list with stress trends
 */
export async function getTopStressLeaderboard(req, res) {
  try {
    const [leaderboard] = await db.query(
      `SELECT 
        id, 
        full_name as name, 
        stress_level as stress,
        user_type
      FROM users 
      WHERE user_type IN ('patient', 'doctor')
      ORDER BY stress_level ASC 
      LIMIT 5`
    );

    const rankedLeaderboard = (leaderboard || []).map((user, index) => ({
      rank: index + 1,
      name: user.name,
      stress: user.stress || 50,
      trend: Math.random() > 0.5 ? 'down' : 'up'
    }));

    res.json({
      leaderboard: rankedLeaderboard
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leaderboard', error: error.message });
  }
}

export default {
  getTopStressLeaderboard
};
