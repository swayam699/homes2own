const express = require('express');
const router = express.Router();
const callbackController = require('../controllers/callbackController');
const { authenticateToken, optionalAuth, requireRoles } = require('../middleware/auth');

// Public or logged-in callback request
router.post('/', optionalAuth, callbackController.requestCallback);

// Customer viewing their own callbacks
router.get('/my', authenticateToken, callbackController.getMyCallbacks);

// Consultant & Admin management
router.get('/', authenticateToken, requireRoles('consultant', 'admin'), callbackController.getCallbacks);
router.put('/:id', authenticateToken, requireRoles('consultant', 'admin'), callbackController.updateCallback);

module.exports = router;
