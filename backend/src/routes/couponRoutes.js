const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { authenticateToken, requireRoles } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');

// Public
router.get('/', couponController.getActiveCoupons);
router.post('/apply', validateBody(['code', 'subtotal']), couponController.applyCoupon);

// Admin only
router.post('/', authenticateToken, requireRoles('admin'), validateBody(['code', 'discount_value']), couponController.createCoupon);
router.patch('/:id/status', authenticateToken, requireRoles('admin'), couponController.toggleCouponStatus);
router.delete('/:id', authenticateToken, requireRoles('admin'), couponController.deleteCoupon);

module.exports = router;
