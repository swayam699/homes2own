const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, requireRoles } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');

router.use(authenticateToken);

router.post('/', validateBody(['deliveryAddress', 'customerPhone']), orderController.placeOrder);
router.get('/', orderController.getUserOrders);
router.get('/:id', orderController.getOrderDetails);

// Status updates (Admin / Restaurant Admin)
router.patch('/:id/status', requireRoles('admin', 'restaurant_admin'), orderController.updateOrderStatus);

// Demo convenience endpoint to advance order stage
router.post('/:id/advance-stage', orderController.advanceOrderStage);

module.exports = router;
