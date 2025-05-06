const express = require('express');
const ProductController = require('../controllers/ProductController');
const authMiddleware = require('../middleware/auth');
//const adminMiddleware = require('../middleware/admin'); // Implemente se necessário

const router = express.Router();

router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProductById);

// Rotas protegidas (apenas para administradores)
router.post('/', authMiddleware,  ProductController.createProduct);
//router.post('/', authMiddleware, adminMiddleware, ProductController.createProduct);

//router.put('/:id', authMiddleware, adminMiddleware, ProductController.updateProduct);
router.put('/:id', authMiddleware,  ProductController.updateProduct);


module.exports = router;