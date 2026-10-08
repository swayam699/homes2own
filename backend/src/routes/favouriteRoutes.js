const express = require('express');
const router = express.Router();
const favouriteController = require('../controllers/favouriteController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, favouriteController.getFavourites);
router.get('/check/:propertyId', authenticateToken, favouriteController.checkFavourite);
router.post('/:propertyId', authenticateToken, favouriteController.addFavourite);
router.delete('/:propertyId', authenticateToken, favouriteController.removeFavourite);

module.exports = router;
