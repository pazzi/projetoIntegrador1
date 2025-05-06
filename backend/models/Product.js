const db = require('../config/db');

class Product {
  static getAll(callback) {
    const query = `
      SELECT p.*, c.name as category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_available = TRUE
    `;
    db.query(query, callback);
  }

  static getByCategory(categoryId, callback) {
    const query = 'SELECT * FROM products WHERE category_id = ? AND is_available = TRUE';
    db.query(query, [categoryId], callback);
  }
}

module.exports = Product;