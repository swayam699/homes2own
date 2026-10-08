const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const { authenticateToken, requireRoles } = require('../middleware/auth');

router.use(authenticateToken);
router.use(requireRoles('consultant', 'admin'));

router.get('/', leadController.getLeads);
router.post('/', leadController.createLead);
router.get('/:id', leadController.getLeadById);
router.put('/:id', leadController.updateLead);
router.post('/:id/notes', leadController.addLeadNote);

module.exports = router;
