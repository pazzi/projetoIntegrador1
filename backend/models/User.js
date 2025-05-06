const db = require('../config/db');

class User {
  static create({ name, email, phone, address, password }, callback) {
    const query = 'INSERT INTO users (name, email, phone, address, password) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [name, email, phone, address, password], callback);
  }

  static findByEmail(email, callback) {
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], callback);
  }

  static findById(id, callback) {
    const query = 'SELECT id, name, email, phone, address FROM users WHERE id = ?';
    db.query(query, [id], callback);
  }
}

module.exports = User;