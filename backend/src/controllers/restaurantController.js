const db = require('../config/db');

/**
 * List / search / filter restaurants
 * GET /api/restaurants
 */
const getAllRestaurants = async (req, res, next) => {
  try {
    const {
      search,
      cuisine,
      minRating,
      maxDeliveryTime,
      maxPrice,
      isFeatured,
      sortBy = 'rating', // 'rating', 'delivery_time', 'price_asc', 'price_desc'
      city,
    } = req.query;

    let queryStr = 'SELECT * FROM restaurants WHERE is_active = 1';
    const params = [];

    // Search query (matches restaurant name or cuisine)
    if (search) {
      queryStr += ' AND (name LIKE ? OR cuisine_types LIKE ? OR description LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    // Cuisine filter
    if (cuisine && cuisine !== 'All') {
      queryStr += ' AND cuisine_types LIKE ?';
      params.push(`%${cuisine.trim()}%`);
    }

    // Minimum rating filter
    if (minRating) {
      queryStr += ' AND rating >= ?';
      params.push(parseFloat(minRating));
    }

    // Max delivery time
    if (maxDeliveryTime) {
      queryStr += ' AND delivery_time_max <= ?';
      params.push(parseInt(maxDeliveryTime, 10));
    }

    // Max price for two
    if (maxPrice) {
      queryStr += ' AND price_for_two <= ?';
      params.push(parseFloat(maxPrice));
    }

    // Featured only
    if (isFeatured === 'true' || isFeatured === '1') {
      queryStr += ' AND is_featured = 1';
    }

    // City filter
    if (city && city !== 'All') {
      queryStr += ' AND city = ?';
      params.push(city);
    }

    // Sorting
    switch (sortBy) {
      case 'delivery_time':
        queryStr += ' ORDER BY delivery_time_min ASC, rating DESC';
        break;
      case 'price_asc':
        queryStr += ' ORDER BY price_for_two ASC';
        break;
      case 'price_desc':
        queryStr += ' ORDER BY price_for_two DESC';
        break;
      case 'rating':
      default:
        queryStr += ' ORDER BY rating DESC, total_ratings DESC';
        break;
    }

    const [restaurants] = await db.query(queryStr, params);

    res.json({
      success: true,
      count: restaurants.length,
      data: restaurants,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get restaurant by ID or slug with full menu grouped by categories
 * GET /api/restaurants/:idOrSlug
 */
const getRestaurantDetails = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const isId = /^\d+$/.test(idOrSlug);

    const [restaurantRows] = await db.query(
      isId
        ? 'SELECT * FROM restaurants WHERE id = ?'
        : 'SELECT * FROM restaurants WHERE slug = ?',
      [idOrSlug]
    );

    if (restaurantRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found.',
      });
    }

    const restaurant = restaurantRows[0];

    // Fetch categories
    const [categories] = await db.query(
      'SELECT * FROM menu_categories WHERE restaurant_id = ? ORDER BY display_order ASC, id ASC',
      [restaurant.id]
    );

    // Fetch all menu items
    const [menuItems] = await db.query(
      'SELECT * FROM menu_items WHERE restaurant_id = ? ORDER BY is_popular DESC, price ASC',
      [restaurant.id]
    );

    // Group menu items into their categories
    const categoriesWithItems = categories.map((cat) => ({
      ...cat,
      items: menuItems.filter((item) => item.category_id === cat.id),
    }));

    res.json({
      success: true,
      data: {
        ...restaurant,
        categories: categoriesWithItems,
        totalItems: menuItems.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new restaurant (Admin only)
 * POST /api/restaurants
 */
const createRestaurant = async (req, res, next) => {
  try {
    const {
      name,
      slug,
      description,
      address,
      city = 'Mumbai',
      phone,
      rating = 4.5,
      delivery_time_min = 25,
      delivery_time_max = 35,
      price_for_two = 400.00,
      cuisine_types,
      image_url,
      banner_url,
      is_featured = 0,
    } = req.body;

    if (!name || !address || !cuisine_types) {
      return res.status(400).json({
        success: false,
        message: 'Name, address, and cuisine types are required.',
      });
    }

    const finalSlug = (slug || name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);

    const [result] = await db.query(
      `INSERT INTO restaurants (name, slug, description, address, city, phone, rating, delivery_time_min, delivery_time_max, price_for_two, cuisine_types, image_url, banner_url, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        finalSlug,
        description || null,
        address,
        city,
        phone || null,
        rating,
        delivery_time_min,
        delivery_time_max,
        price_for_two,
        cuisine_types,
        image_url || null,
        banner_url || null,
        is_featured ? 1 : 0,
      ]
    );

    const [newRest] = await db.query('SELECT * FROM restaurants WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Restaurant created successfully.',
      data: newRest[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update restaurant details (Admin / Restaurant admin)
 * PUT /api/restaurants/:id
 */
const updateRestaurant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      address,
      city,
      phone,
      rating,
      delivery_time_min,
      delivery_time_max,
      price_for_two,
      cuisine_types,
      image_url,
      banner_url,
      is_active,
      is_featured,
    } = req.body;

    const [existing] = await db.query('SELECT id FROM restaurants WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found.',
      });
    }

    await db.query(
      `UPDATE restaurants SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        address = COALESCE(?, address),
        city = COALESCE(?, city),
        phone = COALESCE(?, phone),
        rating = COALESCE(?, rating),
        delivery_time_min = COALESCE(?, delivery_time_min),
        delivery_time_max = COALESCE(?, delivery_time_max),
        price_for_two = COALESCE(?, price_for_two),
        cuisine_types = COALESCE(?, cuisine_types),
        image_url = COALESCE(?, image_url),
        banner_url = COALESCE(?, banner_url),
        is_active = COALESCE(?, is_active),
        is_featured = COALESCE(?, is_featured)
       WHERE id = ?`,
      [
        name,
        description,
        address,
        city,
        phone,
        rating,
        delivery_time_min,
        delivery_time_max,
        price_for_two,
        cuisine_types,
        image_url,
        banner_url,
        is_active !== undefined ? (is_active ? 1 : 0) : null,
        is_featured !== undefined ? (is_featured ? 1 : 0) : null,
        id,
      ]
    );

    const [updated] = await db.query('SELECT * FROM restaurants WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Restaurant updated successfully.',
      data: updated[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a restaurant (Admin only)
 * DELETE /api/restaurants/:id
 */
const deleteRestaurant = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT name FROM restaurants WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found.',
      });
    }

    await db.query('DELETE FROM restaurants WHERE id = ?', [id]);

    res.json({
      success: true,
      message: `Restaurant "${existing[0].name}" deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRestaurants,
  getRestaurantDetails,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
};
