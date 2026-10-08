const { query } = require('../config/db');

const getDevelopers = async (req, res, next) => {
  try {
    const [rows] = await query(`
      SELECT d.*, 
        (SELECT COUNT(*) FROM properties p WHERE p.developer_id = d.id AND p.is_published = 1) as property_count
      FROM developers d
      ORDER BY d.is_verified DESC, d.name ASC
    `);

    res.json({
      success: true,
      developers: rows,
    });
  } catch (err) {
    next(err);
  }
};

const getDeveloperByIdOrSlug = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const isNumeric = /^\d+$/.test(idOrSlug);
    const where = isNumeric ? 'd.id = ?' : 'd.slug = ?';
    const param = isNumeric ? parseInt(idOrSlug, 10) : idOrSlug;

    const [rows] = await query(`SELECT * FROM developers d WHERE ${where}`, [param]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Developer not found.' });
    }

    const developer = rows[0];

    const [properties] = await query(`
      SELECT p.id, p.title, p.slug, p.configuration, p.price, p.carpet_area, p.transaction_type, p.possession_status,
        l.name as location_name,
        (SELECT image_url FROM property_images pi WHERE pi.property_id = p.id ORDER BY is_primary DESC, display_order ASC LIMIT 1) as primary_image
      FROM properties p
      LEFT JOIN locations l ON p.location_id = l.id
      WHERE p.developer_id = ? AND p.is_published = 1
    `, [developer.id]);

    res.json({
      success: true,
      developer: {
        ...developer,
        properties,
      },
    });
  } catch (err) {
    next(err);
  }
};

const createDeveloper = async (req, res, next) => {
  try {
    const { name, logo_url, description, website, contact_email, contact_phone, established_year } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Developer name is required.' });
    }

    const slug = name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');

    const [result] = await query(
      `INSERT INTO developers (name, slug, logo_url, description, website, contact_email, contact_phone, established_year, is_verified)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [name, slug, logo_url || null, description || null, website || null, contact_email || null, contact_phone || null, established_year || null]
    );

    res.status(201).json({
      success: true,
      message: 'Developer created successfully.',
      id: result.insertId,
      slug,
    });
  } catch (err) {
    next(err);
  }
};

const updateDeveloper = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, logo_url, description, website, contact_email, contact_phone, established_year, is_verified } = req.body;

    await query(
      `UPDATE developers
       SET name = COALESCE(?, name),
           logo_url = COALESCE(?, logo_url),
           description = COALESCE(?, description),
           website = COALESCE(?, website),
           contact_email = COALESCE(?, contact_email),
           contact_phone = COALESCE(?, contact_phone),
           established_year = COALESCE(?, established_year),
           is_verified = COALESCE(?, is_verified),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name || null, logo_url || null, description || null, website || null, contact_email || null, contact_phone || null, established_year || null, is_verified !== undefined ? is_verified : null, id]
    );

    res.json({ success: true, message: 'Developer updated successfully.' });
  } catch (err) {
    next(err);
  }
};

const deleteDeveloper = async (req, res, next) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM developers WHERE id = ?', [id]);
    res.json({ success: true, message: 'Developer deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDevelopers,
  getDeveloperByIdOrSlug,
  createDeveloper,
  updateDeveloper,
  deleteDeveloper,
};
