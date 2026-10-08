const { query } = require('../config/db');

/**
 * Get leads with filtering, search, pagination
 */
const getLeads = async (req, res, next) => {
  try {
    const user = req.user;
    const { status, consultant_id, search, source, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    let whereSql = 'WHERE 1=1';
    const params = [];

    // Role scoping: consultants see assigned or all CRM leads if permitted
    if (user.role === 'consultant') {
      if (consultant_id) {
        whereSql += ' AND l.assigned_consultant_id = ?';
        params.push(parseInt(consultant_id, 10));
      }
    } else if (consultant_id) {
      whereSql += ' AND l.assigned_consultant_id = ?';
      params.push(parseInt(consultant_id, 10));
    }

    if (status) {
      whereSql += ' AND l.status = ?';
      params.push(status);
    }

    if (source) {
      whereSql += ' AND l.source = ?';
      params.push(source);
    }

    if (search) {
      whereSql += ' AND (l.name LIKE ? OR l.email LIKE ? OR l.phone LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    const [countRows] = await query(`SELECT COUNT(*) as total FROM leads l ${whereSql}`, params);
    const total = countRows[0]?.total || 0;

    const [rows] = await query(
      `SELECT 
        l.*,
        p.title as property_title, p.slug as property_slug, p.price as property_price,
        u.name as consultant_name
       FROM leads l
       LEFT JOIN properties p ON l.property_id = p.id
       LEFT JOIN users u ON l.assigned_consultant_id = u.id
       ${whereSql}
       ORDER BY l.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit, 10), offset]
    );

    res.json({
      success: true,
      leads: rows,
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
 * Get single lead details with timeline notes and follow-ups
 */
const getLeadById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [leadRows] = await query(
      `SELECT 
        l.*,
        p.title as property_title, p.slug as property_slug, p.price as property_price, p.configuration as property_config,
        u.name as consultant_name, u.email as consultant_email
       FROM leads l
       LEFT JOIN properties p ON l.property_id = p.id
       LEFT JOIN users u ON l.assigned_consultant_id = u.id
       WHERE l.id = ?`,
      [id]
    );

    if (!leadRows || leadRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Lead not found.' });
    }

    const lead = leadRows[0];

    // Fetch notes
    const [notes] = await query(
      `SELECT ln.*, u.name as author_name, u.role as author_role
       FROM lead_notes ln
       JOIN users u ON ln.author_id = u.id
       WHERE ln.lead_id = ?
       ORDER BY ln.created_at DESC`,
      [id]
    );

    // Fetch follow-ups
    const [followUps] = await query(
      `SELECT fu.*, u.name as consultant_name
       FROM follow_ups fu
       JOIN users u ON fu.consultant_id = u.id
       WHERE fu.lead_id = ?
       ORDER BY fu.scheduled_at DESC`,
      [id]
    );

    res.json({
      success: true,
      lead: {
        ...lead,
        notes,
        follow_ups: followUps,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new lead manually (Consultant/Admin)
 */
const createLead = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      property_id,
      source = 'direct',
      status = 'New',
      deal_value = 0,
      assigned_consultant_id,
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and phone are required.' });
    }

    const consultantId = assigned_consultant_id || req.user.id;

    const [result] = await query(
      `INSERT INTO leads (name, email, phone, property_id, source, status, deal_value, assigned_consultant_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        email ? email.toLowerCase().trim() : null,
        phone.trim(),
        property_id || null,
        source,
        status,
        deal_value || 0,
        consultantId,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Lead created successfully.',
      leadId: result.insertId,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update lead status, deal value, consultant assignment, follow-up dates
 */
const updateLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      status,
      deal_value,
      assigned_consultant_id,
      last_follow_up,
      next_follow_up,
    } = req.body;

    const [existing] = await query('SELECT id FROM leads WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Lead not found.' });
    }

    await query(
      `UPDATE leads
       SET status = COALESCE(?, status),
           deal_value = COALESCE(?, deal_value),
           assigned_consultant_id = COALESCE(?, assigned_consultant_id),
           last_follow_up = COALESCE(?, last_follow_up),
           next_follow_up = COALESCE(?, next_follow_up),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        status || null,
        deal_value !== undefined ? deal_value : null,
        assigned_consultant_id !== undefined ? assigned_consultant_id : null,
        last_follow_up || null,
        next_follow_up || null,
        id,
      ]
    );

    res.json({
      success: true,
      message: 'Lead updated successfully.',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Add an internal note to a lead
 */
const addLeadNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!note || !note.trim()) {
      return res.status(400).json({ success: false, message: 'Note text cannot be empty.' });
    }

    const [result] = await query(
      'INSERT INTO lead_notes (lead_id, author_id, note) VALUES (?, ?, ?)',
      [id, req.user.id, note.trim()]
    );

    // Update last_follow_up timestamp
    await query('UPDATE leads SET last_follow_up = CURRENT_TIMESTAMP WHERE id = ?', [id]);

    res.status(201).json({
      success: true,
      message: 'Internal consultation note recorded.',
      noteId: result.insertId,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  addLeadNote,
};
