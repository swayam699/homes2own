const db = require('../config/db');

/**
 * Simulate payment processing
 * POST /api/payments/process
 * Body: { orderId, paymentMethod, amount, cardDetails, upiId, simulateFailure }
 */
const processPayment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      orderId,
      paymentMethod = 'upi',
      amount,
      cardDetails,
      upiId,
      simulateFailure = false,
    } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and amount are required.',
      });
    }

    // Verify order exists and belongs to user
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    if (orders[0].user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this order.',
      });
    }

    if (simulateFailure) {
      const txnId = `FAILED-${Date.now()}`;
      await db.query(
        `INSERT INTO payments (order_id, user_id, payment_method, payment_status, transaction_id, amount, payment_details)
         VALUES (?, ?, ?, 'failed', ?, ?, ?)`,
        [orderId, userId, paymentMethod, txnId, amount, JSON.stringify({ reason: 'Simulated bank decline' })]
      );

      return res.status(402).json({
        success: false,
        message: 'Transaction failed: Insufficient funds or invalid card PIN.',
        transactionId: txnId,
      });
    }

    const txnId = `TXN-${paymentMethod.toUpperCase()}-${Date.now()}`;
    const paymentMeta = {
      method: paymentMethod,
      upiId: upiId || null,
      cardLast4: cardDetails?.number ? cardDetails.number.slice(-4) : '4242',
      processedAt: new Date().toISOString(),
      gateway: 'Demo Gateway (Simulated)',
    };

    // Update existing or insert new payment
    const [existing] = await db.query('SELECT id FROM payments WHERE order_id = ?', [orderId]);
    if (existing.length > 0) {
      await db.query(
        `UPDATE payments SET 
          payment_method = ?, 
          payment_status = 'completed', 
          transaction_id = ?, 
          amount = ?, 
          payment_details = ?
         WHERE id = ?`,
        [paymentMethod, txnId, amount, JSON.stringify(paymentMeta), existing[0].id]
      );
    } else {
      await db.query(
        `INSERT INTO payments (order_id, user_id, payment_method, payment_status, transaction_id, amount, payment_details)
         VALUES (?, ?, ?, 'completed', ?, ?, ?)`,
        [orderId, userId, paymentMethod, txnId, amount, JSON.stringify(paymentMeta)]
      );
    }

    res.json({
      success: true,
      message: 'Payment processed and verified successfully.',
      data: {
        transactionId: txnId,
        paymentStatus: 'completed',
        amount,
        paymentMethod,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payment information by order ID
 * GET /api/payments/order/:orderId
 */
const getPaymentByOrderId = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const [payments] = await db.query('SELECT * FROM payments WHERE order_id = ?', [orderId]);

    if (payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No payment record found for this order.',
      });
    }

    res.json({
      success: true,
      data: payments[0],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  processPayment,
  getPaymentByOrderId,
};
