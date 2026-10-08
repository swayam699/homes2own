const { query } = require('../config/db');

/**
 * Request a consultant callback
 */
const requestCallback = async (req, res, next) => {
  try {
    const { name, phone, property_id, preferred_time, message } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone number are required.',
      });
    }

    const userId = req.user ? req.user.id : null;
    const propId = property_id ? parseInt(property_id, 10) : null;

    // Default consultant assignment
    const [consultants] = await query(
      "SELECT id FROM users WHERE role = 'consultant' AND is_active = 1 LIMIT 1"
    );
    const consultantId = consultants && consultants.length > 0 ? consultants[0].id : null;

    const [result] = await query(
      `INSERT INTO callbacks (user_id, property_id, name, phone, preferred_time, message, status, consultant_id)
       VALUES (?, ?, ?, ?, ?, ?, 'Pending', ?)`,
      [
        userId,
        propId,
        name.trim(),
        phone.trim(),
        preferred_time ? preferred_time.trim() : null,
        message ? message.trim() : null,
        consultantId,
      ]
    );

    const callbackId = result.insertId;

    // Bridge to CRM leads
    await query(
      `INSERT INTO leads (customer_id, name, phone, property_id, source, status, assigned_consultant_id)
       VALUES (?, ?, ?, ?, 'callback', 'New', ?)`,
      [userId, name.trim(), phone.trim(), propId, consultantId]
    );

    res.status(201).json({
      success: true,
      message: 'Callback request received. A property consultant will call you at your preferred time.',
      callbackId,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get callbacks (Consultants & Admins)
 */
const getCallbacks = async (req, res, next) => {
  try {
    const user = req.user;
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    let whereSql = 'WHERE 1=1';
    const params = [];

    if (user.role === 'customer') {
      whereSql += ' AND cb.user_id = ?';
      params.push(user.id);
    } else if (user.role === 'consultant') {
      whereSql += ' AND (cb.consultant_id = ? OR cb.consultant_id IS NULL)';
      params.push(user.id);
    }

    if (status) {
      whereSql += ' AND cb.status = ?';
      params.push(status);
    }

    const [countRows] = await query(`SELECT COUNT(*) as total FROM callbacks cb ${whereSql}`, params);
    const total = countRows[0]?.total || 0;

    const [rows] = await query(
      `SELECT 
        cb.*,
        p.title as property_title, p.slug as property_slug,
        u.name as consultant_name
       FROM callbacks cb
       LEFT JOIN properties p ON cb.property_id = p.id
       LEFT JOIN users u ON cb.consultant_id = u.id
       ${whereSql}
       ORDER BY cb.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit, 10), offset]
    );

    res.json({
      success: true,
      callbacks: rows,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / parseInt(limit, 10)),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Customer view of their callback requests
 */
const getMyCallbacks = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [rows] = await query(
      `SELECT 
        cb.*,
        p.title as property_title, p.slug as property_slug
       FROM callbacks cb
       LEFT JOIN properties p ON cb.property_id = p.id
       WHERE cb.user_id = ?
       ORDER BY cb.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      callbacks: rows,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update callback status (Consultant & Admin)
 */
const updateCallback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes, consultant_id } = req.body;

    const [existing] = await query('SELECT id FROM callbacks WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Callback request not found.' });
    }

    await query(
      `UPDATE callbacks
       SET status = COALESCE(?, status),
           notes = COALESCE(?, notes),
           consultant_id = COALESCE(?, consultant_id),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status || null, notes || null, consultant_id !== undefined ? consultant_id : null, id]
    );

    res.json({
      success: true,
      message: 'Callback request updated successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  requestCallback,
  getCallbacks,
  getMyCallbacks,
  updateCallback,
};
