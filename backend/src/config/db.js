const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

let pool = null;
let sqliteDb = null;
let currentClient = 'uninitialized';

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'homes2own_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

/**
 * Bootstrap SQLite schema and seed records for HOMES2OWN
 */
const bootstrapSqliteTables = (db) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 1. Users
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          phone TEXT,
          role TEXT NOT NULL DEFAULT 'customer',
          avatar_url TEXT,
          preferred_locations TEXT,
          preferred_configurations TEXT,
          min_budget REAL,
          max_budget REAL,
          is_active INTEGER NOT NULL DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 2. Developers
      db.run(`
        CREATE TABLE IF NOT EXISTS developers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          slug TEXT NOT NULL UNIQUE,
          logo_url TEXT,
          description TEXT,
          website TEXT,
          contact_email TEXT,
          contact_phone TEXT,
          established_year INTEGER,
          is_verified INTEGER NOT NULL DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 3. Locations
      db.run(`
        CREATE TABLE IF NOT EXISTS locations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          slug TEXT NOT NULL UNIQUE,
          region TEXT NOT NULL,
          overview TEXT,
          landmark TEXT,
          avg_price_sqft REAL DEFAULT 0.00,
          property_count INTEGER NOT NULL DEFAULT 0,
          image_url TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 4. Properties
      db.run(`
        CREATE TABLE IF NOT EXISTS properties (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          slug TEXT NOT NULL UNIQUE,
          developer_id INTEGER,
          location_id INTEGER NOT NULL,
          transaction_type TEXT NOT NULL DEFAULT 'Buy',
          property_type TEXT NOT NULL DEFAULT 'Apartment',
          configuration TEXT NOT NULL DEFAULT '2 BHK',
          bedrooms INTEGER DEFAULT 2,
          bathrooms INTEGER DEFAULT 2,
          carpet_area REAL NOT NULL,
          built_up_area REAL,
          price REAL NOT NULL,
          price_per_sqft REAL,
          floor_number INTEGER DEFAULT 1,
          total_floors INTEGER DEFAULT 20,
          possession_status TEXT NOT NULL DEFAULT 'Ready to Move',
          possession_date TEXT,
          rera_number TEXT DEFAULT 'Not provided',
          parking_spaces INTEGER DEFAULT 1,
          furnishing TEXT NOT NULL DEFAULT 'Semi-Furnished',
          availability_status TEXT NOT NULL DEFAULT 'Available',
          is_featured INTEGER NOT NULL DEFAULT 0,
          is_published INTEGER NOT NULL DEFAULT 1,
          address TEXT NOT NULL,
          overview TEXT,
          highlights TEXT,
          specifications TEXT,
          connectivity TEXT,
          nearby_landmarks TEXT,
          investment_considerations TEXT,
          brochure_url TEXT,
          is_demo INTEGER NOT NULL DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (developer_id) REFERENCES developers(id) ON DELETE SET NULL,
          FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
        );
      `);

      // 5. Property Images
      db.run(`
        CREATE TABLE IF NOT EXISTS property_images (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          property_id INTEGER NOT NULL,
          image_url TEXT NOT NULL,
          caption TEXT,
          category TEXT NOT NULL DEFAULT 'exterior',
          is_primary INTEGER NOT NULL DEFAULT 0,
          display_order INTEGER NOT NULL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
        );
      `);

      // 6. Amenities
      db.run(`
        CREATE TABLE IF NOT EXISTS amenities (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          slug TEXT NOT NULL UNIQUE,
          category TEXT DEFAULT 'General',
          icon TEXT DEFAULT 'CheckCircle',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 7. Property Amenities
      db.run(`
        CREATE TABLE IF NOT EXISTS property_amenities (
          property_id INTEGER NOT NULL,
          amenity_id INTEGER NOT NULL,
          PRIMARY KEY (property_id, amenity_id),
          FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
          FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
        );
      `);

      // 8. Favourites
      db.run(`
        CREATE TABLE IF NOT EXISTS favourites (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          property_id INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, property_id),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
        );
      `);

      // 9. Comparisons
      db.run(`
        CREATE TABLE IF NOT EXISTS property_comparisons (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          property_id INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, property_id),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
        );
      `);

      // 10. Enquiries
      db.run(`
        CREATE TABLE IF NOT EXISTS enquiries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          property_id INTEGER,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          preferred_contact_method TEXT NOT NULL DEFAULT 'phone',
          message TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'new',
          assigned_consultant_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
          FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL,
          FOREIGN KEY (assigned_consultant_id) REFERENCES users(id) ON DELETE SET NULL
        );
      `);

      // 11. Site Visits
      db.run(`
        CREATE TABLE IF NOT EXISTS site_visits (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          property_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          preferred_date TEXT NOT NULL,
          preferred_time TEXT NOT NULL,
          visitor_count INTEGER NOT NULL DEFAULT 1,
          notes TEXT,
          status TEXT NOT NULL DEFAULT 'Requested',
          consultant_id INTEGER,
          consultant_notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
          FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
          FOREIGN KEY (consultant_id) REFERENCES users(id) ON DELETE SET NULL
        );
      `);

      // 12. Callbacks
      db.run(`
        CREATE TABLE IF NOT EXISTS callbacks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          property_id INTEGER,
          name TEXT NOT NULL,
          phone TEXT NOT NULL,
          preferred_time TEXT,
          message TEXT,
          status TEXT NOT NULL DEFAULT 'Pending',
          consultant_id INTEGER,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
          FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL,
          FOREIGN KEY (consultant_id) REFERENCES users(id) ON DELETE SET NULL
        );
      `);

      // 13. Leads
      db.run(`
        CREATE TABLE IF NOT EXISTS leads (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customer_id INTEGER,
          name TEXT NOT NULL,
          email TEXT,
          phone TEXT NOT NULL,
          property_id INTEGER,
          source TEXT NOT NULL DEFAULT 'enquiry',
          status TEXT NOT NULL DEFAULT 'New',
          deal_value REAL DEFAULT 0.00,
          assigned_consultant_id INTEGER,
          last_follow_up DATETIME,
          next_follow_up DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL,
          FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL,
          FOREIGN KEY (assigned_consultant_id) REFERENCES users(id) ON DELETE SET NULL
        );
      `);

      // 14. Lead Notes
      db.run(`
        CREATE TABLE IF NOT EXISTS lead_notes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          lead_id INTEGER NOT NULL,
          author_id INTEGER NOT NULL,
          note TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
          FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `);

      // 15. Follow-ups
      db.run(`
        CREATE TABLE IF NOT EXISTS follow_ups (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          lead_id INTEGER NOT NULL,
          consultant_id INTEGER NOT NULL,
          scheduled_at DATETIME NOT NULL,
          follow_up_type TEXT NOT NULL DEFAULT 'call',
          notes TEXT,
          status TEXT NOT NULL DEFAULT 'scheduled',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
          FOREIGN KEY (consultant_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `);

      // 16. Project Status
      db.run(`
        CREATE TABLE IF NOT EXISTS project_status (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          property_id INTEGER NOT NULL,
          stage TEXT NOT NULL DEFAULT 'Under Construction',
          completion_percentage INTEGER DEFAULT 0,
          target_date TEXT,
          notes TEXT,
          updated_by_user_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
          FOREIGN KEY (updated_by_user_id) REFERENCES users(id) ON DELETE SET NULL
        );
      `);

      // 17. Audit Logs
      db.run(`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          action TEXT NOT NULL,
          entity_type TEXT NOT NULL,
          entity_id INTEGER,
          details TEXT,
          ip_address TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        );
      `);

      // Seed baseline data
      const pwd = '$2a$10$bwxZtNLOge/fssZNsMOjKeozjEcamgJ.i4W5feiwdlGot5jXKUsUq'; // Password123!

      // Seed Users
      db.run(`INSERT OR IGNORE INTO users (id, name, email, password_hash, phone, role, avatar_url, preferred_locations, preferred_configurations, min_budget, max_budget) VALUES
        (1, 'HOMES2OWN Principal Admin', 'admin@example.com', '${pwd}', '+91 98200 99001', 'admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', 'Bandra West, Worli, BKC', '3 BHK, 4 BHK', 30000000, 150000000),
        (2, 'Kabir Varma', 'consultant@example.com', '${pwd}', '+91 98201 55443', 'consultant', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', 'Worli, Lower Parel, Bandra West', '2 BHK, 3 BHK, 4 BHK', 20000000, 100000000),
        (3, 'Rohan Singhania', 'customer@example.com', '${pwd}', '+91 98190 22334', 'customer', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', 'Bandra West, Juhu, Worli', '3 BHK, 4 BHK', 40000000, 95000000),
        (4, 'Priya Sharma', 'priya.sharma@example.com', '${pwd}', '+91 98330 44556', 'customer', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80', 'Powai, Andheri East, Lower Parel', '2 BHK, 3 BHK', 18000000, 45000000),
        (5, 'Ananya Deshmukh', 'ananya.consultant@example.com', '${pwd}', '+91 98202 88990', 'consultant', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80', 'South Mumbai, Colaba, Malabar Hill', '4 BHK, Penthouse', 60000000, 250000000);
      `);

      // Seed Developers
      db.run(`INSERT OR IGNORE INTO developers (id, name, slug, logo_url, description, website, contact_email, contact_phone, established_year, is_verified) VALUES
        (1, 'Godrej Properties', 'godrej-properties', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=300&q=80', 'Renowned for sustainable architecture and thoughtful urban design across Mumbai.', 'https://www.godrejproperties.com', 'mumbai@godrejproperties.com', '+91 22 6169 8500', 1990, 1),
        (2, 'Lodha', 'lodha', 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f9?auto=format&fit=crop&w=300&q=80', 'India’s premier real estate developer renowned for landmark skyscrapers and luxury estates.', 'https://www.lodhagroup.com', 'enquiries@lodhagroup.com', '+91 22 6133 4400', 1980, 1),
        (3, 'Oberoi Realty', 'oberoi-realty', 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=300&q=80', 'Synonymous with contemporary aesthetics, precision engineering, and prime locations.', 'https://www.oberoirealty.com', 'contact@oberoirealty.com', '+91 22 6677 3333', 1998, 1),
        (4, 'Prestige Group', 'prestige-group', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=300&q=80', 'Decades of luxury residential developments and commercial landmark towers.', 'https://www.prestigeconstructions.com', 'mumbai@prestigeconstructions.com', '+91 22 2650 1100', 1986, 1),
        (5, 'Adani Realty', 'adani-realty', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=300&q=80', 'Developing iconic Mumbai skyline landmarks blending luxury, landscaped greens, and connectivity.', 'https://www.adanirealty.com', 'info@adanirealty.com', '+91 22 2555 7700', 2010, 1),
        (6, 'Rustomjee', 'rustomjee', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=300&q=80', 'Pioneering design-led luxury residences with deep emphasis on community living and wellness.', 'https://www.rustomjee.com', 'connect@rustomjee.com', '+91 22 6676 6888', 1996, 1),
        (7, 'Kalpataru', 'kalpataru', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=300&q=80', 'Trusted Mumbai builder delivering state-of-the-art residences and modern towers.', 'https://www.kalpataru.com', 'sales@kalpataru.com', '+91 22 6120 7000', 1969, 1),
        (8, 'Mahindra Lifespaces', 'mahindra-lifespaces', 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=300&q=80', 'Pioneers of green homes and sustainable residential ecosystems in Mumbai.', 'https://www.mahindralifespaces.com', 'homes@mahindralifespaces.com', '+91 22 6747 8600', 1994, 1);
      `);

      // Seed Locations
      db.run(`INSERT OR IGNORE INTO locations (id, name, slug, region, overview, landmark, avg_price_sqft, property_count, image_url) VALUES
        (1, 'Bandra West', 'bandra-west', 'Western Suburbs', 'The cultural and lifestyle capital of Mumbai, famed for heritage sea-facing promenades, cafes, and luxury residences.', 'Bandstand & Carter Road', 58000.00, 12, 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80'),
        (2, 'Bandra East', 'bandra-east', 'Western Suburbs', 'Strategic corporate-residential gateway bordering BKC with rapid connectivity to the airport.', 'Kalanagar & Western Express Highway', 36000.00, 6, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'),
        (3, 'Bandra Reclamation', 'bandra-reclamation', 'Western Suburbs', 'Pristine coastal enclave offering unobstructed views of Bandra-Worli Sea Link and sunsets.', 'Bandra-Worli Sea Link Promenade', 62000.00, 4, 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80'),
        (4, 'Khar West', 'khar-west', 'Western Suburbs', 'Exclusive, leafy neighborhood known for quiet residential avenues and intimate proximity to Bandra.', '14th Road & Khar Gymkhana', 52000.00, 5, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'),
        (5, 'Santacruz West', 'santacruz-west', 'Western Suburbs', 'Charming affluent enclave featuring tree-lined streets and boutique residential towers.', 'Tagore Road & Willingdon Catholic Gymkhana', 44000.00, 5, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'),
        (6, 'Juhu', 'juhu', 'Western Suburbs', 'Mumbai’s storied beachfront enclave synonymous with expansive estates and seaside tranquility.', 'Juhu Beach & JW Marriott', 65000.00, 8, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'),
        (7, 'Andheri West', 'andheri-west', 'Western Suburbs', 'High-energy cultural and entertainment hub with exceptional metro connectivity and premier schools.', 'Lokhandwala Complex & Infinity Mall', 32000.00, 9, 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'),
        (8, 'Andheri East', 'andheri-east', 'Western Suburbs', 'Commercial powerhouse hosting corporate headquarters, MIDC tech hubs, and international airport.', 'Chakala Metro & SEEPZ', 24000.00, 7, 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'),
        (9, 'Powai', 'powai', 'Central Suburbs', 'Cosmopolitan lakefront township blending European neoclassical architecture, tech parks, and greens.', 'Powai Lake & Hiranandani Gardens', 28000.00, 9, 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80'),
        (10, 'Lower Parel', 'lower-parel', 'South Central Mumbai', 'The epicenter of Mumbai high-finance and luxury lifestyle with premier skyscraper residences.', 'High Street Phoenix & One World Center', 48000.00, 11, 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80'),
        (11, 'Worli', 'worli', 'South Central Mumbai', 'Mumbai’s billionaire row along the Arabian Sea, boasting landmark towers and Coastal Road connectivity.', 'Worli Sea Face & Coastal Road', 62000.00, 14, 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f9?auto=format&fit=crop&w=800&q=80'),
        (12, 'Prabhadevi', 'prabhadevi', 'South Central Mumbai', 'Serene coastal neighbourhood home to Siddhivinayak Temple and sea-facing highrises.', 'Siddhivinayak Temple & Kirti College', 54000.00, 6, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'),
        (13, 'Dadar', 'dadar', 'Central Mumbai', 'Historic cultural heart of Mumbai with unmatched railway transit and green heritage grounds.', 'Shivaji Park & Portuguese Church', 38000.00, 5, 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80'),
        (14, 'Chembur', 'chembur', 'Eastern Suburbs', 'Green leafy Eastern suburb with golf club and rapid Eastern Freeway access to South Mumbai.', 'Bombay Presidency Golf Club', 25000.00, 6, 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80'),
        (15, 'BKC', 'bkc', 'Central Mumbai', 'Mumbai’s prime international financial center hosting corporate HQs and Jio World Centre.', 'Jio World Convention Centre & Diamond Bourse', 42000.00, 8, 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'),
        (16, 'Colaba', 'colaba', 'South Mumbai', 'Historic colonial crown of South Mumbai, featuring Victorian architecture and Arabian Sea views.', 'Gateway of India & Colaba Causeway', 68000.00, 5, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'),
        (17, 'Marine Drive', 'marine-drive', 'South Mumbai', 'Legendary Queen’s Necklace curve, world-famous for heritage Art Deco mansions and seaside vistas.', 'Nariman Point & Wankhede Stadium', 78000.00, 4, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'),
        (18, 'Malabar Hill', 'malabar-hill', 'South Mumbai', 'The most prestigious residential address in India, hosting quiet canopy avenues and bay views.', 'Hanging Gardens & Raj Bhavan', 95000.00, 3, 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80'),
        (19, 'Mahalaxmi', 'mahalaxmi', 'South Mumbai', 'Historic district framing panoramic racecourse greens and luxury residential skyrises.', 'Mahalaxmi Race Course & Willingdon Club', 56000.00, 6, 'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=800&q=80'),
        (20, 'Tardeo', 'tardeo', 'South Mumbai', 'Prime South Mumbai locality featuring ultra-luxury towers and proximity to Breach Candy.', 'Imperial Towers & AC Market', 64000.00, 5, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80');
      `);

      // Seed Amenities
      db.run(`INSERT OR IGNORE INTO amenities (id, name, slug, category, icon) VALUES
        (1, 'Swimming Pool', 'swimming-pool', 'Fitness & Wellness', 'Waves'),
        (2, 'Gymnasium', 'gymnasium', 'Fitness & Wellness', 'Dumbbell'),
        (3, 'Clubhouse', 'clubhouse', 'Leisure & Community', 'Home'),
        (4, 'Reserved Parking', 'reserved-parking', 'Security & Convenience', 'Car'),
        (5, 'Arabian Sea View', 'sea-view', 'Outdoor & Nature', 'Compass'),
        (6, '24/7 Security & CCTV', 'security-cctv', 'Security & Convenience', 'ShieldCheck'),
        (7, 'Landscaped Gardens', 'landscaped-gardens', 'Outdoor & Nature', 'Trees'),
        (8, 'Children Play Area', 'children-play-area', 'Leisure & Community', 'Smile'),
        (9, 'Sports Facilities & Tennis', 'sports-facilities', 'Fitness & Wellness', 'Trophy'),
        (10, 'High-Speed Elevators', 'high-speed-elevators', 'Security & Convenience', 'ArrowUpCircle'),
        (11, 'Power Backup', 'power-backup', 'Security & Convenience', 'Zap'),
        (12, 'Spa & Jacuzzi', 'spa-jacuzzi', 'Fitness & Wellness', 'Sparkles'),
        (13, 'Concierge Desk', 'concierge-desk', 'Security & Convenience', 'UserCheck'),
        (14, 'EV Charging Station', 'ev-charging-station', 'Security & Convenience', 'BatteryCharging');
      `);

      // Seed Properties
      db.run(`INSERT OR IGNORE INTO properties (
        id, title, slug, developer_id, location_id, transaction_type, property_type,
        configuration, bedrooms, bathrooms, carpet_area, built_up_area, price, price_per_sqft,
        floor_number, total_floors, possession_status, possession_date, rera_number,
        parking_spaces, furnishing, availability_status, is_featured, is_published,
        address, overview, highlights, specifications, connectivity, nearby_landmarks,
        investment_considerations, brochure_url, is_demo
      ) VALUES
        (1, 'Bandra Sea Front Residences', 'bandra-sea-front-residences', 2, 1, 'Buy', 'Apartment', '4 BHK', 4, 5, 2850.00, 3560.00, 185000000.00, 64912.28, 18, 32, 'Ready to Move', 'Ready for Immediate Fit-out', 'P51800001892', 3, 'Semi-Furnished', 'Available', 1, 1, 'Plot 42, Carter Road Promenade, Bandra West, Mumbai 400050', 'An exemplary coastal sanctuary on Carter Road commanding panoramic 180-degree unobstructed Arabian Sea horizons. Designed for high-net-worth families seeking absolute privacy, soaring ceiling clearances, and refined bespoke craftsmanship.', 'Direct waterfront promenade access\nPrivate passenger elevator foyer\nItalian marble floor finishes throughout', 'VRV central climate control, modular Poggenpohl kitchen, imported sanitaryware by Kohler Kallista.', '5 mins to Bandra-Worli Sea Link, 18 mins to Chhatrapati Shivaji International Airport.', 'Otters Club (300m), Pali Hill Cafes (800m), Lilavati Hospital (1.5km).', 'Carter Road residences retain exceptional capital appreciation and strong rental yields.', '/brochures/bandra-sea-front.pdf', 1),
        (2, 'Mumbai Spice Heights', 'mumbai-spice-heights', 3, 10, 'Buy', 'Apartment', '3 BHK', 3, 3, 1620.00, 2025.00, 89000000.00, 54938.27, 26, 45, 'Ready to Move', 'Ready to Move', 'P51900003412', 2, 'Fully Furnished', 'Available', 1, 1, 'Senapati Bapat Marg, Lower Parel, Mumbai 400013', 'Soaring high above the vibrant business and dining district of Lower Parel, Mumbai Spice Heights provides refined residences curated with designer interiors and city skyline vistas.', 'Panoramic Eastern Harbour and skyline views\nOlympic-length heated swimming pool\nSky lounge and rooftop observatory deck', 'Engineered wooden flooring, automated smart lighting, double-height grand entrance lobby.', 'Direct access to Lower Parel stations, 2 mins to High Street Phoenix, 10 mins to Worli Sea Face.', 'The St. Regis Mumbai (400m), Palladium Mall (300m), Kamala Mills (700m).', 'Ideal high-yield asset for institutional professionals prioritizing zero-commute urban lifestyle.', '/brochures/mumbai-spice-heights.pdf', 1),
        (3, 'Urban Tadka Residences', 'urban-tadka-residences', 7, 9, 'Buy', 'Apartment', '2 BHK', 2, 2, 980.00, 1225.00, 29500000.00, 30102.04, 14, 28, 'Ready to Move', 'Immediate Possession', 'P51800009841', 1, 'Semi-Furnished', 'Available', 1, 1, 'Central Avenue, Hiranandani Gardens, Powai, Mumbai 400076', 'A serene lake-view residence set amidst the classical neo-Gothic tree-shaded boulevards of Powai. Built with generous cross-ventilation and modular kitchen.', 'Overlooks tranquil Powai Lake and hillocks\nPedestrian boulevards\nIndoor badminton and squash courts', 'Vitrified tile flooring, granite platform with piped gas, Grohe fittings.', '8 mins to JVLR, 15 mins to Eastern Express Highway, 20 mins to International Airport.', 'Hiranandani Hospital (400m), Bombay Scottish School (800m), Supreme Business Park (600m).', 'Consistent 3.5% rental yield driven by multinational tech employees in Powai.', '/brochures/urban-tadka-residences.pdf', 1),
        (4, 'Coastal View Towers', 'coastal-view-towers', 6, 11, 'Buy', 'Apartment', '4 BHK', 4, 5, 3100.00, 3900.00, 245000000.00, 79032.26, 34, 55, 'Under Construction', 'December 2026', 'P51900012890', 3, 'Unfurnished', 'Limited Availability', 1, 1, 'Worli Sea Face, Worli, Mumbai 400030', 'An iconic beachfront residential landmark framing uninterrupted perspectives of the Mumbai Coastal Road and Arabian ocean. Features wrap-around sundecks and private wine cellar.', 'Bespoke architectural facade\nInfinity edge pool cascading towards the sea\nIntegrated Coastal Road interchange at doorstep', 'Bare-shell designer handover allowing bespoke luxury interiors, column-free layout.', '2 mins to Mumbai Coastal Road entry, 4 mins to Bandra-Worli Sea Link.', 'NSCI Club (1.2km), Four Seasons Hotel (1.8km), Willingdon Sports Club (2.5km).', 'Worli Sea Face represents the pinnacle of Mumbai capital preservation.', '/brochures/coastal-view-towers.pdf', 1),
        (5, 'Marine Grande', 'marine-grande', 4, 17, 'Buy', 'Penthouse', '5 BHK+', 5, 6, 4600.00, 5800.00, 390000000.00, 84782.61, 21, 22, 'Ready to Move', 'Ready for Interior Execution', 'P51900021903', 4, 'Semi-Furnished', 'Limited Availability', 1, 1, 'Netaji Subhash Chandra Bose Road, Marine Drive, Mumbai 400020', 'A masterwork penthouse perched directly upon Mumbai’s legendary Queen’s Necklace. Boasts an exclusive 1,400 sqft open sky-terrace overlooking Back Bay with private plunge pool.', 'World-renowned Queen’s Necklace evening panorama\nPrivate rooftop pool and cocktail deck\nDual master suites with walk-in dressing rooms', 'Sub-Zero & Wolf appliances pre-fitted, Daikin VRV air conditioning, Schuco acoustic triple-glass.', '3 mins to Churchgate, 5 mins to Nariman Point, direct access to Marine Drive promenade.', 'Cricket Club of India (400m), Trident Hotel (1km), Wankhede Stadium (500m).', 'Trophy heritage real estate along Marine Drive with zero comparable new supply.', '/brochures/marine-grande.pdf', 1),
        (6, 'Worli Crest', 'worli-crest', 5, 11, 'Buy', 'Apartment', '3 BHK', 3, 4, 1850.00, 2350.00, 112000000.00, 60540.54, 22, 48, 'Under Construction', 'June 2027', 'P51900030114', 2, 'Unfurnished', 'Available', 1, 1, 'Dr. Annie Besant Road, Worli, Mumbai 400018', 'A striking contemporary residential tower rising along Worli’s premier corridor with expansive glass facades and tranquil private zen gardens.', 'Spectacular city and sea perspectives\nSprawling 40,000 sqft podium clubhouse\nHolistic wellness spa, sauna, and pilates studio', 'Large-format marble, soundproof German UPVC fenestrations, high-speed Otis elevators.', 'Walking distance to upcoming Worli Metro, 5 mins to Mahalaxmi Racecourse.', 'Atria Mall (400m), Nehru Centre (600m), Phoenix Palladium (1.4km).', 'Attractive construction-linked milestone payments backed by top-tier engineering.', '/brochures/worli-crest.pdf', 1),
        (7, 'BKC One Corporate Suites', 'bkc-one-corporate-suites', 1, 15, 'Buy', 'Office', 'Studio', 0, 2, 2200.00, 2750.00, 75000000.00, 34090.91, 9, 18, 'Ready to Move', 'Immediate Handover', 'P51800041200', 2, 'Unfurnished', 'Available', 1, 1, 'G Block, Bandra Kurla Complex, Mumbai 400051', 'A LEED Platinum certified Grade-A commercial office plate situated in the epicentre of Mumbai’s premier financial hub.', 'LEED Platinum green building certification\nColumn-free flexible floor layout\nConcierge desk, business lounge, and shared boardroom', 'Centralized HVAC ducting, 100% DG power backup, integrated BMS safety.', 'Directly connected to BKC Bullet Train terminal, 2 mins to WEH, 15 mins to Airport.', 'Jio World Centre (300m), US Consulate General (700m), Sofitel Mumbai (400m).', 'Premier commercial asset with strong 8.2% gross cap rate potential.', '/brochures/bkc-one.pdf', 1),
        (8, 'Juhu Royale Beachfront Haven', 'juhu-royale-beachfront-haven', 8, 6, 'Buy', 'Villa', '5 BHK+', 5, 6, 5200.00, 6800.00, 420000000.00, 80769.23, 1, 3, 'Ready to Move', 'Ready for Occupancy', 'P51800052310', 4, 'Fully Furnished', 'Limited Availability', 1, 1, 'Gandhigram Road, Juhu Beach Enclave, Mumbai 400049', 'An ultra-exclusive independent beachfront villa featuring a private heated infinity pool, manicured lawns, and subterranean screening room.', 'Rare independent beachfront bungalow parcel\nPrivate heated swimming pool and tropical garden\nSubterranean screening room and cellar', 'Handcrafted teakwood furnishings, solid brass architectural hardware, Crestron automation.', 'Direct pathway to Juhu Beach sands, 12 mins to Western Express Highway.', 'Prithvi Theatre (600m), Soho House Mumbai (1.1km), JW Marriott Juhu (900m).', 'Unsurpassed trophy asset in an enclave where independent beachfront residences are rare heirlooms.', '/brochures/juhu-royale.pdf', 1),
        (9, 'Powai Lake Green Residences', 'powai-lake-green-residences', 1, 9, 'Rent', 'Apartment', '2 BHK', 2, 2, 850.00, 1050.00, 95000.00, 111.76, 11, 24, 'Ready to Move', 'Immediate Lease Available', 'P51800063422', 1, 'Fully Furnished', 'Available', 0, 1, 'Lake Boulevard, Powai, Mumbai 400076', 'A thoughtfully furnished 2 BHK rental apartment overlooking serene forest ridges and Powai Lake with high-speed fiber internet.', 'Breathtaking greenery views\nFully furnished with designer furniture\nIncluded access to Olympic pool and gym', 'Hardwood laminate flooring, Bosch washer-dryer, 4K OLED televisions.', '10 mins to Kanjurmarg Station, 12 mins to JVLR, 25 mins to BKC.', 'Galleria Mall (700m), IIT Bombay Main Gate (1km).', 'High corporate demand from senior management in Powai corporate parks.', '/brochures/powai-lake-green.pdf', 1),
        (10, 'South Mumbai Regal Mansions', 'south-mumbai-regal-mansions', 3, 18, 'Buy', 'Apartment', '4 BHK', 4, 4, 3400.00, 4250.00, 290000000.00, 85294.12, 12, 16, 'Ready to Move', 'Ready for Possession', 'P51900074533', 3, 'Semi-Furnished', 'Available', 1, 1, 'Ridge Road, Malabar Hill, Mumbai 400006', 'A distinguished residence located on prestigious Malabar Hill overlooking the lush canopy of Hanging Gardens and Arabian coastline.', 'Unrivalled Malabar Hill address with extreme privacy\nPanoramic views of sea and green canopy\nLow-density tower with single residence per floor', 'Statuary white Italian marble, bespoke Burma teak woodwork.', 'Direct access to Walkeshwar Road, 7 mins to Marine Drive, 15 mins to Nariman Point.', 'Hanging Gardens (200m), Governor House (800m), Priyadarshini Park (1.5km).', 'Malabar Hill remains the most resilient store of intergenerational wealth.', '/brochures/south-mumbai-regal.pdf', 1),
        (11, 'Colaba Harbour View Residences', 'colaba-harbour-view-residences', 4, 16, 'Rent', 'Apartment', '3 BHK', 3, 3, 1750.00, 2200.00, 250000.00, 142.86, 8, 14, 'Ready to Move', 'Available from 1st of Next Month', 'P51900085644', 2, 'Fully Furnished', 'Available', 0, 1, 'Arthur Bunder Road, Colaba, Mumbai 400005', 'A classic sea-view residential apartment in heritage Colaba, minutes from the Gateway of India with high ceilings and restored woodwork.', 'Harbour view framing yachts and the Arabian sea\nHeritage charm with modern comforts\nWalking distance to Mumbai art district', 'Reclaimed Burma teak floorboards, fully fitted European kitchen with dishwasher.', '5 mins to Nariman Point, 2 mins to Colaba Causeway, 10 mins to Eastern Freeway.', 'The Taj Mahal Palace (300m), Gateway of India (400m), Jehangir Art Gallery (1km).', 'Sought-after rental asset for diplomats and consular officials in South Mumbai.', '/brochures/colaba-harbour-view.pdf', 1),
        (12, 'Khar West Leafy Boulevard Flat', 'khar-west-leafy-boulevard-flat', 6, 4, 'Buy', 'Apartment', '2 BHK', 2, 2, 1050.00, 1312.00, 47500000.00, 45238.10, 7, 12, 'Ready to Move', 'Immediate Handover', 'P51800096755', 1, 'Semi-Furnished', 'Available', 0, 1, '15th Road, Khar West, Mumbai 400052', 'A boutique quiet residential flat on one of Khar West’s most peaceful tree-lined lanes with dual balconies and modular kitchen.', 'Prime location between Linking Road and SV Road\nBoutique residential community with only 18 families\nLush green street canopy and quiet residential atmosphere', 'Large format vitrified tile, Jaguar Artize bathroom fittings, soundproof sliding windows.', '3 mins to Khar Railway Station, 6 mins to Bandra Linking Road.', 'Khar Gymkhana (400m), Olive Bar & Kitchen (900m), Podar International School (1.2km).', 'Khar West offers high livability and sustained capital appreciation.', '/brochures/khar-leafy-boulevard.pdf', 1);
      `);

      // Seed Property Images
      db.run(`INSERT OR IGNORE INTO property_images (property_id, image_url, caption, category, is_primary, display_order) VALUES
        (1, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', 'Architectural Exterior View Facing Arabian Sea', 'exterior', 1, 1),
        (1, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80', 'Grand Double-Height Living Room with Ocean Perspectives', 'interior', 0, 2),
        (1, 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80', 'Master Bedroom Suite with Sunset Balcony', 'interior', 0, 3),
        (1, 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80', 'Panoramic Sea-Facing Deck at Dusk', 'exterior', 0, 4),
        (2, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80', 'Highrise Tower Elevation in Lower Parel', 'exterior', 1, 1),
        (2, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', 'Contemporary Open-Concept Living and Dining Hall', 'interior', 0, 2),
        (2, 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80', 'Modern German Modular Kitchen with Quartz Island', 'interior', 0, 3),
        (3, 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80', 'Residential Wing Overlooking Powai Green Canopy', 'exterior', 1, 1),
        (3, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80', 'Sunlit Living Area with Natural Oak Accents', 'interior', 0, 2),
        (4, 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f9?auto=format&fit=crop&w=1200&q=80', 'Worli Sea Face Landmark Tower Elevation', 'exterior', 1, 1),
        (4, 'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1200&q=80', 'Expansive 4 BHK Sea Front Living Room', 'interior', 0, 2),
        (5, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80', 'Marine Drive Penthouse Horizon Perspective', 'exterior', 1, 1),
        (5, 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80', 'Palatial Penthouse Living Salon with Italian Marble', 'interior', 0, 2),
        (6, 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80', 'Worli Crest Architectural Tower Facade', 'exterior', 1, 1),
        (7, 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80', 'BKC Commercial Headquarters Facade', 'exterior', 1, 1),
        (8, 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80', 'Juhu Beachfront Villa Private Entrance & Garden', 'exterior', 1, 1),
        (9, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80', 'Cozy Designer Living Room Overlooking Green Vistas', 'interior', 1, 1),
        (10, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', 'Malabar Hill Classical Highrise Residence', 'exterior', 1, 1),
        (11, 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80', 'Colaba Sea-Facing Heritage Apartment Interior', 'interior', 1, 1),
        (12, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80', 'Warm Minimalist Living Room in Khar West', 'interior', 1, 1);
      `);

      // Seed Property Amenities
      db.run(`INSERT OR IGNORE INTO property_amenities (property_id, amenity_id) VALUES
        (1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 10), (1, 12), (1, 13),
        (2, 1), (2, 2), (2, 3), (2, 4), (2, 6), (2, 10), (2, 11), (2, 13),
        (3, 2), (3, 3), (3, 4), (3, 6), (3, 7), (3, 8), (3, 9), (3, 11),
        (4, 1), (4, 2), (4, 3), (4, 4), (4, 5), (4, 6), (4, 10), (4, 12), (4, 13), (4, 14),
        (5, 1), (5, 2), (5, 4), (5, 5), (5, 6), (5, 10), (5, 12), (5, 13),
        (6, 1), (6, 2), (6, 3), (6, 4), (6, 6), (6, 7), (6, 10), (6, 14),
        (7, 4), (7, 6), (7, 10), (7, 11), (7, 13), (7, 14),
        (8, 1), (8, 2), (8, 4), (8, 5), (8, 6), (8, 7), (8, 12), (8, 14),
        (9, 1), (9, 2), (9, 3), (9, 4), (9, 6), (9, 7), (9, 8),
        (10, 2), (10, 4), (10, 5), (10, 6), (10, 7), (10, 10), (10, 13),
        (11, 4), (11, 5), (11, 6), (11, 10), (11, 11),
        (12, 4), (12, 6), (12, 7), (12, 10);
      `);

      // Seed Favourites & Comparisons
      db.run(`INSERT OR IGNORE INTO favourites (user_id, property_id) VALUES (3, 1), (3, 4), (4, 3), (4, 2);`);
      db.run(`INSERT OR IGNORE INTO property_comparisons (user_id, property_id) VALUES (3, 1), (3, 4);`);

      // Seed Enquiries
      db.run(`INSERT OR IGNORE INTO enquiries (id, user_id, property_id, name, email, phone, preferred_contact_method, message, status, assigned_consultant_id) VALUES
        (1, 3, 1, 'Rohan Singhania', 'customer@example.com', '+91 98190 22334', 'phone', 'Interested in a high-floor 4 BHK at Bandra Sea Front Residences. Requesting RERA schedule and private consultation on Sunday.', 'qualified', 2),
        (2, 4, 3, 'Priya Sharma', 'priya.sharma@example.com', '+91 98330 44556', 'whatsapp', 'Looking for immediate possession 2 BHK in Powai for self-use. Please share floor plans and bank loan pre-approvals.', 'contacted', 2),
        (3, NULL, 4, 'Vikram Oberoi', 'vikram.oberoi@investcorp.in', '+91 98200 11998', 'email', 'Seeking details on upper penthouse units at Coastal View Towers Worli. What is the current construction completion status?', 'new', 2),
        (4, NULL, 7, 'Deepak Kothari', 'kothari.offices@rediffmail.com', '+91 98210 77665', 'phone', 'Require 2,500 sqft commercial office plate in BKC for family wealth office. Please arrange site visit.', 'new', 2);
      `);

      // Seed Site Visits
      db.run(`INSERT OR IGNORE INTO site_visits (id, user_id, property_id, name, email, phone, preferred_date, preferred_time, visitor_count, notes, status, consultant_id, consultant_notes) VALUES
        (1, 3, 1, 'Rohan Singhania', 'customer@example.com', '+91 98190 22334', '2026-10-15', '11:30 AM', 2, 'Accompanied by family architect to inspect structural beam layout and natural lighting.', 'Approved', 2, 'Client confirmed. Site sales manager notified to keep display residence ready.'),
        (2, 4, 2, 'Priya Sharma', 'priya.sharma@example.com', '+91 98330 44556', '2026-10-18', '03:00 PM', 1, 'Inspecting 3 BHK sample flat and clubhouse facilities.', 'Requested', 2, NULL),
        (3, NULL, 4, 'Vikram Oberoi', 'vikram.oberoi@investcorp.in', '+91 98200 11998', '2026-10-02', '04:00 PM', 3, 'Pre-booking site walkthrough of tower vantage.', 'Completed', 2, 'Client very interested in high-floor 4 BHK. Proceeded to financial term-sheet stage.');
      `);

      // Seed Callbacks
      db.run(`INSERT OR IGNORE INTO callbacks (id, user_id, property_id, name, phone, preferred_time, message, status, consultant_id, notes) VALUES
        (1, 3, 1, 'Rohan Singhania', '+91 98190 22334', 'Tomorrow 10:00 AM - 12:00 PM', 'Call to discuss stamp duty and registration timeline.', 'Assigned', 2, 'Scheduled call reminder set in calendar.'),
        (2, NULL, 5, 'Rajesh Jhunjhunwala', '+91 98205 33221', 'Evening after 6:00 PM', 'Urgent inquiry regarding Marine Grande top penthouse availability.', 'Contacted', 5, 'Spoke with client representative. Shared investor teaser pack.');
      `);

      // Seed Leads
      db.run(`INSERT OR IGNORE INTO leads (id, customer_id, name, email, phone, property_id, source, status, deal_value, assigned_consultant_id) VALUES
        (1, 3, 'Rohan Singhania', 'customer@example.com', '+91 98190 22334', 1, 'site_visit', 'Site Visit Scheduled', 185000000.00, 2),
        (2, 4, 'Priya Sharma', 'priya.sharma@example.com', '+91 98330 44556', 3, 'enquiry', 'Qualified', 29500000.00, 2),
        (3, NULL, 'Vikram Oberoi', 'vikram.oberoi@investcorp.in', '+91 98200 11998', 4, 'site_visit', 'Negotiation', 245000000.00, 2),
        (4, NULL, 'Deepak Kothari', 'kothari.offices@rediffmail.com', '+91 98210 77665', 7, 'enquiry', 'New', 75000000.00, 2),
        (5, NULL, 'Anand Mahindra Family Office', 'wealth@anandfamilyoffice.com', '+91 98208 00011', 8, 'direct', 'Converted', 420000000.00, 5);
      `);

      // Seed Lead Notes & Follow-ups
      db.run(`INSERT OR IGNORE INTO lead_notes (id, lead_id, author_id, note) VALUES
        (1, 1, 2, 'Spoke with Rohan Singhania. Budget is firm between ₹18-20 Cr. Prefers 18th floor or higher for unhindered sea horizon.'),
        (2, 1, 2, 'Confirmed site visit for family architect. Arranged master layout drawing set with developer.'),
        (3, 3, 2, 'Site visit completed successfully. Client wants customized payment plan linked to slab casting.');
      `);

      db.run(`INSERT OR IGNORE INTO follow_ups (id, lead_id, consultant_id, scheduled_at, follow_up_type, notes, status) VALUES
        (1, 1, 2, '2026-10-15 11:30:00', 'site_visit', 'Conduct escorted Carter Road property walkthrough with family architect.', 'scheduled'),
        (2, 2, 2, '2026-10-12 15:00:00', 'call', 'Share Hiranandani Powai comparative carpet area analysis sheet.', 'scheduled'),
        (3, 3, 2, '2026-10-11 17:00:00', 'meeting', 'Meet client counsel at Worli office to review draft term sheet.', 'scheduled');
      `);

      // Seed Project Status
      db.run(`INSERT OR IGNORE INTO project_status (id, property_id, stage, completion_percentage, target_date, notes, updated_by_user_id) VALUES
        (1, 4, 'Under Construction', 72, 'December 2026', 'Tower superstructure RCC casting complete up to 48th slab. External glazing work initiated.', 1),
        (2, 6, 'Under Construction', 45, 'June 2027', 'Podium clubhouse level completed; typical residential floor slabs progressing on 12-day cycle.', 1),
        (3, 1, 'Ready to Move', 100, 'Immediate', 'Occupation Certificate (OC) received. Finishing touches and private foyer fit-outs underway.', 1);
      `, (err) => {
        if (err) return reject(err);
        console.log('[Database] SQLite HOMES2OWN database initialized successfully with demo records.');
        resolve();
      });
    });
  });
};

/**
 * Initialize SQLite database engine
 */
const initSqlite = async (sqlitePath) => {
  return new Promise((resolve, reject) => {
    let targetPath = sqlitePath;
    try {
      const dbDir = path.dirname(targetPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
    } catch (e) {
      console.warn('[Database] Could not create target directory, falling back to temp:', e.message);
      targetPath = path.resolve(process.cwd(), 'database/homes2own.sqlite');
    }

    const db = new sqlite3.Database(targetPath, (err) => {
      if (err) return reject(err);
      try {
        db.run('PRAGMA foreign_keys = ON;');
      } catch (e) {
        console.warn('Could not set PRAGMA foreign_keys', e);
      }

      db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
        if (err) return reject(err);
        if (!row) {
          console.log('[Database] Initializing fresh HOMES2OWN schema in SQLite...');
          bootstrapSqliteTables(db)
            .then(() => resolve(db))
            .catch(reject);
        } else {
          resolve(db);
        }
      });
    });
  });
};

/**
 * Establish database connection (MySQL primary, SQLite seamless fallback)
 */
const getDbConnection = async () => {
  if (currentClient === 'mysql' && pool) return 'mysql';
  if (currentClient === 'sqlite' && sqliteDb) return 'sqlite';

  const preferSqlite = process.env.DB_CLIENT === 'sqlite' || process.env.NODE_ENV === 'test';

  if (!preferSqlite) {
    try {
      console.log(`[Database] Attempting MySQL connection to ${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.database}...`);
      const testPool = mysql.createPool(DB_CONFIG);
      const [rows] = await testPool.query('SELECT 1 as test');
      if (rows && rows[0].test === 1) {
        pool = testPool;
        currentClient = 'mysql';
        console.log('[Database] Connected successfully to MySQL Server (HOMES2OWN)!');
        return 'mysql';
      }
    } catch (err) {
      console.warn(`[Database] MySQL connection notice: (${err.message}). Activating local SQLite engine...`);
    }
  }

  // Fallback to SQLite
  const sqliteFile = path.resolve(__dirname, '../../../database/homes2own.sqlite');
  sqliteDb = await initSqlite(sqliteFile);
  currentClient = 'sqlite';
  console.log(`[Database] Active database: SQLite (${sqliteFile})`);
  return 'sqlite';
};

/**
 * Unified parameterized query method compatible with mysql2 [rows, fields] signature
 * @param {string} sql - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<[Array|Object, Array]>}
 */
const query = async (sql, params = []) => {
  await getDbConnection();

  if (currentClient === 'mysql') {
    return pool.query(sql, params);
  }

  return new Promise((resolve, reject) => {
    const trimmed = sql.trim();
    const isSelect = /^(SELECT|PRAGMA|EXPLAIN)/i.test(trimmed);

    if (isSelect) {
      sqliteDb.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve([rows || [], []]);
      });
    } else {
      sqliteDb.run(sql, params, function (err) {
        if (err) return reject(err);
        // Emulate mysql2 OkPacket
        const result = {
          insertId: this.lastID,
          affectedRows: this.changes,
        };
        resolve([result, []]);
      });
    }
  });
};

module.exports = {
  query,
  getDbConnection,
  getClientType: () => currentClient,
  close: async () => {
    if (pool) await pool.end();
    if (sqliteDb) {
      await new Promise((res) => sqliteDb.close(res));
    }
    currentClient = 'uninitialized';
  }
};
