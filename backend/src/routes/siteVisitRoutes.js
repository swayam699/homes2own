const express = require('express');
const router = express.Router();
const siteVisitController = require('../controllers/siteVisitController');
const { authenticateToken, optionalAuth, requireRoles } = require('../middleware/auth');

// Public or logged-in site visit request
router.post('/', optionalAuth, siteVisitController.requestSiteVisit);

// Customer viewing their own site visits
router.get('/my', authenticateToken, siteVisitController.getMySiteVisits);

// Consultant & Admin management
router.get('/', authenticateToken, requireRoles('consultant', 'admin'), siteVisitController.getSiteVisits);
router.put('/:id', authenticateToken, requireRoles('consultant', 'admin'), siteVisitController.updateSiteVisit);

module.exports = router;
