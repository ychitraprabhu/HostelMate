const mysql = require('mysql2/promise');
require('dotenv').config();

// connect to database
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'password',
  database: process.env.DB_NAME || 'hostelmate_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
  .then((connection) => {
    console.log('Connected to MySQL database!');
    connection.release();
  })
  .catch((err) => {
    console.error('Error connecting to MySQL database:', err.message);
  });

module.exports = pool;
