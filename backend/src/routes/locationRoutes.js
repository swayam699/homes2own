const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { authenticateToken, requireRoles } = require('../middleware/auth');

router.get('/', locationController.getLocations);
router.get('/:idOrSlug', locationController.getLocationByIdOrSlug);

// Admin operations
router.post('/', authenticateToken, requireRoles('admin'), locationController.createLocation);
router.put('/:id', authenticateToken, requireRoles('admin'), locationController.updateLocation);
router.delete('/:id', authenticateToken, requireRoles('admin'), locationController.deleteLocation);

module.exports = router;
