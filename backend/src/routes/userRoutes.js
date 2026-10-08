const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireRoles } = require('../middleware/auth');

router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, userController.updateProfile);

// Admin-only endpoints
router.get('/', authenticateToken, requireRoles('admin'), userController.getAllUsers);
router.put('/:id/role', authenticateToken, requireRoles('admin'), userController.updateUserRole);

module.exports = router;
