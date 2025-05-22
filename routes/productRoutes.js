// routes/productRoutes.js - Product routes
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Route for product listing
router.get('/', productController.getAllProducts);

// Route for product detail
router.get('/product/:slug', productController.getProductDetail);

// Route for editing product
router.get('/product/:slug/edit', productController.getEditProduct);

// API route for adding a new product
router.post('/api/products', productController.createProduct);

// API route for updating a product
router.put('/api/products/:productCode', productController.updateProduct);

// API route for deleting a product
router.delete('/api/products/:productCode', productController.deleteProduct);

module.exports = router;