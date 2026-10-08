const { query } = require('../config/db');

/**
 * Get project development timeline history
 */
const getProjectStatusHistory = async (req, res, next) => {
  try {
    const { propertyId } = req.params;

    const [rows] = await query(
      `SELECT ps.*, u.name as updated_by_name
       FROM project_status ps
       LEFT JOIN users u ON ps.updated_by_user_id = u.id
       WHERE ps.property_id = ?
       ORDER BY ps.created_at DESC`,
      [propertyId]
    );

    res.json({
      success: true,
      timeline: rows,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Record a new project stage transition or progress milestone (Admin/Consultant)
 */
const updateProjectStatus = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const { stage, completion_percentage, target_date, notes } = req.body;

    const validStages = [
      'Upcoming',
      'Launching Soon',
      'Launched',
      'Under Construction',
      'Possession',
      'Ready to Move',
    ];

    if (!stage || !validStages.includes(stage)) {
      return res.status(400).json({
        success: false,
        message: `Stage must be one of: ${validStages.join(', ')}`,
      });
    }

    const [result] = await query(
      `INSERT INTO project_status (property_id, stage, completion_percentage, target_date, notes, updated_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        propertyId,
        stage,
        completion_percentage !== undefined ? parseInt(completion_percentage, 10) : 0,
        target_date || null,
        notes || null,
        req.user.id,
      ]
    );

    // Also sync the property's possession_status column if stage implies it
    let mappedPossession = 'Under Construction';
    if (stage === 'Ready to Move' || stage === 'Possession') {
      mappedPossession = 'Ready to Move';
    } else if (stage === 'Upcoming' || stage === 'Launching Soon') {
      mappedPossession = 'Upcoming';
    }

    await query(
      'UPDATE properties SET possession_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [mappedPossession, propertyId]
    );

    res.status(201).json({
      success: true,
      message: 'Project status milestone recorded successfully.',
      statusId: result.insertId,
      currentStage: stage,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProjectStatusHistory,
  updateProjectStatus,
};
