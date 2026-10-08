const { query } = require('../config/db');

/**
 * Get all favourite properties for the authenticated user
 */
const getFavourites = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [rows] = await query(
      `SELECT 
        p.id, p.title, p.slug, p.transaction_type, p.property_type,
        p.configuration, p.bedrooms, p.bathrooms, p.carpet_area, p.built_up_area,
        p.price, p.price_per_sqft, p.possession_status, p.availability_status,
        p.is_featured, p.address, f.created_at as saved_at,
        l.name as location_name, l.slug as location_slug,
        d.name as developer_name, d.slug as developer_slug,
        (
          SELECT image_url FROM property_images pi 
          WHERE pi.property_id = p.id 
          ORDER BY pi.is_primary DESC, pi.display_order ASC 
          LIMIT 1
        ) as primary_image
       FROM favourites f
       JOIN properties p ON f.property_id = p.id
       LEFT JOIN locations l ON p.location_id = l.id
       LEFT JOIN developers d ON p.developer_id = d.id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      favourites: rows,
      count: rows.length,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Check if a specific property is in user's favourites
 */
const checkFavourite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { propertyId } = req.params;

    const [rows] = await query(
      'SELECT id FROM favourites WHERE user_id = ? AND property_id = ?',
      [userId, propertyId]
    );

    res.json({
      success: true,
      isFavourite: rows && rows.length > 0,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Add a property to favourites (idempotent)
 */
const addFavourite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { propertyId } = req.params;

    // Verify property exists
    const [propRows] = await query('SELECT id FROM properties WHERE id = ?', [propertyId]);
    if (!propRows || propRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    // Insert or ignore
    await query(
      'INSERT OR IGNORE INTO favourites (user_id, property_id) VALUES (?, ?)',
      [userId, propertyId]
    ).catch(async () => {
      // In case of MySQL syntax
      await query(
        'INSERT INTO favourites (user_id, property_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE created_at = created_at',
        [userId, propertyId]
      );
    });

    res.status(201).json({
      success: true,
      message: 'Property saved to your favourites.',
      propertyId: parseInt(propertyId, 10),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Remove a property from favourites
 */
const removeFavourite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { propertyId } = req.params;

    await query(
      'DELETE FROM favourites WHERE user_id = ? AND property_id = ?',
      [userId, propertyId]
    );

    res.json({
      success: true,
      message: 'Property removed from favourites.',
      propertyId: parseInt(propertyId, 10),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getFavourites,
  checkFavourite,
  addFavourite,
  removeFavourite,
};
