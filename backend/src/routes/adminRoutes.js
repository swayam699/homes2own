const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireRoles } = require('../middleware/auth');

// All admin routes require admin or restaurant_admin role
router.use(authenticateToken, requireRoles('admin', 'restaurant_admin'));

router.get('/stats', adminController.getAdminStats);
router.get('/orders', adminController.getAllOrders);
router.get('/customers', adminController.getAllCustomers);
router.patch('/users/:id/status', requireRoles('admin'), adminController.toggleUserStatus);

module.exports = router;
