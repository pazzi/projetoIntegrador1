const db = require('../config/db');

class Order {
  static create({ userId, totalAmount, deliveryAddress }, callback) {
    const query = 'INSERT INTO orders (user_id, total_amount, delivery_address) VALUES (?, ?, ?)';
    db.query(query, [userId, totalAmount, deliveryAddress], (err, result) => {
      if (err) return callback(err);
      callback(null, result.insertId);
    });
  }

  static addOrderItem({ orderId, productId, quantity, unitPrice }, callback) {
    const query = 'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)';
    db.query(query, [orderId, productId, quantity, unitPrice], callback);
  }

  static getByUser(userId, callback) {
    const query = `
      SELECT o.id, o.total_amount, o.status, o.created_at, 
             GROUP_CONCAT(CONCAT(oi.quantity, 'x ', p.name) SEPARATOR ', ') as items
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;
    db.query(query, [userId], callback);
  }
}

module.exports = Order;