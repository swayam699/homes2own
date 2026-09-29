const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');

router.use(authenticateToken);

router.post('/process', validateBody(['orderId', 'amount']), paymentController.processPayment);
router.get('/order/:orderId', paymentController.getPaymentByOrderId);

module.exports = router;
