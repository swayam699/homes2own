const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken, requireRoles } = require('../middleware/auth');

router.use(authenticateToken);
router.use(requireRoles('admin', 'consultant'));

router.get('/analytics', reportController.getAnalytics);

module.exports = router;
