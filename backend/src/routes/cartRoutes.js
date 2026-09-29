const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticateToken } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');

// All cart actions require authentication
router.use(authenticateToken);

router.get('/', cartController.getCart);
router.post('/items', validateBody(['menuItemId']), cartController.addToCart);
router.put('/items/:id', validateBody(['quantity']), cartController.updateCartItemQuantity);
router.delete('/items/:id', cartController.removeCartItem);
router.delete('/', cartController.clearCart);

module.exports = router;
