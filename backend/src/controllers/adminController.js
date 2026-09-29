const db = require('../config/db');

/**
 * Get aggregated dashboard statistics
 * GET /api/admin/stats
 */
const getAdminStats = async (req, res, next) => {
  try {
    // 1. Total customers
    const [custRows] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'customer'");
    const totalCustomers = custRows[0].count;

    // 2. Total restaurants
    const [restRows] = await db.query('SELECT COUNT(*) as count FROM restaurants');
    const totalRestaurants = restRows[0].count;

    // 3. Orders breakdown & revenue
    const [orderStats] = await db.query(`
      SELECT 
        COUNT(*) as totalOrders,
        SUM(CASE WHEN status != 'cancelled' THEN total_amount ELSE 0 END) as totalRevenue,
        SUM(CASE WHEN status IN ('placed', 'confirmed', 'preparing', 'out_for_delivery') THEN 1 ELSE 0 END) as pendingOrders,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as completedOrders,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelledOrders
      FROM orders
    `);

    const stats = orderStats[0] || {};

    // 4. Recent 5 orders
    const [recentOrders] = await db.query(`
      SELECT o.id, o.order_number, o.total_amount, o.status, o.created_at,
             u.name as customer_name, u.email as customer_email,
             r.name as restaurant_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN restaurants r ON o.restaurant_id = r.id
      ORDER BY o.id DESC
      LIMIT 6
    `);

    // 5. Popular menu items
    const [popularItems] = await db.query(`
      SELECT oi.item_name, r.name as restaurant_name, SUM(oi.quantity) as total_sold, SUM(oi.total_price) as revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN restaurants r ON o.restaurant_id = r.id
      WHERE o.status != 'cancelled'
      GROUP BY oi.item_name, r.name
      ORDER BY total_sold DESC
      LIMIT 5
    `);

    // 6. Revenue & orders by date (for charts)
    const [dailyTrends] = await db.query(`
      SELECT 
        SUBSTR(created_at, 1, 10) as date,
        COUNT(*) as order_count,
        SUM(CASE WHEN status != 'cancelled' THEN total_amount ELSE 0 END) as daily_revenue
      FROM orders
      GROUP BY SUBSTR(created_at, 1, 10)
      ORDER BY date ASC
      LIMIT 14
    `);

    res.json({
      success: true,
      data: {
        totalCustomers,
        totalRestaurants,
        totalOrders: stats.totalOrders || 0,
        totalRevenue: Number((stats.totalRevenue || 0).toFixed(2)),
        pendingOrders: stats.pendingOrders || 0,
        completedOrders: stats.completedOrders || 0,
        cancelledOrders: stats.cancelledOrders || 0,
        recentOrders,
        popularItems,
        dailyTrends,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all orders with search, filtering, sorting, and pagination
 * GET /api/admin/orders
 */
const getAllOrders = async (req, res, next) => {
  try {
    const {
      status,
      restaurantId,
      search,
      sortBy = 'id_desc',
      page = 1,
      limit = 10,
    } = req.query;

    let queryStr = `
      SELECT o.*, u.name as customer_name, u.email as customer_email,
             r.name as restaurant_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN restaurants r ON o.restaurant_id = r.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      queryStr += ' AND o.status = ?';
      params.push(status);
    }

    if (restaurantId) {
      queryStr += ' AND o.restaurant_id = ?';
      params.push(restaurantId);
    }

    if (search) {
      queryStr += ' AND (o.order_number LIKE ? OR u.name LIKE ? OR u.email LIKE ? OR r.name LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    // Sorting
    switch (sortBy) {
      case 'id_asc':
        queryStr += ' ORDER BY o.id ASC';
        break;
      case 'amount_desc':
        queryStr += ' ORDER BY o.total_amount DESC';
        break;
      case 'amount_asc':
        queryStr += ' ORDER BY o.total_amount ASC';
        break;
      case 'id_desc':
      default:
        queryStr += ' ORDER BY o.id DESC';
        break;
    }

    // Count total matching
    const [allMatching] = await db.query(queryStr, params);
    const totalCount = allMatching.length;

    // Apply pagination
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    queryStr += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const [orders] = await db.query(queryStr, params);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit, 10)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all customers with search and pagination
 * GET /api/admin/customers
 */
const getAllCustomers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 15 } = req.query;

    let queryStr = `
      SELECT u.id, u.name, u.email, u.phone, u.role, u.address, u.city, u.is_active, u.created_at,
             COUNT(o.id) as total_orders,
             COALESCE(SUM(o.total_amount), 0) as total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id AND o.status != 'cancelled'
      WHERE 1=1
    `;
    const params = [];

    if (role) {
      queryStr += ' AND u.role = ?';
      params.push(role);
    }

    if (search) {
      queryStr += ' AND (u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    queryStr += ' GROUP BY u.id ORDER BY u.id DESC';

    const [allMatching] = await db.query(queryStr, params);
    const totalCount = allMatching.length;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    queryStr += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const [customers] = await db.query(queryStr, params);

    res.json({
      success: true,
      data: customers,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit, 10)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle user active status (Admin)
 * PATCH /api/admin/users/:id/status
 */
const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (parseInt(id, 10) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own active session.',
      });
    }

    const [existing] = await db.query('SELECT id, name, is_active FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const newStatus = existing[0].is_active ? 0 : 1;
    await db.query('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, id]);

    res.json({
      success: true,
      message: `User "${existing[0].name}" is now ${newStatus ? 'active' : 'suspended'}.`,
      is_active: newStatus,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getAllOrders,
  getAllCustomers,
  toggleUserStatus,
};
