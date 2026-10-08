const { query } = require('../config/db');

const getLocations = async (req, res, next) => {
  try {
    const [rows] = await query(`
      SELECT l.*,
        (SELECT COUNT(*) FROM properties p WHERE p.location_id = l.id AND p.is_published = 1) as live_property_count
      FROM locations l
      ORDER BY l.name ASC
    `);

    res.json({
      success: true,
      locations: rows,
    });
  } catch (err) {
    next(err);
  }
};

const getLocationByIdOrSlug = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const isNumeric = /^\d+$/.test(idOrSlug);
    const where = isNumeric ? 'l.id = ?' : 'l.slug = ?';
    const param = isNumeric ? parseInt(idOrSlug, 10) : idOrSlug;

    const [rows] = await query(`
      SELECT l.*,
        (SELECT COUNT(*) FROM properties p WHERE p.location_id = l.id AND p.is_published = 1) as live_property_count
      FROM locations l 
      WHERE ${where}
    `, [param]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Location not found.' });
    }

    const location = rows[0];

    const [properties] = await query(`
      SELECT p.id, p.title, p.slug, p.configuration, p.price, p.carpet_area, p.transaction_type, p.possession_status,
        d.name as developer_name,
        (SELECT image_url FROM property_images pi WHERE pi.property_id = p.id ORDER BY is_primary DESC, display_order ASC LIMIT 1) as primary_image
      FROM properties p
      LEFT JOIN developers d ON p.developer_id = d.id
      WHERE p.location_id = ? AND p.is_published = 1
      ORDER BY p.is_featured DESC, p.created_at DESC
    `, [location.id]);

    res.json({
      success: true,
      location: {
        ...location,
        properties,
      },
    });
  } catch (err) {
    next(err);
  }
};

const createLocation = async (req, res, next) => {
  try {
    const { name, region, overview, landmark, avg_price_sqft, image_url } = req.body;
    if (!name || !region) {
      return res.status(400).json({ success: false, message: 'Name and region are required.' });
    }

    const slug = name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');

    const [result] = await query(
      `INSERT INTO locations (name, slug, region, overview, landmark, avg_price_sqft, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, slug, region, overview || null, landmark || null, avg_price_sqft || 0, image_url || null]
    );

    res.status(201).json({
      success: true,
      message: 'Location created successfully.',
      id: result.insertId,
      slug,
    });
  } catch (err) {
    next(err);
  }
};

const updateLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, region, overview, landmark, avg_price_sqft, image_url } = req.body;

    await query(
      `UPDATE locations
       SET name = COALESCE(?, name),
           region = COALESCE(?, region),
           overview = COALESCE(?, overview),
           landmark = COALESCE(?, landmark),
           avg_price_sqft = COALESCE(?, avg_price_sqft),
           image_url = COALESCE(?, image_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name || null, region || null, overview || null, landmark || null, avg_price_sqft || null, image_url || null, id]
    );

    res.json({ success: true, message: 'Location updated successfully.' });
  } catch (err) {
    next(err);
  }
};

const deleteLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM locations WHERE id = ?', [id]);
    res.json({ success: true, message: 'Location deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getLocations,
  getLocationByIdOrSlug,
  createLocation,
  updateLocation,
  deleteLocation,
};
