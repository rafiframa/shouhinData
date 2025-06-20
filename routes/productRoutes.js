// routes/productRoutes.js - Product routes
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Public route for product listing (requires login)
router.get('/', requireAuth, productController.getAllProducts);

// Public route for product detail (requires login)
router.get('/product/:slug', requireAuth, productController.getProductDetail);

// Quality certification routes
router.get('/product/:slug/certification', requireAuth, productController.getCertification);
router.post('/product/:slug/certification', requireAuth, productController.generateCertification);

// Admin only routes
router.get('/product/:slug/edit', requireAdmin, productController.getEditProduct);
router.post('/api/products', requireAdmin, productController.createProduct);
router.put('/api/products/:id', requireAdmin, productController.updateProduct);
router.delete('/api/products/:id', requireAdmin, productController.deleteProduct);

module.exports = router;