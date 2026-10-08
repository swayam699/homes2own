-- ============================================================================
-- HOMES2OWN — Database Schema (MySQL 8.0+)
-- Production-style Real Estate Consultancy & Property Management Platform
-- Primary Market: Mumbai, Maharashtra, India
-- ============================================================================

DROP DATABASE IF EXISTS homes2own_db;
CREATE DATABASE homes2own_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE homes2own_db;

-- ----------------------------------------------------------------------------
-- 1. USERS & ROLES
-- Roles: 'customer', 'consultant', 'admin'
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    role ENUM('customer', 'consultant', 'admin') NOT NULL DEFAULT 'customer',
    avatar_url VARCHAR(500),
    preferred_locations TEXT,
    preferred_configurations TEXT,
    min_budget DECIMAL(14, 2),
    max_budget DECIMAL(14, 2),
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_role (role),
    INDEX idx_user_email (email)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 2. DEVELOPERS / BUILDERS
-- Top Mumbai real estate developers with verified or demonstration status
-- ----------------------------------------------------------------------------
CREATE TABLE developers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(191) NOT NULL UNIQUE,
    logo_url VARCHAR(500),
    description TEXT,
    website VARCHAR(255),
    contact_email VARCHAR(191),
    contact_phone VARCHAR(50),
    established_year INT,
    is_verified TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_developer_slug (slug)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 3. MUMBAI LOCATIONS & LOCALITIES
-- Key residential & commercial hubs in Mumbai
-- ----------------------------------------------------------------------------
CREATE TABLE locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    region VARCHAR(100) NOT NULL,
    overview TEXT,
    landmark VARCHAR(255),
    avg_price_sqft DECIMAL(10, 2) DEFAULT 0.00,
    property_count INT NOT NULL DEFAULT 0,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_location_slug (slug),
    INDEX idx_location_region (region)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 4. PROPERTIES
-- Core property listings across residential, commercial, resale, and rentals
-- ----------------------------------------------------------------------------
CREATE TABLE properties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    developer_id INT,
    location_id INT NOT NULL,
    transaction_type ENUM('Buy', 'Rent') NOT NULL DEFAULT 'Buy',
    property_type ENUM('Apartment', 'Villa', 'Penthouse', 'Office', 'Shop', 'Commercial', 'Plot') NOT NULL DEFAULT 'Apartment',
    configuration ENUM('Studio', '1 BHK', '2 BHK', '3 BHK', '4 BHK', '5 BHK+') NOT NULL DEFAULT '2 BHK',
    bedrooms INT DEFAULT 2,
    bathrooms INT DEFAULT 2,
    carpet_area DECIMAL(10, 2) NOT NULL,
    built_up_area DECIMAL(10, 2),
    price DECIMAL(14, 2) NOT NULL,
    price_per_sqft DECIMAL(12, 2) GENERATED ALWAYS AS (
        CASE WHEN carpet_area > 0 THEN ROUND(price / carpet_area, 2) ELSE 0.00 END
    ) STORED,
    floor_number INT DEFAULT 1,
    total_floors INT DEFAULT 20,
    possession_status ENUM('Ready to Move', 'Under Construction', 'Upcoming') NOT NULL DEFAULT 'Ready to Move',
    possession_date VARCHAR(100),
    rera_number VARCHAR(100) DEFAULT 'Not provided',
    parking_spaces INT DEFAULT 1,
    furnishing ENUM('Unfurnished', 'Semi-Furnished', 'Fully Furnished') NOT NULL DEFAULT 'Semi-Furnished',
    availability_status ENUM('Available', 'Limited Availability', 'Sold', 'Rented', 'Coming Soon') NOT NULL DEFAULT 'Available',
    is_featured TINYINT(1) NOT NULL DEFAULT 0,
    is_published TINYINT(1) NOT NULL DEFAULT 1,
    address TEXT NOT NULL,
    overview TEXT,
    highlights TEXT,
    specifications TEXT,
    connectivity TEXT,
    nearby_landmarks TEXT,
    investment_considerations TEXT,
    brochure_url VARCHAR(500),
    is_demo TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_property_developer FOREIGN KEY (developer_id) REFERENCES developers(id) ON DELETE SET NULL,
    CONSTRAINT fk_property_location FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
    INDEX idx_prop_type_trans (property_type, transaction_type),
    INDEX idx_prop_config (configuration),
    INDEX idx_prop_price (price),
    INDEX idx_prop_status (availability_status),
    INDEX idx_prop_featured (is_featured),
    INDEX idx_prop_published (is_published)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 5. PROPERTY IMAGES & FLOOR PLANS
-- Categorized architectural photography
-- ----------------------------------------------------------------------------
CREATE TABLE property_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    caption VARCHAR(255),
    category ENUM('exterior', 'interior', 'amenity', 'floor_plan') NOT NULL DEFAULT 'exterior',
    is_primary TINYINT(1) NOT NULL DEFAULT 0,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_image_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    INDEX idx_img_property (property_id, is_primary)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 6. AMENITIES
-- Standardized high-end residential & commercial amenities
-- ----------------------------------------------------------------------------
CREATE TABLE amenities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    category VARCHAR(100) DEFAULT 'General',
    icon VARCHAR(60) DEFAULT 'CheckCircle',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 7. PROPERTY AMENITIES (M:N junction)
-- ----------------------------------------------------------------------------
CREATE TABLE property_amenities (
    property_id INT NOT NULL,
    amenity_id INT NOT NULL,
    PRIMARY KEY (property_id, amenity_id),
    CONSTRAINT fk_pa_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    CONSTRAINT fk_pa_amenity FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 8. CUSTOMER FAVOURITES
-- Persisted wishlist in MySQL
-- ----------------------------------------------------------------------------
CREATE TABLE favourites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    property_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_fav (user_id, property_id),
    CONSTRAINT fk_fav_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_fav_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 9. PROPERTY COMPARISONS
-- Persisted comparison queue (max 3 per customer)
-- ----------------------------------------------------------------------------
CREATE TABLE property_comparisons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    property_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_comp (user_id, property_id),
    CONSTRAINT fk_comp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_comp_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 10. ENQUIRIES
-- General property enquiry submissions
-- ----------------------------------------------------------------------------
CREATE TABLE enquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    property_id INT,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(191) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    preferred_contact_method ENUM('phone', 'whatsapp', 'email') NOT NULL DEFAULT 'phone',
    message TEXT NOT NULL,
    status ENUM('new', 'contacted', 'qualified', 'converted', 'closed') NOT NULL DEFAULT 'new',
    assigned_consultant_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_enq_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_enq_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL,
    CONSTRAINT fk_enq_consultant FOREIGN KEY (assigned_consultant_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_enq_status (status),
    INDEX idx_enq_created (created_at)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 11. SITE VISITS
-- Scheduled in-person or virtual property tours
-- ----------------------------------------------------------------------------
CREATE TABLE site_visits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    property_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(191) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    preferred_date DATE NOT NULL,
    preferred_time VARCHAR(50) NOT NULL,
    visitor_count INT NOT NULL DEFAULT 1,
    notes TEXT,
    status ENUM('Requested', 'Approved', 'Rescheduled', 'Rejected', 'Completed') NOT NULL DEFAULT 'Requested',
    consultant_id INT,
    consultant_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_sv_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_sv_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    CONSTRAINT fk_sv_consultant FOREIGN KEY (consultant_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_sv_status (status),
    INDEX idx_sv_date (preferred_date)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 12. CALLBACK REQUESTS
-- Urgent advisory callback requests
-- ----------------------------------------------------------------------------
CREATE TABLE callbacks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    property_id INT,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    preferred_time VARCHAR(100),
    message TEXT,
    status ENUM('Pending', 'Assigned', 'Contacted', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending',
    consultant_id INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_cb_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_cb_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL,
    CONSTRAINT fk_cb_consultant FOREIGN KEY (consultant_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_cb_status (status)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 13. CRM LEADS
-- Pipeline management for consultants & admin
-- ----------------------------------------------------------------------------
CREATE TABLE leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(191),
    phone VARCHAR(30) NOT NULL,
    property_id INT,
    source ENUM('enquiry', 'site_visit', 'callback', 'direct', 'referral') NOT NULL DEFAULT 'enquiry',
    status ENUM('New', 'Contacted', 'Qualified', 'Site Visit Scheduled', 'Site Visit Completed', 'Negotiation', 'Converted', 'Lost') NOT NULL DEFAULT 'New',
    deal_value DECIMAL(14, 2) DEFAULT 0.00,
    assigned_consultant_id INT,
    last_follow_up TIMESTAMP NULL,
    next_follow_up TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_lead_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_lead_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL,
    CONSTRAINT fk_lead_consultant FOREIGN KEY (assigned_consultant_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_lead_status (status),
    INDEX idx_lead_consultant (assigned_consultant_id)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 14. LEAD NOTES & TIMELINE
-- Internal consultation log notes
-- ----------------------------------------------------------------------------
CREATE TABLE lead_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lead_id INT NOT NULL,
    author_id INT NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ln_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    CONSTRAINT fk_ln_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 15. FOLLOW-UPS
-- Scheduled consultant tasks and interactions
-- ----------------------------------------------------------------------------
CREATE TABLE follow_ups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lead_id INT NOT NULL,
    consultant_id INT NOT NULL,
    scheduled_at DATETIME NOT NULL,
    follow_up_type ENUM('call', 'meeting', 'site_visit', 'whatsapp', 'email') NOT NULL DEFAULT 'call',
    notes TEXT,
    status ENUM('scheduled', 'completed', 'missed', 'cancelled') NOT NULL DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_fu_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    CONSTRAINT fk_fu_consultant FOREIGN KEY (consultant_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 16. PROJECT STATUS TIMELINE
-- Tracks real development progression
-- Stages: Upcoming -> Launching Soon -> Launched -> Under Construction -> Possession -> Ready to Move
-- ----------------------------------------------------------------------------
CREATE TABLE project_status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    stage ENUM('Upcoming', 'Launching Soon', 'Launched', 'Under Construction', 'Possession', 'Ready to Move') NOT NULL DEFAULT 'Under Construction',
    completion_percentage INT DEFAULT 0,
    target_date VARCHAR(100),
    notes TEXT,
    updated_by_user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ps_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    CONSTRAINT fk_ps_user FOREIGN KEY (updated_by_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 17. AUDIT LOGS
-- Sensitive administrative and CRM actions log
-- ----------------------------------------------------------------------------
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id INT,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_created (created_at)
) ENGINE=InnoDB;
