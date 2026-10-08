const { query } = require('../config/db');
const { validateEmail } = require('../middleware/validate');

/**
 * Schedule a site visit request
 */
const requestSiteVisit = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      property_id,
      preferred_date,
      preferred_time,
      visitor_count = 1,
      notes,
    } = req.body;

    if (!name || !email || !phone || !property_id || !preferred_date || !preferred_time) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone, property, preferred date, and preferred time are required.',
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    // Validate that preferred_date is not in the past
    const selectedDate = new Date(preferred_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(selectedDate.getTime()) || selectedDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Site visit date must be today or a future date.',
      });
    }

    const userId = req.user ? req.user.id : null;

    // Default consultant assignment
    const [consultants] = await query(
      "SELECT id FROM users WHERE role = 'consultant' AND is_active = 1 LIMIT 1"
    );
    const consultantId = consultants && consultants.length > 0 ? consultants[0].id : null;

    const [result] = await query(
      `INSERT INTO site_visits (user_id, property_id, name, email, phone, preferred_date, preferred_time, visitor_count, notes, status, consultant_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Requested', ?)`,
      [
        userId,
        parseInt(property_id, 10),
        name.trim(),
        email.toLowerCase().trim(),
        phone.trim(),
        preferred_date,
        preferred_time.trim(),
        parseInt(visitor_count, 10) || 1,
        notes ? notes.trim() : null,
        consultantId,
      ]
    );

    const visitId = result.insertId;

    // Bridge to CRM leads
    await query(
      `INSERT INTO leads (customer_id, name, email, phone, property_id, source, status, assigned_consultant_id)
       VALUES (?, ?, ?, ?, ?, 'site_visit', 'Site Visit Scheduled', ?)`,
      [userId, name.trim(), email.toLowerCase().trim(), phone.trim(), parseInt(property_id, 10), consultantId]
    );

    res.status(201).json({
      success: true,
      message: 'Site visit request submitted successfully. A consultant will confirm your slot.',
      siteVisitId: visitId,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all site visits (Consultants / Admins)
 */
const getSiteVisits = async (req, res, next) => {
  try {
    const user = req.user;
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    let whereSql = 'WHERE 1=1';
    const params = [];

    if (user.role === 'customer') {
      whereSql += ' AND sv.user_id = ?';
      params.push(user.id);
    } else if (user.role === 'consultant') {
      whereSql += ' AND (sv.consultant_id = ? OR sv.consultant_id IS NULL)';
      params.push(user.id);
    }

    if (status) {
      whereSql += ' AND sv.status = ?';
      params.push(status);
    }

    const [countRows] = await query(`SELECT COUNT(*) as total FROM site_visits sv ${whereSql}`, params);
    const total = countRows[0]?.total || 0;

    const [rows] = await query(
      `SELECT 
        sv.*,
        p.title as property_title, p.slug as property_slug, p.address as property_address,
        u.name as consultant_name
       FROM site_visits sv
       LEFT JOIN properties p ON sv.property_id = p.id
       LEFT JOIN users u ON sv.consultant_id = u.id
       ${whereSql}
       ORDER BY sv.preferred_date DESC, sv.id DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit, 10), offset]
    );

    res.json({
      success: true,
      site_visits: rows,
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
 * Customer view of their own site visits
 */
const getMySiteVisits = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [rows] = await query(
      `SELECT 
        sv.*,
        p.title as property_title, p.slug as property_slug, p.address as property_address,
        (SELECT image_url FROM property_images pi WHERE pi.property_id = p.id ORDER BY is_primary DESC, display_order ASC LIMIT 1) as property_image
       FROM site_visits sv
       LEFT JOIN properties p ON sv.property_id = p.id
       WHERE sv.user_id = ?
       ORDER BY sv.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      site_visits: rows,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update site visit status and consultant notes (Consultant & Admin)
 */
const updateSiteVisit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, consultant_notes, consultant_id, preferred_date, preferred_time } = req.body;

    const [existing] = await query('SELECT id FROM site_visits WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Site visit request not found.' });
    }

    await query(
      `UPDATE site_visits
       SET status = COALESCE(?, status),
           consultant_notes = COALESCE(?, consultant_notes),
           consultant_id = COALESCE(?, consultant_id),
           preferred_date = COALESCE(?, preferred_date),
           preferred_time = COALESCE(?, preferred_time),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        status || null,
        consultant_notes || null,
        consultant_id !== undefined ? consultant_id : null,
        preferred_date || null,
        preferred_time || null,
        id,
      ]
    );

    res.json({
      success: true,
      message: 'Site visit status updated successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  requestSiteVisit,
  getSiteVisits,
  getMySiteVisits,
  updateSiteVisit,
};
