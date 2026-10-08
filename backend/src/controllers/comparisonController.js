const { query } = require('../config/db');

/**
 * Get user's compared properties (up to 3) with side-by-side details
 */
const getComparisons = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [rows] = await query(
      `SELECT 
        p.id, p.title, p.slug, p.transaction_type, p.property_type,
        p.configuration, p.bedrooms, p.bathrooms, p.carpet_area, p.built_up_area,
        p.price, p.price_per_sqft, p.floor_number, p.total_floors,
        p.possession_status, p.possession_date, p.rera_number, p.parking_spaces,
        p.furnishing, p.availability_status, p.address,
        l.name as location_name, l.slug as location_slug,
        d.name as developer_name, d.slug as developer_slug,
        (
          SELECT image_url FROM property_images pi 
          WHERE pi.property_id = p.id 
          ORDER BY pi.is_primary DESC, pi.display_order ASC 
          LIMIT 1
        ) as primary_image
       FROM property_comparisons pc
       JOIN properties p ON pc.property_id = p.id
       LEFT JOIN locations l ON p.location_id = l.id
       LEFT JOIN developers d ON p.developer_id = d.id
       WHERE pc.user_id = ?
       ORDER BY pc.created_at ASC
       LIMIT 3`,
      [userId]
    );

    // Fetch amenities for each compared property
    const compared = await Promise.all(
      rows.map(async (prop) => {
        const [amenities] = await query(
          `SELECT a.id, a.name, a.icon 
           FROM property_amenities pa 
           JOIN amenities a ON pa.amenity_id = a.id 
           WHERE pa.property_id = ?`,
          [prop.id]
        );
        return {
          ...prop,
          amenities,
        };
      })
    );

    res.json({
      success: true,
      comparisons: compared,
      count: compared.length,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Add a property to comparison queue (Max 3)
 */
const addComparison = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { propertyId } = req.params;

    // Check current count
    const [countRows] = await query(
      'SELECT COUNT(*) as total FROM property_comparisons WHERE user_id = ?',
      [userId]
    );

    const total = countRows[0]?.total || 0;

    // Check if already compared
    const [existing] = await query(
      'SELECT id FROM property_comparisons WHERE user_id = ? AND property_id = ?',
      [userId, propertyId]
    );

    if (existing && existing.length > 0) {
      return res.json({
        success: true,
        message: 'Property is already in your comparison tray.',
      });
    }

    if (total >= 3) {
      return res.status(400).json({
        success: false,
        message: 'You can compare a maximum of 3 properties at once. Please remove one to add another.',
      });
    }

    await query(
      'INSERT OR IGNORE INTO property_comparisons (user_id, property_id) VALUES (?, ?)',
      [userId, propertyId]
    ).catch(async () => {
      await query(
        'INSERT INTO property_comparisons (user_id, property_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE created_at = created_at',
        [userId, propertyId]
      );
    });

    res.status(201).json({
      success: true,
      message: 'Property added to comparison tray.',
      propertyId: parseInt(propertyId, 10),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Remove a property from comparison
 */
const removeComparison = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { propertyId } = req.params;

    await query(
      'DELETE FROM property_comparisons WHERE user_id = ? AND property_id = ?',
      [userId, propertyId]
    );

    res.json({
      success: true,
      message: 'Property removed from comparison.',
      propertyId: parseInt(propertyId, 10),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Clear all compared properties
 */
const clearComparisons = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await query('DELETE FROM property_comparisons WHERE user_id = ?', [userId]);

    res.json({
      success: true,
      message: 'Comparison tray cleared.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getComparisons,
  addComparison,
  removeComparison,
  clearComparisons,
};
