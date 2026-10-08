const { query } = require('../config/db');
const { validateEmail } = require('../middleware/validate');

/**
 * Submit an enquiry (Guest or Authenticated Customer)
 */
const submitEnquiry = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      preferred_contact_method = 'phone',
      property_id,
      message,
    } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, mobile number, and message are required.',
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    const userId = req.user ? req.user.id : null;
    const propId = property_id ? parseInt(property_id, 10) : null;

    // Default consultant assignment (e.g. Kabir Varma ID 2 if exists)
    const [consultants] = await query(
      "SELECT id FROM users WHERE role = 'consultant' AND is_active = 1 LIMIT 1"
    );
    const assignedConsultantId = consultants && consultants.length > 0 ? consultants[0].id : null;

    const [result] = await query(
      `INSERT INTO enquiries (user_id, property_id, name, email, phone, preferred_contact_method, message, status, assigned_consultant_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'new', ?)`,
      [
        userId,
        propId,
        name.trim(),
        email.toLowerCase().trim(),
        phone.trim(),
        preferred_contact_method,
        message.trim(),
        assignedConsultantId,
      ]
    );

    const enquiryId = result.insertId;

    // Also bridge to CRM Leads pipeline for consultants
    await query(
      `INSERT INTO leads (customer_id, name, email, phone, property_id, source, status, assigned_consultant_id)
       VALUES (?, ?, ?, ?, ?, 'enquiry', 'New', ?)`,
      [
        userId,
        name.trim(),
        email.toLowerCase().trim(),
        phone.trim(),
        propId,
        assignedConsultantId,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Thank you for your enquiry. A HOMES2OWN consultant will contact you shortly.',
      enquiryId,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get enquiries (Consultant and Admin see all/assigned; Customers see their own)
 */
const getEnquiries = async (req, res, next) => {
  try {
    const user = req.user;
    const { status, property_id, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    let whereSql = 'WHERE 1=1';
    const params = [];

    if (user.role === 'customer') {
      whereSql += ' AND e.user_id = ?';
      params.push(user.id);
    } else if (user.role === 'consultant') {
      // Consultant sees either their assigned enquiries or unassigned
      whereSql += ' AND (e.assigned_consultant_id = ? OR e.assigned_consultant_id IS NULL)';
      params.push(user.id);
    }

    if (status) {
      whereSql += ' AND e.status = ?';
      params.push(status);
    }

    if (property_id) {
      whereSql += ' AND e.property_id = ?';
      params.push(parseInt(property_id, 10));
    }

    const [countRows] = await query(`SELECT COUNT(*) as total FROM enquiries e ${whereSql}`, params);
    const total = countRows[0]?.total || 0;

    const [rows] = await query(
      `SELECT 
        e.*,
        p.title as property_title, p.slug as property_slug, p.price as property_price,
        u.name as consultant_name
       FROM enquiries e
       LEFT JOIN properties p ON e.property_id = p.id
       LEFT JOIN users u ON e.assigned_consultant_id = u.id
       ${whereSql}
       ORDER BY e.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit, 10), offset]
    );

    res.json({
      success: true,
      enquiries: rows,
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
 * Customer gets their own enquiries history
 */
const getMyEnquiries = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [rows] = await query(
      `SELECT 
        e.*,
        p.title as property_title, p.slug as property_slug, p.price as property_price,
        (SELECT image_url FROM property_images pi WHERE pi.property_id = p.id ORDER BY is_primary DESC, display_order ASC LIMIT 1) as property_image
       FROM enquiries e
       LEFT JOIN properties p ON e.property_id = p.id
       WHERE e.user_id = ?
       ORDER BY e.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      enquiries: rows,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update enquiry status or assignment (Consultant & Admin)
 */
const updateEnquiry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, assigned_consultant_id } = req.body;

    const [existing] = await query('SELECT id FROM enquiries WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Enquiry not found.' });
    }

    await query(
      `UPDATE enquiries
       SET status = COALESCE(?, status),
           assigned_consultant_id = COALESCE(?, assigned_consultant_id),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status || null, assigned_consultant_id !== undefined ? assigned_consultant_id : null, id]
    );

    res.json({
      success: true,
      message: 'Enquiry updated successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  submitEnquiry,
  getEnquiries,
  getMyEnquiries,
  updateEnquiry,
};
