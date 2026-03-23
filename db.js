const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'weather.db'));

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS saved_weather (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    city TEXT NOT NULL,
    temperature REAL NOT NULL,
    condition TEXT NOT NULL,
    icon TEXT NOT NULL,
    saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

module.exports = db;