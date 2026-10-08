const { query } = require('../config/db');

/**
 * Get comprehensive system administration metrics computed directly from database
 */
const getAdminStats = async (req, res, next) => {
  try {
    // 1. Properties
    const [propStats] = await query(`
      SELECT 
        COUNT(*) as total_properties,
        SUM(CASE WHEN availability_status = 'Available' AND is_published = 1 THEN 1 ELSE 0 END) as active_listings,
        SUM(CASE WHEN availability_status = 'Sold' THEN 1 ELSE 0 END) as sold_properties,
        SUM(CASE WHEN possession_status = 'Upcoming' THEN 1 ELSE 0 END) as upcoming_projects
      FROM properties
    `);

    // 2. Users & Customers
    const [userStats] = await query(`
      SELECT 
        SUM(CASE WHEN role = 'customer' THEN 1 ELSE 0 END) as total_customers,
        SUM(CASE WHEN role = 'consultant' THEN 1 ELSE 0 END) as total_consultants
      FROM users
    `);

    // 3. Leads & Deals
    const [leadStats] = await query(`
      SELECT 
        COUNT(*) as total_leads,
        SUM(CASE WHEN status = 'New' THEN 1 ELSE 0 END) as new_leads,
        SUM(CASE WHEN status = 'Converted' THEN 1 ELSE 0 END) as converted_leads,
        SUM(CASE WHEN status = 'Converted' THEN COALESCE(deal_value, 0) ELSE 0 END) as closed_deal_value
      FROM leads
    `);

    // 4. Enquiries
    const [enqStats] = await query(`
      SELECT 
        COUNT(*) as total_enquiries,
        SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_enquiries
      FROM enquiries
    `);

    // 5. Site Visits
    const [visitStats] = await query(`
      SELECT 
        COUNT(*) as total_site_visits,
        SUM(CASE WHEN status = 'Requested' THEN 1 ELSE 0 END) as pending_visits,
        SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as scheduled_visits,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed_visits
      FROM site_visits
    `);

    // 6. Callbacks
    const [cbStats] = await query(`
      SELECT 
        COUNT(*) as total_callbacks,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending_callbacks
      FROM callbacks
    `);

    // 7. Recent Leads
    const [recentLeads] = await query(`
      SELECT l.id, l.name, l.phone, l.status, l.source, l.deal_value, l.created_at,
             p.title as property_title, u.name as consultant_name
      FROM leads l
      LEFT JOIN properties p ON l.property_id = p.id
      LEFT JOIN users u ON l.assigned_consultant_id = u.id
      ORDER BY l.created_at DESC
      LIMIT 5
    `);

    // 8. Recent Enquiries
    const [recentEnquiries] = await query(`
      SELECT e.id, e.name, e.email, e.phone, e.preferred_contact_method, e.status, e.created_at,
             p.title as property_title
      FROM enquiries e
      LEFT JOIN properties p ON e.property_id = p.id
      ORDER BY e.created_at DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      stats: {
        total_properties: propStats[0]?.total_properties || 0,
        active_listings: propStats[0]?.active_listings || 0,
        sold_properties: propStats[0]?.sold_properties || 0,
        upcoming_projects: propStats[0]?.upcoming_projects || 0,
        total_customers: userStats[0]?.total_customers || 0,
        total_consultants: userStats[0]?.total_consultants || 0,
        total_leads: leadStats[0]?.total_leads || 0,
        new_leads: leadStats[0]?.new_leads || 0,
        converted_leads: leadStats[0]?.converted_leads || 0,
        closed_deal_value: leadStats[0]?.closed_deal_value || 0,
        total_enquiries: enqStats[0]?.total_enquiries || 0,
        new_enquiries: enqStats[0]?.new_enquiries || 0,
        total_site_visits: visitStats[0]?.total_site_visits || 0,
        pending_visits: visitStats[0]?.pending_visits || 0,
        scheduled_visits: visitStats[0]?.scheduled_visits || 0,
        completed_visits: visitStats[0]?.completed_visits || 0,
        total_callbacks: cbStats[0]?.total_callbacks || 0,
        pending_callbacks: cbStats[0]?.pending_callbacks || 0,
      },
      recent_leads: recentLeads,
      recent_enquiries: recentEnquiries,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAdminStats,
};
