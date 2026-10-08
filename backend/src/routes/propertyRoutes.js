const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { authenticateToken, optionalAuth, requireRoles } = require('../middleware/auth');

// Public listing & search with optional auth (to support consultant/admin viewing draft properties)
router.get('/', optionalAuth, propertyController.getProperties);
router.get('/:idOrSlug', optionalAuth, propertyController.getPropertyByIdOrSlug);

// Admin-only property management
router.post('/', authenticateToken, requireRoles('admin'), propertyController.createProperty);
router.put('/:id', authenticateToken, requireRoles('admin'), propertyController.updateProperty);
router.delete('/:id', authenticateToken, requireRoles('admin'), propertyController.deleteProperty);

module.exports = router;
