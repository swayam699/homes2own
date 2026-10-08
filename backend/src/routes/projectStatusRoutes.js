const express = require('express');
const router = express.Router();
const projectStatusController = require('../controllers/projectStatusController');
const { authenticateToken, optionalAuth, requireRoles } = require('../middleware/auth');

router.get('/:propertyId', optionalAuth, projectStatusController.getProjectStatusHistory);
router.post(
  '/:propertyId',
  authenticateToken,
  requireRoles('consultant', 'admin'),
  projectStatusController.updateProjectStatus
);

module.exports = router;
