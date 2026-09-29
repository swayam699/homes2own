const db = require('../config/db');

const STAGES = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
const STAGE_LABELS = {
  placed: { label: 'Order Placed', desc: 'Your order was received and sent to the kitchen.' },
  confirmed: { label: 'Order Confirmed', desc: 'The restaurant has confirmed your order.' },
  preparing: { label: 'Kitchen Preparing', desc: 'Chef is cooking your fresh dishes.' },
  out_for_delivery: { label: 'Out for Delivery', desc: 'Valet has picked up the package and is on the way.' },
  delivered: { label: 'Delivered', desc: 'Order delivered safely. Enjoy your meal!' },
  cancelled: { label: 'Order Cancelled', desc: 'This order was cancelled.' },
};

/**
 * Place a new order
 * POST /api/orders
 * Body: { deliveryAddress, customerPhone, paymentMethod, couponCode, notes, simulateFailure }
 */
const placeOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      deliveryAddress,
      customerPhone,
      paymentMethod = 'cod',
      couponCode,
      notes,
      simulateFailure = false,
      paymentDetails = {},
    } = req.body;

    if (!deliveryAddress || !customerPhone) {
      return res.status(400).json({
        success: false,
        message: 'Delivery address and customer contact phone are required.',
      });
    }

    // Get user's cart
    const [carts] = await db.query('SELECT * FROM carts WHERE user_id = ?', [userId]);
    if (carts.length === 0 || !carts[0].restaurant_id) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Please add items before checking out.',
      });
    }

    const cart = carts[0];

    // Fetch cart items with details
    const [cartItems] = await db.query(
      `SELECT ci.*, m.name, m.price, m.is_veg, m.is_available, m.restaurant_id
       FROM cart_items ci
       JOIN menu_items m ON ci.menu_item_id = m.id
       WHERE ci.cart_id = ?`,
      [cart.id]
    );

    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Please add items to proceed.',
      });
    }

    // Verify restaurant is active
    const restaurantId = cart.restaurant_id;
    const [restaurants] = await db.query('SELECT * FROM restaurants WHERE id = ?', [restaurantId]);
    if (restaurants.length === 0 || !restaurants[0].is_active) {
      return res.status(400).json({
        success: false,
        message: 'This restaurant is currently closed or unavailable.',
      });
    }

    // Calculate subtotal
    const subtotal = cartItems.reduce((acc, item) => acc + item.quantity * item.price, 0);
    const deliveryFee = subtotal >= 400 ? 0.0 : 40.0;
    const taxAmount = Number((subtotal * 0.05).toFixed(2));

    let discountAmount = 0.0;
    let appliedCoupon = null;

    if (couponCode) {
      const [coupons] = await db.query(
        'SELECT * FROM coupons WHERE UPPER(code) = ? AND is_active = 1',
        [couponCode.trim().toUpperCase()]
      );

      if (coupons.length > 0 && subtotal >= coupons[0].min_order_amount) {
        const c = coupons[0];
        appliedCoupon = c.code;
        if (c.discount_type === 'percentage') {
          discountAmount = (subtotal * c.discount_value) / 100;
          if (c.max_discount && discountAmount > c.max_discount) {
            discountAmount = c.max_discount;
          }
        } else {
          discountAmount = c.discount_value;
        }
        discountAmount = Math.min(discountAmount, subtotal);
        discountAmount = Number(discountAmount.toFixed(2));
      }
    }

    const totalAmount = Number((subtotal + deliveryFee + taxAmount - discountAmount).toFixed(2));

    // Handle payment simulation failure
    if (simulateFailure) {
      return res.status(402).json({
        success: false,
        message: 'Payment simulation declined: Card declined or insufficient UPI balance. Please try another payment method.',
      });
    }

    // Generate Order Number
    const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const estimatedTime = `${restaurants[0].delivery_time_min}-${restaurants[0].delivery_time_max} mins`;

    // Insert Order
    const [orderResult] = await db.query(
      `INSERT INTO orders (
        order_number, user_id, restaurant_id, subtotal, delivery_fee, tax_amount,
        discount_amount, total_amount, coupon_code, status, delivery_address,
        customer_phone, notes, estimated_delivery_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'placed', ?, ?, ?, ?)`,
      [
        orderNumber,
        userId,
        restaurantId,
        subtotal,
        deliveryFee,
        taxAmount,
        discountAmount,
        totalAmount,
        appliedCoupon,
        deliveryAddress.trim(),
        customerPhone.trim(),
        notes || null,
        estimatedTime,
      ]
    );

    const orderId = orderResult.insertId;

    // Insert Order Items
    for (const item of cartItems) {
      const itemTotal = Number((item.quantity * item.price).toFixed(2));
      await db.query(
        `INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, unit_price, total_price, is_veg)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [orderId, item.menu_item_id, item.name, item.quantity, item.price, itemTotal, item.is_veg]
      );
    }

    // Record Payment
    const txnId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const paymentStatus = paymentMethod === 'cod' ? 'pending' : 'completed';

    await db.query(
      `INSERT INTO payments (order_id, user_id, payment_method, payment_status, transaction_id, amount, payment_details)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        userId,
        paymentMethod,
        paymentStatus,
        txnId,
        totalAmount,
        JSON.stringify({ ...paymentDetails, simulatedAt: new Date().toISOString() }),
      ]
    );

    // Record initial tracking event
    await db.query(
      `INSERT INTO order_tracking (order_id, status, status_label, description, updated_by_user_id)
       VALUES (?, 'placed', 'Order Placed', 'Order placed successfully and received by restaurant.', ?)`,
      [orderId, userId]
    );

    // Clear cart
    await db.query('DELETE FROM cart_items WHERE cart_id = ?', [cart.id]);
    await db.query('UPDATE carts SET restaurant_id = NULL WHERE id = ?', [cart.id]);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: {
        orderId,
        orderNumber,
        totalAmount,
        status: 'placed',
        estimatedDeliveryTime: estimatedTime,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get orders for current user (Order History)
 * GET /api/orders
 */
const getUserOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [orders] = await db.query(
      `SELECT o.*, r.name as restaurant_name, r.image_url as restaurant_image, r.address as restaurant_address
       FROM orders o
       JOIN restaurants r ON o.restaurant_id = r.id
       WHERE o.user_id = ?
       ORDER BY o.id DESC`,
      [userId]
    );

    // Attach items to each order
    const orderIds = orders.map((o) => o.id);
    let itemsByOrder = {};

    if (orderIds.length > 0) {
      const [items] = await db.query(
        `SELECT * FROM order_items WHERE order_id IN (${orderIds.map(() => '?').join(',')})`,
        orderIds
      );

      items.forEach((item) => {
        if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
        itemsByOrder[item.order_id].push(item);
      });
    }

    const enhancedOrders = orders.map((o) => ({
      ...o,
      items: itemsByOrder[o.id] || [],
    }));

    res.json({
      success: true,
      count: enhancedOrders.length,
      data: enhancedOrders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get detailed order information including tracking history
 * GET /api/orders/:id
 */
const getOrderDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    let queryStr = `
      SELECT o.*, r.name as restaurant_name, r.slug as restaurant_slug,
             r.phone as restaurant_phone, r.address as restaurant_address,
             r.image_url as restaurant_image,
             u.name as customer_name, u.email as customer_email
      FROM orders o
      JOIN restaurants r ON o.restaurant_id = r.id
      JOIN users u ON o.user_id = u.id
      WHERE (o.id = ? OR o.order_number = ?)
    `;
    const params = [id, id];

    // Customers can only see their own orders; admins can see any
    if (role === 'customer') {
      queryStr += ' AND o.user_id = ?';
      params.push(userId);
    }

    const [orders] = await db.query(queryStr, params);

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    const order = orders[0];

    // Fetch items
    const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);

    // Fetch tracking logs
    const [tracking] = await db.query(
      'SELECT * FROM order_tracking WHERE order_id = ? ORDER BY id ASC',
      [order.id]
    );

    // Fetch payment record
    const [payments] = await db.query(
      'SELECT id, payment_method, payment_status, transaction_id, amount, created_at FROM payments WHERE order_id = ?',
      [order.id]
    );

    res.json({
      success: true,
      data: {
        ...order,
        items,
        tracking,
        payment: payments[0] || null,
        stages: STAGES,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update order status (Admin / Restaurant Admin)
 * PATCH /api/orders/:id/status
 * Body: { status, description }
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, description } = req.body;
    const userId = req.user.id;

    const validStatuses = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: [${validStatuses.join(', ')}]`,
      });
    }

    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    const order = orders[0];

    // Update order status
    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

    // If delivered, mark payment completed if COD
    if (status === 'delivered') {
      await db.query(
        "UPDATE payments SET payment_status = 'completed' WHERE order_id = ? AND payment_status = 'pending'",
        [id]
      );
    }

    // Insert tracking event
    const stageInfo = STAGE_LABELS[status] || { label: status, desc: description || 'Order status updated.' };
    await db.query(
      `INSERT INTO order_tracking (order_id, status, status_label, description, updated_by_user_id)
       VALUES (?, ?, ?, ?, ?)`,
      [id, status, stageInfo.label, description || stageInfo.desc, userId]
    );

    // Return refreshed order details
    req.params.id = id;
    return getOrderDetails(req, res, next);
  } catch (error) {
    next(error);
  }
};

/**
 * Advance order to next stage (Helper for live demonstration)
 * POST /api/orders/:id/advance-stage
 */
const advanceOrderStage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const currentStatus = orders[0].status;
    const currentIndex = STAGES.indexOf(currentStatus);

    if (currentIndex === -1 || currentIndex >= STAGES.length - 1) {
      return res.status(400).json({
        success: false,
        message: `Order is already at '${currentStatus}' (cannot advance further).`,
      });
    }

    const nextStatus = STAGES[currentIndex + 1];
    req.body = { status: nextStatus };
    return updateOrderStatus(req, res, next);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  placeOrder,
  getUserOrders,
  getOrderDetails,
  updateOrderStatus,
  advanceOrderStage,
};
