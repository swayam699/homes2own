const db = require('../config/db');

/**
 * Get all menu items or search dishes across restaurants
 * GET /api/menu
 */
const searchMenuItems = async (req, res, next) => {
  try {
    const { search, restaurantId, isVeg, isPopular, categoryId } = req.query;

    let queryStr = `
      SELECT m.*, r.name as restaurant_name, r.slug as restaurant_slug, c.name as category_name
      FROM menu_items m
      JOIN restaurants r ON m.restaurant_id = r.id
      JOIN menu_categories c ON m.category_id = c.id
      WHERE r.is_active = 1
    `;
    const params = [];

    if (search) {
      queryStr += ' AND (m.name LIKE ? OR m.description LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    if (restaurantId) {
      queryStr += ' AND m.restaurant_id = ?';
      params.push(restaurantId);
    }

    if (categoryId) {
      queryStr += ' AND m.category_id = ?';
      params.push(categoryId);
    }

    if (isVeg !== undefined && isVeg !== '') {
      queryStr += ' AND m.is_veg = ?';
      params.push(isVeg === 'true' || isVeg === '1' ? 1 : 0);
    }

    if (isPopular === 'true' || isPopular === '1') {
      queryStr += ' AND m.is_popular = 1';
    }

    queryStr += ' ORDER BY m.is_popular DESC, m.name ASC';

    const [items] = await db.query(queryStr, params);

    res.json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single menu item by ID
 * GET /api/menu/:id
 */
const getMenuItemById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT m.*, r.name as restaurant_name, c.name as category_name
       FROM menu_items m
       JOIN restaurants r ON m.restaurant_id = r.id
       JOIN menu_categories c ON m.category_id = c.id
       WHERE m.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found.',
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new menu item
 * POST /api/menu
 */
const createMenuItem = async (req, res, next) => {
  try {
    const {
      restaurant_id,
      category_id,
      name,
      description,
      price,
      image_url,
      is_veg = 1,
      is_available = 1,
      is_popular = 0,
    } = req.body;

    if (!restaurant_id || !name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant ID, item name, and price are required.',
      });
    }

    // Verify restaurant exists
    const [rest] = await db.query('SELECT id FROM restaurants WHERE id = ?', [restaurant_id]);
    if (rest.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found.',
      });
    }

    // If category_id not provided, assign to first category of restaurant or create a Default category
    let finalCategoryId = category_id;
    if (!finalCategoryId) {
      const [cats] = await db.query('SELECT id FROM menu_categories WHERE restaurant_id = ? LIMIT 1', [restaurant_id]);
      if (cats.length > 0) {
        finalCategoryId = cats[0].id;
      } else {
        const [newCat] = await db.query(
          'INSERT INTO menu_categories (restaurant_id, name, display_order) VALUES (?, ?, ?)',
          [restaurant_id, 'Specialties', 1]
        );
        finalCategoryId = newCat.insertId;
      }
    }

    const [result] = await db.query(
      `INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_veg, is_available, is_popular)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        restaurant_id,
        finalCategoryId,
        name.trim(),
        description || null,
        parseFloat(price),
        image_url || null,
        is_veg ? 1 : 0,
        is_available ? 1 : 0,
        is_popular ? 1 : 0,
      ]
    );

    const [newItem] = await db.query('SELECT * FROM menu_items WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully.',
      data: newItem[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing menu item
 * PUT /api/menu/:id
 */
const updateMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      image_url,
      is_veg,
      is_available,
      is_popular,
      category_id,
    } = req.body;

    const [existing] = await db.query('SELECT id FROM menu_items WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found.',
      });
    }

    await db.query(
      `UPDATE menu_items SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        image_url = COALESCE(?, image_url),
        is_veg = COALESCE(?, is_veg),
        is_available = COALESCE(?, is_available),
        is_popular = COALESCE(?, is_popular),
        category_id = COALESCE(?, category_id)
       WHERE id = ?`,
      [
        name,
        description,
        price !== undefined ? parseFloat(price) : null,
        image_url,
        is_veg !== undefined ? (is_veg ? 1 : 0) : null,
        is_available !== undefined ? (is_available ? 1 : 0) : null,
        is_popular !== undefined ? (is_popular ? 1 : 0) : null,
        category_id,
        id,
      ]
    );

    const [updated] = await db.query('SELECT * FROM menu_items WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Menu item updated successfully.',
      data: updated[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle item availability
 * PATCH /api/menu/:id/availability
 */
const toggleAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT id, is_available, name FROM menu_items WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found.',
      });
    }

    const currentStatus = existing[0].is_available;
    const newStatus = currentStatus ? 0 : 1;

    await db.query('UPDATE menu_items SET is_available = ? WHERE id = ?', [newStatus, id]);

    res.json({
      success: true,
      message: `Item "${existing[0].name}" is now ${newStatus ? 'available' : 'unavailable'}.`,
      is_available: newStatus,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a menu item
 * DELETE /api/menu/:id
 */
const deleteMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT name FROM menu_items WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found.',
      });
    }

    await db.query('DELETE FROM menu_items WHERE id = ?', [id]);

    res.json({
      success: true,
      message: `Menu item "${existing[0].name}" removed successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  toggleAvailability,
  deleteMenuItem,
};
