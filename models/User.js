const db = require('../db');
const bcrypt = require('bcrypt');

class User {
  static findByUsername(username) {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    return stmt.get(username);
  }

  static findById(id) {
    const stmt = db.prepare('SELECT id, username, created_at FROM users WHERE id = ?');
    return stmt.get(id);
  }

  static async create(username, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
    const info = stmt.run(username, hashedPassword);
    return { id: info.lastInsertRowid, username };
  }

  static async verifyPassword(username, password) {
    const user = this.findByUsername(username);
    if (!user) return null;
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return null;
    return user;
  }
}

module.exports = User;