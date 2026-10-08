const express = require('express');
const router = express.Router();
const developerController = require('../controllers/developerController');
const { authenticateToken, requireRoles } = require('../middleware/auth');

router.get('/', developerController.getDevelopers);
router.get('/:idOrSlug', developerController.getDeveloperByIdOrSlug);

// Admin operations
router.post('/', authenticateToken, requireRoles('admin'), developerController.createDeveloper);
router.put('/:id', authenticateToken, requireRoles('admin'), developerController.updateDeveloper);
router.delete('/:id', authenticateToken, requireRoles('admin'), developerController.deleteDeveloper);

module.exports = router;
