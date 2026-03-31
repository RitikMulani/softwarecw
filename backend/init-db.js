import fs from 'fs';
import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const { Pool } = pg;

async function initializeDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
  });

  try {
    console.log('🔄 Initializing database schema...\n');

    // Read the SQL file
    const sqlPath = './config/database.sql';
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`SQL file not found: ${sqlPath}`);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split statements more carefully to handle multi-line statements
    let statements = [];
    let current = '';
    const lines = sql.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip comments and empty lines
      if (trimmed.startsWith('--') || trimmed.length === 0) {
        continue;
      }

      current += ' ' + line;

      // Check if statement ends with semicolon
      if (trimmed.endsWith(';')) {
        statements.push(current.trim());
        current = '';
      }
    }

    // Add any remaining statement
    if (current.trim().length > 0) {
      statements.push(current.trim());
    }

    let executed = 0;
    let skipped = 0;

    for (const statement of statements) {
      if (statement.length === 0) continue;

      try {
        // Remove trailing semicolon for execution
        const cleanStmt = statement.endsWith(';') ? statement.slice(0, -1) : statement;
        
        await pool.query(cleanStmt);
        executed++;
        console.log(`✓ Executed: ${cleanStmt.substring(0, 70).replace(/\n/g, ' ')}...`);
      } catch (err) {
        // Ignore "already exists" errors
        if (err.message.includes('already exists') || 
            err.message.includes('duplicate key') ||
            err.message.includes('42P07') || // PostgreSQL error code for duplicate relation
            err.message.includes('42723')) { // Duplicate function
          skipped++;
          console.log(`⚠ Skipped: ${statement.substring(0, 50).replace(/\n/g, ' ')}...`);
        } else {
          console.error(`❌ Error: ${err.message}`);
          console.error(`   Statement: ${statement.substring(0, 100).replace(/\n/g, ' ')}`);
        }
      }
    }

    console.log(`\n✅ Database initialization complete! (Executed: ${executed}, Skipped: ${skipped})`);
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Fatal error during database initialization:', error);
    process.exit(1);
  }
}

initializeDatabase();
