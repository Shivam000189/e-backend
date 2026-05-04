const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const sellerMiddleware = require('../middleware/sellerMiddleware');
const productController = require('../controllers/product.controller');
const categoryController = require('../controllers/category.controller');
const cartController = require('../controllers/cart.controller');
const orderController = require('../controllers/order.controller');
const reviewController = require('../controllers/review.controller');
const validate = require('../middleware/validate');
const { productValidator, updateProductValidator, stockValidator } = require('../validators/product.validator');
const router = express.Router();



router.get('/admin/products/search', authMiddleware, adminMiddleware, productController.searchProduct);
router.put('/admin/orders/:id/status', authMiddleware, adminMiddleware, orderController.updateOrderStatus);
router.put('/admin/orders/:id/payment', authMiddleware, adminMiddleware, orderController.updatePaymentStatus);
router.post('/admin/categories', authMiddleware, adminMiddleware, categoryController.createCategory);
router.delete('/admin/categories/:id', authMiddleware, adminMiddleware, categoryController.deleteCategory);
router.get('/orders/orders', authMiddleware, adminMiddleware, orderController.getAllOrders);

router.post('/products/create', authMiddleware, sellerMiddleware, productValidator, validate, productController.create);
router.put('/products/:id', authMiddleware, sellerMiddleware, updateProductValidator, validate, productController.updateProduct);
router.delete('/products/:id', authMiddleware, sellerMiddleware, productController.deleteProduct);

router.get('/seller/products', authMiddleware, sellerMiddleware, productController.getSellerProducts);
router.get('/seller/orders', authMiddleware, sellerMiddleware, orderController.getSellerOrders);
router.get('/seller/inventory/summary', authMiddleware, sellerMiddleware, productController.getInventorySummary);
router.get('/seller/inventory/low-stock', authMiddleware, sellerMiddleware, productController.getLowStockProducts);
router.patch('/seller/products/:id/stock', authMiddleware, sellerMiddleware, stockValidator, validate, productController.updateStock);

router.get('/products', productController.getallproducts);
router.get('/products/search', productController.searchProduct);
router.get('/product/:id', productController.getproduct);
router.get('/products/:productId/recommendations', productController.getProductRecommendations);
router.get('/recommendations', authMiddleware, productController.getPersonalizedRecommendations);


router.get('/categories', categoryController.getallCategory);



router.post('/cart', authMiddleware, cartController.addToCart);
router.get('/cart', authMiddleware, cartController.getCart);
router.put('/cart', authMiddleware, cartController.updateCartItem);
router.delete('/cart/:productId', authMiddleware, cartController.removeCart);


router.post('/orders', authMiddleware, orderController.createOrder);


router.get('/orders/my', authMiddleware, orderController.getMyOrder);
router.get('/orders/:id', authMiddleware, orderController.getOrderById);
router.put('/orders/:id/cancel', authMiddleware, orderController.cancelOrder);


router.post('/products/:productId/reviews', authMiddleware, reviewController.addReview);
router.get('/products/:productId/reviews', reviewController.getProductReviews);

module.exports = router;
