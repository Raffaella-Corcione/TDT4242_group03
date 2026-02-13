// server/config/database.js
const mysql = require('mysql2');
require('dotenv').config();

/**
 * Create a connection pool to MySQL database
 * Using a pool allows multiple simultaneous connections and better performance
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'ai_guidebook_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Convert pool to use promises for async/await syntax
const promisePool = pool.promise();

/**
 * Initialize database and create table if it doesn't exist
 * This function should be called when the server starts
 */
async function initializeDatabase() {
  try {
    // Create database if it doesn't exist
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 3306
    }).promise();

    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'ai_guidebook_db'}`);
    console.log('✅ Database created or already exists');
    await connection.end();

    // Create ai_declarations table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ai_declarations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_name VARCHAR(255) NOT NULL,
        assignment_title VARCHAR(255) NOT NULL,
        ai_tool VARCHAR(255) NOT NULL,
        usage_purpose TEXT NOT NULL,
        ai_content TEXT NOT NULL,
        screenshot_path VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_name (user_name),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await promisePool.query(createTableQuery);
    console.log('✅ Table "ai_declarations" created or already exists');

  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    throw error;
  }
}

module.exports = {
  pool: promisePool,
  initializeDatabase
};