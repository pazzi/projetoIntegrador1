const Order = require('../models/Order');
const Product = require('../models/Product');
const db = require('../config/db');

const OrderController = {
  async createOrder(req, res) {
    try {
      const { userId, totalAmount, deliveryAddress, items } = req.body;

      // Validação básica
      if (!userId || !totalAmount || !deliveryAddress || !items || items.length === 0) {
        return res.status(400).json({ message: 'Dados do pedido incompletos' });
      }

      // Inicia uma transação
      db.beginTransaction(async (err) => {
        if (err) {
          console.error('Erro ao iniciar transação:', err);
          return res.status(500).json({ message: 'Erro ao criar pedido' });
        }

        try {
          // Cria o pedido principal
          const orderId = await new Promise((resolve, reject) => {
            Order.create({ userId, totalAmount, deliveryAddress }, (err, result) => {
              if (err) return reject(err);
              resolve(result);
            });
          });

          // Adiciona os itens do pedido
          for (const item of items) {
            await new Promise((resolve, reject) => {
              Order.addOrderItem({
                orderId,
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice
              }, (err) => {
                if (err) return reject(err);
                resolve();
              });
            });
          }

          // Commit da transação
          db.commit((err) => {
            if (err) {
              console.error('Erro ao commitar transação:', err);
              return db.rollback(() => {
                res.status(500).json({ message: 'Erro ao finalizar pedido' });
              });
            }

            res.status(201).json({
              orderId,
              message: 'Pedido criado com sucesso'
            });
          });
        } catch (error) {
          // Rollback em caso de erro
          db.rollback(() => {
            console.error('Erro durante a transação:', error);
            res.status(500).json({ message: 'Erro ao processar pedido' });
          });
        }
      });
    } catch (error) {
      console.error('Erro no OrderController:', error);
      res.status(500).json({ message: 'Erro interno no servidor' });
    }
  },

  async getOrderById(req, res) {
    try {
      const orderId = req.params.id;

      // Busca o pedido principal
      const orderQuery = 'SELECT * FROM orders WHERE id = ?';
      const order = await new Promise((resolve, reject) => {
        db.query(orderQuery, [orderId], (err, results) => {
          if (err) return reject(err);
          resolve(results[0]);
        });
      });

      if (!order) {
        return res.status(404).json({ message: 'Pedido não encontrado' });
      }

      // Busca os itens do pedido
      const itemsQuery = `
        SELECT 
          oi.*, 
          p.name AS product_name,
          p.image_url AS product_image
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `;
      const items = await new Promise((resolve, reject) => {
        db.query(itemsQuery, [orderId], (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });

      res.status(200).json({
        ...order,
        items
      });
    } catch (error) {
      console.error('Erro no OrderController:', error);
      res.status(500).json({ message: 'Erro interno no servidor' });
    }
  },

  async getUserOrders(req, res) {
    try {
      const userId = req.params.userId;

     // Busca os pedidos do usuário com informações resumidas
 /*    
     const query = `
     SELECT 
       o.id,
       o.total_amount,
       o.status,
       o.created_at,
       COUNT(oi.id) AS items_count
     FROM orders o
     LEFT JOIN order_items oi ON o.id = oi.order_id
     WHERE o.user_id = ?
     GROUP BY o.id
     ORDER BY o.created_at DESC
   `;
*/

      const query = `
          SELECT 
          o.id,
          o.total_amount,
          o.status,
          o.created_at,
          p.description as items,
          oi.quantity as quantity,
          oi.unit_price as unit_price
        FROM orders o, order_items oi, products p
        where o.id = oi.order_id and oi.product_id=p.id and o.user_id = ?
        order by o.id
      `;

      db.query(query, [userId], (err, orders) => {
        if (err) {
          console.error('Erro ao buscar pedidos:', err);
          return res.status(500).json({ message: 'Erro ao buscar pedidos' });
        }

        res.status(200).json({ orders });
      });
    } catch (error) {
      console.error('Erro no OrderController:', error);
      res.status(500).json({ message: 'Erro interno no servidor' });
    }
  },

  async updateOrderStatus(req, res) {
    try {
      const orderId = req.params.id;
      const { status } = req.body;

      const validStatuses = ['pending', 'processing', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Status inválido' });
      }

      const query = 'UPDATE orders SET status = ? WHERE id = ?';
      db.query(query, [status, orderId], (err, results) => {
        if (err) {
          console.error('Erro ao atualizar pedido:', err);
          return res.status(500).json({ message: 'Erro ao atualizar pedido' });
        }

        if (results.affectedRows === 0) {
          return res.status(404).json({ message: 'Pedido não encontrado' });
        }

        res.status(200).json({ message: 'Status do pedido atualizado' });
      });
    } catch (error) {
      console.error('Erro no OrderController:', error);
      res.status(500).json({ message: 'Erro interno no servidor' });
    }
  }
};

module.exports = OrderController;