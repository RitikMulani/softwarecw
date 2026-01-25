import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Create Supabase connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
    return;
  }
  console.log('✓ Database connected successfully');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  try {
    await pool.end();
    console.log('Database pool closed');
    process.exit(0);
  } catch (err) {
    console.error('Error closing pool:', err);
    process.exit(1);
  }
});

// Helper function to convert MySQL query to PostgreSQL
function convertQuery(sql, params) {
  // Convert ? placeholders to $1, $2, etc.
  let paramIndex = 1;
  const convertedSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
  
  // Convert NOW() to CURRENT_TIMESTAMP for inserts
  const finalSql = convertedSql.replace(/NOW\(\)/g, 'CURRENT_TIMESTAMP');
  
  return { sql: finalSql, params };
}

// Wrapper to maintain MySQL-like API but use PostgreSQL
const promisePool = {
  query: async (sql, params = []) => {
    const { sql: convertedSql, params: convertedParams } = convertQuery(sql, params);
    const result = await pool.query(convertedSql, convertedParams);
    
    // MySQL returns [rows, fields], PostgreSQL returns {rows, fields, ...}
    // Wrap in array to match MySQL style
    return [result.rows, result.fields];
  },
  execute: async (sql, params = []) => {
    const { sql: convertedSql, params: convertedParams } = convertQuery(sql, params);
    const result = await pool.query(convertedSql, convertedParams);
    return [result.rows, result.fields];
  }
};

export default promisePool;

