const express = require('express');
const router = express.Router();
const followUpController = require('../controllers/followUpController');
const { authenticateToken, requireRoles } = require('../middleware/auth');

router.use(authenticateToken);
router.use(requireRoles('consultant', 'admin'));

router.get('/', followUpController.getFollowUps);
router.post('/', followUpController.createFollowUp);
router.put('/:id', followUpController.updateFollowUp);

module.exports = router;
