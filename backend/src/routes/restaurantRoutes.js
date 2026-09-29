const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const { authenticateToken, requireRoles } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');

// Public
router.get('/', restaurantController.getAllRestaurants);
router.get('/:idOrSlug', restaurantController.getRestaurantDetails);

// Protected (Admin & Restaurant Admin)
router.post(
  '/',
  authenticateToken,
  requireRoles('admin', 'restaurant_admin'),
  validateBody(['name', 'address', 'cuisine_types']),
  restaurantController.createRestaurant
);

router.put(
  '/:id',
  authenticateToken,
  requireRoles('admin', 'restaurant_admin'),
  restaurantController.updateRestaurant
);

router.delete(
  '/:id',
  authenticateToken,
  requireRoles('admin'),
  restaurantController.deleteRestaurant
);

module.exports = router;
