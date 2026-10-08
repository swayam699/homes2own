const express = require('express');
const router = express.Router();
const enquiryController = require('../controllers/enquiryController');
const { authenticateToken, optionalAuth, requireRoles } = require('../middleware/auth');

// Public or logged-in enquiry submission
router.post('/', optionalAuth, enquiryController.submitEnquiry);

// Customer viewing their own enquiries
router.get('/my', authenticateToken, enquiryController.getMyEnquiries);

// Consultant & Admin triage
router.get('/', authenticateToken, requireRoles('consultant', 'admin'), enquiryController.getEnquiries);
router.put('/:id', authenticateToken, requireRoles('consultant', 'admin'), enquiryController.updateEnquiry);

module.exports = router;
