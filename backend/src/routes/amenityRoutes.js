const express = require('express');
const router = express.Router();
const amenityController = require('../controllers/amenityController');
const { authenticateToken, requireRoles } = require('../middleware/auth');

router.get('/', amenityController.getAmenities);

// Admin operations
router.post('/', authenticateToken, requireRoles('admin'), amenityController.createAmenity);
router.put('/:id', authenticateToken, requireRoles('admin'), amenityController.updateAmenity);
router.delete('/:id', authenticateToken, requireRoles('admin'), amenityController.deleteAmenity);

module.exports = router;
