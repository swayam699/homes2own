const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireRoles } = require('../middleware/auth');

router.use(authenticateToken);
router.use(requireRoles('admin', 'consultant'));

router.get('/stats', adminController.getAdminStats);

module.exports = router;
