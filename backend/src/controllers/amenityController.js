const { query } = require('../config/db');

const getAmenities = async (req, res, next) => {
  try {
    const [rows] = await query('SELECT * FROM amenities ORDER BY category ASC, name ASC');
    res.json({ success: true, amenities: rows });
  } catch (err) {
    next(err);
  }
};

const createAmenity = async (req, res, next) => {
  try {
    const { name, category = 'General', icon = 'CheckCircle' } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Amenity name is required.' });
    }

    const slug = name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');

    const [result] = await query(
      'INSERT INTO amenities (name, slug, category, icon) VALUES (?, ?, ?, ?)',
      [name, slug, category, icon]
    );

    res.status(201).json({
      success: true,
      message: 'Amenity created successfully.',
      id: result.insertId,
      slug,
    });
  } catch (err) {
    next(err);
  }
};

const updateAmenity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category, icon } = req.body;

    await query(
      `UPDATE amenities 
       SET name = COALESCE(?, name),
           category = COALESCE(?, category),
           icon = COALESCE(?, icon)
       WHERE id = ?`,
      [name || null, category || null, icon || null, id]
    );

    res.json({ success: true, message: 'Amenity updated successfully.' });
  } catch (err) {
    next(err);
  }
};

const deleteAmenity = async (req, res, next) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM amenities WHERE id = ?', [id]);
    res.json({ success: true, message: 'Amenity deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAmenities,
  createAmenity,
  updateAmenity,
  deleteAmenity,
};
