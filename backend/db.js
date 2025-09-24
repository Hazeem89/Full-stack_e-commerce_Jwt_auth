const Database = require('better-sqlite3');
const path = require('path');

// Create database connection
const db = new Database(path.join(__dirname, 'db', 'fashion.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log('Database initialized successfully');

module.exports = db;