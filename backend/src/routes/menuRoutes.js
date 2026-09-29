const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { authenticateToken, requireRoles } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');

// Public
router.get('/', menuController.searchMenuItems);
router.get('/:id', menuController.getMenuItemById);

// Protected (Admin & Restaurant Admin)
router.post(
  '/',
  authenticateToken,
  requireRoles('admin', 'restaurant_admin'),
  validateBody(['restaurant_id', 'name', 'price']),
  menuController.createMenuItem
);

router.put(
  '/:id',
  authenticateToken,
  requireRoles('admin', 'restaurant_admin'),
  menuController.updateMenuItem
);

router.patch(
  '/:id/availability',
  authenticateToken,
  requireRoles('admin', 'restaurant_admin'),
  menuController.toggleAvailability
);

router.delete(
  '/:id',
  authenticateToken,
  requireRoles('admin', 'restaurant_admin'),
  menuController.deleteMenuItem
);

module.exports = router;
