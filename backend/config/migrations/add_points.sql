-- Add points field to users table (if not exists)
ALTER TABLE users ADD COLUMN IF NOT EXISTS points INT DEFAULT 0;

-- Create index for faster points leaderboard queries
CREATE INDEX IF NOT EXISTS idx_users_points ON users(points DESC);
