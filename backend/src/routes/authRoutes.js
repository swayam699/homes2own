const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateBody } = require('../middleware/validate');

router.post('/register', validateBody(['name', 'email', 'password']), authController.register);
router.post('/login', validateBody(['email', 'password']), authController.login);

module.exports = router;
