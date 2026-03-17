-- Add stress_level field to users table (if not exists)
ALTER TABLE users ADD COLUMN IF NOT EXISTS stress_level INT DEFAULT 50;

-- Create index for faster leaderboard queries
CREATE INDEX IF NOT EXISTS idx_users_stress_level ON users(stress_level ASC);
