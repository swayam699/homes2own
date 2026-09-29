const db = require('../config/db');

/**
 * Get all active public coupons
 * GET /api/coupons
 */
const getActiveCoupons = async (req, res, next) => {
  try {
    const [coupons] = await db.query(
      'SELECT id, code, description, discount_type, discount_value, min_order_amount, max_discount FROM coupons WHERE is_active = 1'
    );

    res.json({
      success: true,
      data: coupons,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Validate and compute discount for a coupon code
 * POST /api/coupons/apply
 * Body: { code, subtotal }
 */
const applyCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required.',
      });
    }

    const orderSubtotal = parseFloat(subtotal) || 0;

    const [coupons] = await db.query(
      'SELECT * FROM coupons WHERE UPPER(code) = ? AND is_active = 1',
      [code.trim().toUpperCase()]
    );

    if (coupons.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired coupon code.',
      });
    }

    const coupon = coupons[0];

    // Check minimum order amount
    if (orderSubtotal < coupon.min_order_amount) {
      return res.status(400).json({
        success: false,
        message: `This coupon requires a minimum subtotal of ₹${coupon.min_order_amount}. Add ₹${(coupon.min_order_amount - orderSubtotal).toFixed(2)} more to apply.`,
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (orderSubtotal * coupon.discount_value) / 100;
      if (coupon.max_discount && discount > coupon.max_discount) {
        discount = coupon.max_discount;
      }
    } else {
      // Fixed discount
      discount = coupon.discount_value;
    }

    // Discount cannot exceed subtotal
    discount = Math.min(discount, orderSubtotal);
    discount = Number(discount.toFixed(2));

    res.json({
      success: true,
      message: `Coupon "${coupon.code}" applied! You saved ₹${discount}.`,
      data: {
        code: coupon.code,
        discount,
        description: coupon.description,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Create coupon
 * POST /api/coupons
 */
const createCoupon = async (req, res, next) => {
  try {
    const {
      code,
      description,
      discount_type = 'percentage',
      discount_value,
      min_order_amount = 0,
      max_discount = 500,
    } = req.body;

    if (!code || discount_value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code and discount value are required.',
      });
    }

    const [existing] = await db.query('SELECT id FROM coupons WHERE code = ?', [code.toUpperCase().trim()]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A coupon with this code already exists.',
      });
    }

    const [result] = await db.query(
      `INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [
        code.toUpperCase().trim(),
        description || null,
        discount_type,
        parseFloat(discount_value),
        parseFloat(min_order_amount),
        parseFloat(max_discount),
      ]
    );

    const [newCoupon] = await db.query('SELECT * FROM coupons WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully.',
      data: newCoupon[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Toggle coupon active status
 * PATCH /api/coupons/:id/status
 */
const toggleCouponStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT id, is_active, code FROM coupons WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found.',
      });
    }

    const nextStatus = existing[0].is_active ? 0 : 1;
    await db.query('UPDATE coupons SET is_active = ? WHERE id = ?', [nextStatus, id]);

    res.json({
      success: true,
      message: `Coupon "${existing[0].code}" is now ${nextStatus ? 'active' : 'inactive'}.`,
      is_active: nextStatus,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Delete coupon
 * DELETE /api/coupons/:id
 */
const deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT code FROM coupons WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found.',
      });
    }

    await db.query('DELETE FROM coupons WHERE id = ?', [id]);

    res.json({
      success: true,
      message: `Coupon "${existing[0].code}" deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActiveCoupons,
  applyCoupon,
  createCoupon,
  toggleCouponStatus,
  deleteCoupon,
};
