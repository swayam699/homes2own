const { query } = require('../config/db');

const getFollowUps = async (req, res, next) => {
  try {
    const user = req.user;
    const { status, limit = 20 } = req.query;

    let whereSql = 'WHERE 1=1';
    const params = [];

    if (user.role === 'consultant') {
      whereSql += ' AND fu.consultant_id = ?';
      params.push(user.id);
    }

    if (status) {
      whereSql += ' AND fu.status = ?';
      params.push(status);
    }

    const [rows] = await query(
      `SELECT 
        fu.*,
        l.name as lead_name, l.phone as lead_phone, l.status as lead_status,
        p.title as property_title,
        u.name as consultant_name
       FROM follow_ups fu
       JOIN leads l ON fu.lead_id = l.id
       LEFT JOIN properties p ON l.property_id = p.id
       LEFT JOIN users u ON fu.consultant_id = u.id
       ${whereSql}
       ORDER BY fu.scheduled_at ASC
       LIMIT ?`,
      [...params, parseInt(limit, 10)]
    );

    res.json({
      success: true,
      follow_ups: rows,
    });
  } catch (err) {
    next(err);
  }
};

const createFollowUp = async (req, res, next) => {
  try {
    const { lead_id, scheduled_at, follow_up_type = 'call', notes } = req.body;

    if (!lead_id || !scheduled_at) {
      return res.status(400).json({ success: false, message: 'Lead ID and scheduled time are required.' });
    }

    const [result] = await query(
      `INSERT INTO follow_ups (lead_id, consultant_id, scheduled_at, follow_up_type, notes, status)
       VALUES (?, ?, ?, ?, ?, 'scheduled')`,
      [lead_id, req.user.id, scheduled_at, follow_up_type, notes || null]
    );

    await query('UPDATE leads SET next_follow_up = ? WHERE id = ?', [scheduled_at, lead_id]);

    res.status(201).json({
      success: true,
      message: 'Follow-up scheduled.',
      followUpId: result.insertId,
    });
  } catch (err) {
    next(err);
  }
};

const updateFollowUp = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes, scheduled_at } = req.body;

    await query(
      `UPDATE follow_ups
       SET status = COALESCE(?, status),
           notes = COALESCE(?, notes),
           scheduled_at = COALESCE(?, scheduled_at),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status || null, notes || null, scheduled_at || null, id]
    );

    res.json({
      success: true,
      message: 'Follow-up updated.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getFollowUps,
  createFollowUp,
  updateFollowUp,
};
