const Product = require('../models/Product');
const db = require('../config/db');

const ProductController = {
  async getAllProducts(req, res) {
    try {
      // Busca todos os produtos e categorias em uma única query
      const query = `
        SELECT 
          p.*, 
          c.name AS category_name,
          c.description AS category_description
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_available = TRUE
        ORDER BY c.name, p.name
      `;

      db.query(query, (err, products) => {
        if (err) {
          console.error('Erro ao buscar produtos:', err);
          return res.status(500).json({ message: 'Erro ao buscar produtos' });
        }

        // Organiza por categoria para a resposta
        const categories = {};
        products.forEach(product => {
          const categoryId = product.category_id;
          if (!categories[categoryId]) {
            categories[categoryId] = {
              id: categoryId,
              name: product.category_name,
              description: product.category_description,
              products: []
            };
          }

          // Remove as propriedades de categoria do produto
          const { category_name, category_description, ...productData } = product;
          categories[categoryId].products.push(productData);
        });

        res.status(200).json({
          categories: Object.values(categories),
          products // Também retorna todos os produtos planos para facilitar
        });
      });
    } catch (error) {
      console.error('Erro no ProductController:', error);
      res.status(500).json({ message: 'Erro interno no servidor' });
    }
  },

  async getProductById(req, res) {
    try {
      const productId = req.params.id;

      const query = `
        SELECT 
          p.*, 
          c.name AS category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = ? AND p.is_available = TRUE
      `;

      db.query(query, [productId], (err, results) => {
        if (err) {
          console.error('Erro ao buscar produto:', err);
          return res.status(500).json({ message: 'Erro ao buscar produto' });
        }

        if (results.length === 0) {
          return res.status(404).json({ message: 'Produto não encontrado' });
        }

        const product = results[0];
        res.status(200).json(product);
      });
    } catch (error) {
      console.error('Erro no ProductController:', error);
      res.status(500).json({ message: 'Erro interno no servidor' });
    }
  },

  async createProduct(req, res) {
    try {
      const { name, description, price, category_id, image_url } = req.body;

      // Validação básica
      if (!name || !price || !category_id) {
        return res.status(400).json({ message: 'Nome, preço e categoria são obrigatórios' });
      }

      const query = `
        INSERT INTO products 
        (name, description, price, category_id, image_url)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.query(query, [name, description, price, category_id, image_url], (err, results) => {
        if (err) {
          console.error('Erro ao criar produto:', err);
          return res.status(500).json({ message: 'Erro ao criar produto' });
        }

        res.status(201).json({
          id: results.insertId,
          message: 'Produto criado com sucesso'
        });
      });
    } catch (error) {
      console.error('Erro no ProductController:', error);
      res.status(500).json({ message: 'Erro interno no servidor' });
    }
  },

  async updateProduct(req, res) {
    try {
      const productId = req.params.id;
      const { name, description, price, category_id, image_url, is_available } = req.body;

      const query = `
        UPDATE products 
        SET 
          name = ?, 
          description = ?, 
          price = ?, 
          category_id = ?, 
          image_url = ?, 
          is_available = ?
        WHERE id = ?
      `;

      db.query(
        query,
        [name, description, price, category_id, image_url, is_available, productId],
        (err, results) => {
          if (err) {
            console.error('Erro ao atualizar produto:', err);
            return res.status(500).json({ message: 'Erro ao atualizar produto' });
          }

          if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Produto não encontrado' });
          }

          res.status(200).json({ message: 'Produto atualizado com sucesso' });
        }
      );
    } catch (error) {
      console.error('Erro no ProductController:', error);
      res.status(500).json({ message: 'Erro interno no servidor' });
    }
  }
};

module.exports = ProductController;