const db = require('../db');

class SavedWeather {
  static save(userId, city, temperature, condition, icon) {
    const stmt = db.prepare(`
      INSERT INTO saved_weather (user_id, city, temperature, condition, icon)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(userId, city, temperature, condition, icon);
    return this.findById(info.lastInsertRowid);
  }

  static findByUser(userId) {
    const stmt = db.prepare(`
      SELECT id, city, temperature, condition, icon, saved_at
      FROM saved_weather
      WHERE user_id = ?
      ORDER BY saved_at DESC
    `);
    return stmt.all(userId);
  }

  static findById(id) {
    const stmt = db.prepare(`
      SELECT id, user_id, city, temperature, condition, icon, saved_at
      FROM saved_weather
      WHERE id = ?
    `);
    return stmt.get(id);
  }

  static delete(id, userId) {
    const stmt = db.prepare('DELETE FROM saved_weather WHERE id = ? AND user_id = ?');
    return stmt.run(id, userId);
  }
}

module.exports = SavedWeather;