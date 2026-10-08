const { query } = require('../config/db');

/**
 * Get customer profile with summary stats
 */
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [userRows] = await query(
      `SELECT id, name, email, phone, role, avatar_url, preferred_locations,
              preferred_configurations, min_budget, max_budget, created_at
       FROM users WHERE id = ?`,
      [userId]
    );

    if (!userRows || userRows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const [favRows] = await query('SELECT COUNT(*) as count FROM favourites WHERE user_id = ?', [userId]);
    const [enqRows] = await query('SELECT COUNT(*) as count FROM enquiries WHERE user_id = ?', [userId]);
    const [visitRows] = await query('SELECT COUNT(*) as count FROM site_visits WHERE user_id = ?', [userId]);
    const [cbRows] = await query('SELECT COUNT(*) as count FROM callbacks WHERE user_id = ?', [userId]);

    res.json({
      success: true,
      profile: {
        ...userRows[0],
        saved_properties_count: favRows[0]?.count || 0,
        enquiries_count: enqRows[0]?.count || 0,
        site_visits_count: visitRows[0]?.count || 0,
        callbacks_count: cbRows[0]?.count || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update user preferences and profile details
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      name,
      phone,
      avatar_url,
      preferred_locations,
      preferred_configurations,
      min_budget,
      max_budget,
    } = req.body;

    await query(
      `UPDATE users
       SET name = COALESCE(?, name),
           phone = COALESCE(?, phone),
           avatar_url = COALESCE(?, avatar_url),
           preferred_locations = COALESCE(?, preferred_locations),
           preferred_configurations = COALESCE(?, preferred_configurations),
           min_budget = COALESCE(?, min_budget),
           max_budget = COALESCE(?, max_budget),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name || null,
        phone || null,
        avatar_url || null,
        preferred_locations || null,
        preferred_configurations || null,
        min_budget !== undefined ? min_budget : null,
        max_budget !== undefined ? max_budget : null,
        userId,
      ]
    );

    const [updatedRows] = await query(
      `SELECT id, name, email, phone, role, avatar_url, preferred_locations,
              preferred_configurations, min_budget, max_budget, created_at
       FROM users WHERE id = ?`,
      [userId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedRows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * (Admin) List all users
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    let whereSql = 'WHERE 1=1';
    const params = [];

    if (role) {
      whereSql += ' AND role = ?';
      params.push(role);
    }

    if (search) {
      whereSql += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    const [countRows] = await query(`SELECT COUNT(*) as total FROM users ${whereSql}`, params);
    const total = countRows[0]?.total || 0;

    const [rows] = await query(
      `SELECT id, name, email, phone, role, is_active, created_at, updated_at
       FROM users ${whereSql}
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit, 10), offset]
    );

    res.json({
      success: true,
      users: rows,
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
 * (Admin) Update user role or status
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, is_active } = req.body;

    const [existing] = await query('SELECT id, role FROM users WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await query(
      `UPDATE users
       SET role = COALESCE(?, role),
           is_active = COALESCE(?, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [role || null, is_active !== undefined ? is_active : null, id]
    );

    res.json({
      success: true,
      message: 'User updated successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAllUsers,
  updateUserRole,
};
