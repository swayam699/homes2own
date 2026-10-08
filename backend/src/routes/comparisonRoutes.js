const express = require('express');
const router = express.Router();
const comparisonController = require('../controllers/comparisonController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, comparisonController.getComparisons);
router.post('/:propertyId', authenticateToken, comparisonController.addComparison);
router.delete('/:propertyId', authenticateToken, comparisonController.removeComparison);
router.delete('/', authenticateToken, comparisonController.clearComparisons);

module.exports = router;
