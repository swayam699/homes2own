const { query } = require('../config/db');

/**
 * Generate a URL-safe slug from title
 */
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

/**
 * Get properties with multi-facet filters, sorting, and pagination
 */
const getProperties = async (req, res, next) => {
  try {
    const {
      q,
      search,
      transaction_type,
      property_type,
      configuration,
      min_price,
      max_price,
      location_id,
      location_slug,
      locality,
      min_area,
      max_area,
      possession_status,
      amenities,
      availability_status,
      is_featured,
      is_published,
      sort = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    let whereConditions = ['p.is_published = 1'];
    const params = [];

    // Allow admins/consultants to view unpublished if specified
    if (is_published !== undefined && req.user && (req.user.role === 'admin' || req.user.role === 'consultant')) {
      whereConditions = ['1=1'];
      if (is_published !== 'all') {
        whereConditions.push('p.is_published = ?');
        params.push(is_published === 'true' || is_published === '1' ? 1 : 0);
      }
    }

    // Text Search
    const searchTerm = q || search;
    if (searchTerm) {
      whereConditions.push(
        `(p.title LIKE ? OR l.name LIKE ? OR d.name LIKE ? OR p.configuration LIKE ? OR p.address LIKE ?)`
      );
      const pattern = `%${searchTerm}%`;
      params.push(pattern, pattern, pattern, pattern, pattern);
    }

    // Transaction Type (Buy, Rent)
    if (transaction_type) {
      whereConditions.push('p.transaction_type = ?');
      params.push(transaction_type);
    }

    // Property Type (Apartment, Villa, Penthouse, etc.)
    if (property_type) {
      whereConditions.push('p.property_type = ?');
      params.push(property_type);
    }

    // Configuration (1 BHK, 2 BHK, etc.)
    if (configuration) {
      whereConditions.push('p.configuration = ?');
      params.push(configuration);
    }

    // Budget range
    if (min_price) {
      whereConditions.push('p.price >= ?');
      params.push(parseFloat(min_price));
    }
    if (max_price) {
      whereConditions.push('p.price <= ?');
      params.push(parseFloat(max_price));
    }

    // Location
    if (location_id) {
      whereConditions.push('p.location_id = ?');
      params.push(parseInt(location_id, 10));
    } else if (location_slug) {
      whereConditions.push('l.slug = ?');
      params.push(location_slug);
    } else if (locality) {
      whereConditions.push('(l.name LIKE ? OR l.slug LIKE ?)');
      const locPattern = `%${locality}%`;
      params.push(locPattern, locPattern);
    }

    // Area (Carpet sqft)
    if (min_area) {
      whereConditions.push('p.carpet_area >= ?');
      params.push(parseFloat(min_area));
    }
    if (max_area) {
      whereConditions.push('p.carpet_area <= ?');
      params.push(parseFloat(max_area));
    }

    // Possession Status
    if (possession_status) {
      whereConditions.push('p.possession_status = ?');
      params.push(possession_status);
    }

    // Availability
    if (availability_status) {
      whereConditions.push('p.availability_status = ?');
      params.push(availability_status);
    }

    // Featured
    if (is_featured !== undefined) {
      whereConditions.push('p.is_featured = ?');
      params.push(is_featured === 'true' || is_featured === '1' ? 1 : 0);
    }

    // Amenities filtering
    if (amenities) {
      const amenityList = amenities.split(',').map((a) => a.trim());
      for (const amen of amenityList) {
        whereConditions.push(`
          EXISTS (
            SELECT 1 FROM property_amenities pa
            JOIN amenities am ON pa.amenity_id = am.id
            WHERE pa.property_id = p.id AND (am.slug = ? OR am.name = ?)
          )
        `);
        params.push(amen, amen);
      }
    }

    const whereSql = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Count total matches
    const countSql = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM properties p
      LEFT JOIN locations l ON p.location_id = l.id
      LEFT JOIN developers d ON p.developer_id = d.id
      ${whereSql}
    `;
    const [countRows] = await query(countSql, params);
    const total = countRows[0]?.total || 0;

    // Sorting
    let orderClause = 'ORDER BY p.is_featured DESC, p.created_at DESC';
    if (sort === 'price_asc') {
      orderClause = 'ORDER BY p.price ASC';
    } else if (sort === 'price_desc') {
      orderClause = 'ORDER BY p.price DESC';
    } else if (sort === 'newest') {
      orderClause = 'ORDER BY p.created_at DESC';
    } else if (sort === 'area_asc') {
      orderClause = 'ORDER BY p.carpet_area ASC';
    } else if (sort === 'area_desc') {
      orderClause = 'ORDER BY p.carpet_area DESC';
    }

    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 100);
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (parsedPage - 1) * parsedLimit;

    const dataSql = `
      SELECT 
        p.id, p.title, p.slug, p.transaction_type, p.property_type,
        p.configuration, p.bedrooms, p.bathrooms, p.carpet_area, p.built_up_area,
        p.price, p.price_per_sqft, p.floor_number, p.total_floors,
        p.possession_status, p.possession_date, p.rera_number, p.parking_spaces,
        p.furnishing, p.availability_status, p.is_featured, p.is_published,
        p.address, p.is_demo, p.created_at,
        l.id as location_id, l.name as location_name, l.slug as location_slug, l.region as location_region,
        d.id as developer_id, d.name as developer_name, d.slug as developer_slug, d.logo_url as developer_logo,
        (
          SELECT image_url FROM property_images pi 
          WHERE pi.property_id = p.id 
          ORDER BY pi.is_primary DESC, pi.display_order ASC, pi.id ASC 
          LIMIT 1
        ) as primary_image
      FROM properties p
      LEFT JOIN locations l ON p.location_id = l.id
      LEFT JOIN developers d ON p.developer_id = d.id
      ${whereSql}
      ${orderClause}
      LIMIT ? OFFSET ?
    `;

    const [rows] = await query(dataSql, [...params, parsedLimit, offset]);

    res.json({
      success: true,
      properties: rows,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit),
      },
      filtersApplied: {
        searchTerm,
        transaction_type,
        property_type,
        configuration,
        location_slug,
        sort,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get single property by ID or slug with full details, images, amenities, and project timeline
 */
const getPropertyByIdOrSlug = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const isNumeric = /^\d+$/.test(idOrSlug);

    const whereClause = isNumeric ? 'p.id = ?' : 'p.slug = ?';
    const param = isNumeric ? parseInt(idOrSlug, 10) : idOrSlug;

    const [propRows] = await query(
      `SELECT 
        p.*,
        l.id as location_id, l.name as location_name, l.slug as location_slug, l.region as location_region, l.landmark as location_landmark,
        d.id as developer_id, d.name as developer_name, d.slug as developer_slug, d.logo_url as developer_logo, d.description as developer_description, d.website as developer_website, d.established_year as developer_est_year
       FROM properties p
       LEFT JOIN locations l ON p.location_id = l.id
       LEFT JOIN developers d ON p.developer_id = d.id
       WHERE ${whereClause}`,
      [param]
    );

    if (!propRows || propRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Property not found.',
      });
    }

    const property = propRows[0];

    // Fetch images
    const [images] = await query(
      `SELECT id, image_url, caption, category, is_primary, display_order 
       FROM property_images 
       WHERE property_id = ? 
       ORDER BY is_primary DESC, display_order ASC, id ASC`,
      [property.id]
    );

    // Fetch amenities
    const [amenities] = await query(
      `SELECT a.id, a.name, a.slug, a.category, a.icon
       FROM property_amenities pa
       JOIN amenities a ON pa.amenity_id = a.id
       WHERE pa.property_id = ?
       ORDER BY a.category ASC, a.name ASC`,
      [property.id]
    );

    // Fetch project status timeline
    const [timeline] = await query(
      `SELECT id, stage, completion_percentage, target_date, notes, created_at
       FROM project_status
       WHERE property_id = ?
       ORDER BY id DESC`,
      [property.id]
    );

    // Fetch similar properties in same location or price range
    const [similar] = await query(
      `SELECT 
        p.id, p.title, p.slug, p.configuration, p.carpet_area, p.price, p.transaction_type, p.availability_status,
        l.name as location_name, d.name as developer_name,
        (SELECT image_url FROM property_images pi WHERE pi.property_id = p.id ORDER BY is_primary DESC, display_order ASC LIMIT 1) as primary_image
       FROM properties p
       LEFT JOIN locations l ON p.location_id = l.id
       LEFT JOIN developers d ON p.developer_id = d.id
       WHERE p.id != ? AND (p.location_id = ? OR p.property_type = ?) AND p.is_published = 1
       LIMIT 3`,
      [property.id, property.location_id, property.property_type]
    );

    res.json({
      success: true,
      property: {
        ...property,
        images,
        amenities,
        project_timeline: timeline,
        similar_properties: similar,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * (Admin) Create a new property
 */
const createProperty = async (req, res, next) => {
  try {
    const {
      title,
      developer_id,
      location_id,
      transaction_type = 'Buy',
      property_type = 'Apartment',
      configuration = '2 BHK',
      bedrooms = 2,
      bathrooms = 2,
      carpet_area,
      built_up_area,
      price,
      floor_number = 1,
      total_floors = 20,
      possession_status = 'Ready to Move',
      possession_date,
      rera_number = 'Not provided',
      parking_spaces = 1,
      furnishing = 'Semi-Furnished',
      availability_status = 'Available',
      is_featured = 0,
      is_published = 1,
      address,
      overview,
      highlights,
      specifications,
      connectivity,
      nearby_landmarks,
      investment_considerations,
      brochure_url,
      images = [],
      amenity_ids = [],
    } = req.body;

    if (!title || !location_id || !carpet_area || !price || !address) {
      return res.status(400).json({
        success: false,
        message: 'Title, location, carpet area, price, and address are required.',
      });
    }

    const slug = slugify(`${title}-${Date.now().toString().slice(-4)}`);
    const priceSqft = carpet_area > 0 ? (price / carpet_area).toFixed(2) : 0;

    const [result] = await query(
      `INSERT INTO properties (
        title, slug, developer_id, location_id, transaction_type, property_type,
        configuration, bedrooms, bathrooms, carpet_area, built_up_area, price, price_per_sqft,
        floor_number, total_floors, possession_status, possession_date, rera_number,
        parking_spaces, furnishing, availability_status, is_featured, is_published,
        address, overview, highlights, specifications, connectivity, nearby_landmarks,
        investment_considerations, brochure_url, is_demo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        title,
        slug,
        developer_id || null,
        location_id,
        transaction_type,
        property_type,
        configuration,
        bedrooms,
        bathrooms,
        carpet_area,
        built_up_area || null,
        price,
        priceSqft,
        floor_number,
        total_floors,
        possession_status,
        possession_date || null,
        rera_number || 'Not provided',
        parking_spaces,
        furnishing,
        availability_status,
        is_featured ? 1 : 0,
        is_published ? 1 : 0,
        address,
        overview || null,
        highlights || null,
        specifications || null,
        connectivity || null,
        nearby_landmarks || null,
        investment_considerations || null,
        brochure_url || null,
      ]
    );

    const propertyId = result.insertId;

    // Insert images if provided
    if (Array.isArray(images) && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        await query(
          `INSERT INTO property_images (property_id, image_url, caption, category, is_primary, display_order)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            propertyId,
            typeof img === 'string' ? img : img.image_url,
            img.caption || null,
            img.category || 'exterior',
            i === 0 || img.is_primary ? 1 : 0,
            i + 1,
          ]
        );
      }
    }

    // Insert amenities mapping
    if (Array.isArray(amenity_ids) && amenity_ids.length > 0) {
      for (const aId of amenity_ids) {
        await query(
          `INSERT IGNORE INTO property_amenities (property_id, amenity_id) VALUES (?, ?)`,
          [propertyId, aId]
        );
      }
    }

    // Update location property count
    await query(
      `UPDATE locations 
       SET property_count = (SELECT COUNT(*) FROM properties WHERE location_id = ? AND is_published = 1)
       WHERE id = ?`,
      [location_id, location_id]
    );

    res.status(201).json({
      success: true,
      message: 'Property created successfully.',
      propertyId,
      slug,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * (Admin) Update an existing property
 */
const updateProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      developer_id,
      location_id,
      transaction_type,
      property_type,
      configuration,
      bedrooms,
      bathrooms,
      carpet_area,
      built_up_area,
      price,
      floor_number,
      total_floors,
      possession_status,
      possession_date,
      rera_number,
      parking_spaces,
      furnishing,
      availability_status,
      is_featured,
      is_published,
      address,
      overview,
      highlights,
      specifications,
      connectivity,
      nearby_landmarks,
      investment_considerations,
      brochure_url,
      images,
      amenity_ids,
    } = req.body;

    const [existing] = await query('SELECT id, location_id FROM properties WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    const priceSqft =
      carpet_area && price ? (price / carpet_area).toFixed(2) : undefined;

    await query(
      `UPDATE properties
       SET title = COALESCE(?, title),
           developer_id = COALESCE(?, developer_id),
           location_id = COALESCE(?, location_id),
           transaction_type = COALESCE(?, transaction_type),
           property_type = COALESCE(?, property_type),
           configuration = COALESCE(?, configuration),
           bedrooms = COALESCE(?, bedrooms),
           bathrooms = COALESCE(?, bathrooms),
           carpet_area = COALESCE(?, carpet_area),
           built_up_area = COALESCE(?, built_up_area),
           price = COALESCE(?, price),
           price_per_sqft = COALESCE(?, price_per_sqft),
           floor_number = COALESCE(?, floor_number),
           total_floors = COALESCE(?, total_floors),
           possession_status = COALESCE(?, possession_status),
           possession_date = COALESCE(?, possession_date),
           rera_number = COALESCE(?, rera_number),
           parking_spaces = COALESCE(?, parking_spaces),
           furnishing = COALESCE(?, furnishing),
           availability_status = COALESCE(?, availability_status),
           is_featured = COALESCE(?, is_featured),
           is_published = COALESCE(?, is_published),
           address = COALESCE(?, address),
           overview = COALESCE(?, overview),
           highlights = COALESCE(?, highlights),
           specifications = COALESCE(?, specifications),
           connectivity = COALESCE(?, connectivity),
           nearby_landmarks = COALESCE(?, nearby_landmarks),
           investment_considerations = COALESCE(?, investment_considerations),
           brochure_url = COALESCE(?, brochure_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        title || null,
        developer_id || null,
        location_id || null,
        transaction_type || null,
        property_type || null,
        configuration || null,
        bedrooms !== undefined ? bedrooms : null,
        bathrooms !== undefined ? bathrooms : null,
        carpet_area !== undefined ? carpet_area : null,
        built_up_area !== undefined ? built_up_area : null,
        price !== undefined ? price : null,
        priceSqft !== undefined ? priceSqft : null,
        floor_number !== undefined ? floor_number : null,
        total_floors !== undefined ? total_floors : null,
        possession_status || null,
        possession_date || null,
        rera_number || null,
        parking_spaces !== undefined ? parking_spaces : null,
        furnishing || null,
        availability_status || null,
        is_featured !== undefined ? (is_featured ? 1 : 0) : null,
        is_published !== undefined ? (is_published ? 1 : 0) : null,
        address || null,
        overview || null,
        highlights || null,
        specifications || null,
        connectivity || null,
        nearby_landmarks || null,
        investment_considerations || null,
        brochure_url || null,
        id,
      ]
    );

    // Update images if provided
    if (Array.isArray(images)) {
      await query('DELETE FROM property_images WHERE property_id = ?', [id]);
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        await query(
          `INSERT INTO property_images (property_id, image_url, caption, category, is_primary, display_order)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            id,
            typeof img === 'string' ? img : img.image_url,
            img.caption || null,
            img.category || 'exterior',
            i === 0 || img.is_primary ? 1 : 0,
            i + 1,
          ]
        );
      }
    }

    // Update amenities if provided
    if (Array.isArray(amenity_ids)) {
      await query('DELETE FROM property_amenities WHERE property_id = ?', [id]);
      for (const aId of amenity_ids) {
        await query('INSERT INTO property_amenities (property_id, amenity_id) VALUES (?, ?)', [id, aId]);
      }
    }

    res.json({
      success: true,
      message: 'Property updated successfully.',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * (Admin) Delete a property
 */
const deleteProperty = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existing] = await query('SELECT id, location_id FROM properties WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    const locationId = existing[0].location_id;

    // Delete property (cascades to images, amenities, favourites, etc.)
    await query('DELETE FROM properties WHERE id = ?', [id]);

    // Recalculate location count
    if (locationId) {
      await query(
        `UPDATE locations 
         SET property_count = (SELECT COUNT(*) FROM properties WHERE location_id = ? AND is_published = 1)
         WHERE id = ?`,
        [locationId, locationId]
      );
    }

    res.json({
      success: true,
      message: 'Property deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProperties,
  getPropertyByIdOrSlug,
  createProperty,
  updateProperty,
  deleteProperty,
};
