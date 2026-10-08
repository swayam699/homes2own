-- ============================================================================
-- HOMES2OWN — Database Seed Data (MySQL 8.0+)
-- Realistic Mumbai demonstration records for advisory portfolio
-- Note: All projects & prices are illustrative demonstration listings.
-- ============================================================================

USE homes2own_db;

-- ----------------------------------------------------------------------------
-- 1. USERS & CONSULTANTS (Password: Password123!)
-- ----------------------------------------------------------------------------
INSERT INTO users (id, name, email, password_hash, phone, role, avatar_url, preferred_locations, preferred_configurations, min_budget, max_budget) VALUES
(1, 'HOMES2OWN Principal Admin', 'admin@example.com', '$2a$10$bwxZtNLOge/fssZNsMOjKeozjEcamgJ.i4W5feiwdlGot5jXKUsUq', '+91 98200 99001', 'admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', 'Bandra West, Worli, BKC', '3 BHK, 4 BHK', 30000000, 150000000),
(2, 'Kabir Varma', 'consultant@example.com', '$2a$10$bwxZtNLOge/fssZNsMOjKeozjEcamgJ.i4W5feiwdlGot5jXKUsUq', '+91 96645 86316', 'consultant', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', 'Worli, Lower Parel, Bandra West', '2 BHK, 3 BHK, 4 BHK', 20000000, 100000000),
(3, 'Rohan Singhania', 'customer@example.com', '$2a$10$bwxZtNLOge/fssZNsMOjKeozjEcamgJ.i4W5feiwdlGot5jXKUsUq', '+91 98190 22334', 'customer', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', 'Bandra West, Juhu, Worli', '3 BHK, 4 BHK', 40000000, 95000000),
(4, 'Priya Sharma', 'priya.sharma@example.com', '$2a$10$bwxZtNLOge/fssZNsMOjKeozjEcamgJ.i4W5feiwdlGot5jXKUsUq', '+91 98330 44556', 'customer', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80', 'Powai, Andheri East, Lower Parel', '2 BHK, 3 BHK', 18000000, 45000000),
(5, 'Ananya Deshmukh', 'ananya.consultant@example.com', '$2a$10$bwxZtNLOge/fssZNsMOjKeozjEcamgJ.i4W5feiwdlGot5jXKUsUq', '+91 98202 88990', 'consultant', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80', 'South Mumbai, Colaba, Malabar Hill', '4 BHK, Penthouse', 60000000, 250000000)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ----------------------------------------------------------------------------
-- 2. DEVELOPERS
-- ----------------------------------------------------------------------------
INSERT INTO developers (id, name, slug, logo_url, description, website, contact_email, contact_phone, established_year, is_verified) VALUES
(1, 'Godrej Properties', 'godrej-properties', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=300&q=80', 'Renowned for sustainable architecture, thoughtful urban design, and cutting-edge residential townships across Mumbai metropolitan region.', 'https://www.godrejproperties.com', 'mumbai@godrejproperties.com', '+91 22 6169 8500', 1990, 1),
(2, 'Lodha', 'lodha', 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f9?auto=format&fit=crop&w=300&q=80', 'India’s premier real estate developer renowned for landmark skyscrapers, luxury gated estates, and world-class residential lifestyle developments.', 'https://www.lodhagroup.com', 'enquiries@lodhagroup.com', '+91 22 6133 4400', 1980, 1),
(3, 'Oberoi Realty', 'oberoi-realty', 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=300&q=80', 'Synonymous with contemporary aesthetics, precision engineering, pristine finishes, and prime urban locations across Mumbai.', 'https://www.oberoirealty.com', 'contact@oberoirealty.com', '+91 22 6677 3333', 1998, 1),
(4, 'Prestige Group', 'prestige-group', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=300&q=80', 'Decades of real estate excellence, curating landmark residential developments, luxury penthouses, and commercial headquarters.', 'https://www.prestigeconstructions.com', 'mumbai@prestigeconstructions.com', '+91 22 2650 1100', 1986, 1),
(5, 'Adani Realty', 'adani-realty', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=300&q=80', 'Developing iconic Mumbai skyline landmarks blending contemporary luxury, sprawling landscaped greens, and connectivity.', 'https://www.adanirealty.com', 'info@adanirealty.com', '+91 22 2555 7700', 2010, 1),
(6, 'Rustomjee', 'rustomjee', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=300&q=80', 'Pioneering design-led luxury residences with deep emphasis on community living, open green parks, and family wellness.', 'https://www.rustomjee.com', 'connect@rustomjee.com', '+91 22 6676 6888', 1996, 1),
(7, 'Kalpataru', 'kalpataru', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=300&q=80', 'One of Mumbai’s most trusted builders delivering state-of-the-art residences, modern towers, and timeless gated communities.', 'https://www.kalpataru.com', 'sales@kalpataru.com', '+91 22 6120 7000', 1969, 1),
(8, 'Mahindra Lifespaces', 'mahindra-lifespaces', 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=300&q=80', 'Pioneers of green homes, sustainable living ecosystems, and thoughtful engineering in Mumbai and suburbs.', 'https://www.mahindralifespaces.com', 'homes@mahindralifespaces.com', '+91 22 6747 8600', 1994, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ----------------------------------------------------------------------------
-- 3. MUMBAI LOCATIONS (20 key localities)
-- ----------------------------------------------------------------------------
INSERT INTO locations (id, name, slug, region, overview, landmark, avg_price_sqft, property_count, image_url) VALUES
(1, 'Bandra West', 'bandra-west', 'Western Suburbs', 'The cultural and lifestyle capital of Mumbai, famed for heritage sea-facing promenades, artisanal cafes, designer boutiques, and celebrity residences.', 'Bandstand & Carter Road', 58000.00, 12, 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80'),
(2, 'Bandra East', 'bandra-east', 'Western Suburbs', 'Strategic corporate-residential gateway bordering BKC with rapid connectivity to the airport and sea link.', 'Kalanagar & Western Express Highway', 36000.00, 6, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'),
(3, 'Bandra Reclamation', 'bandra-reclamation', 'Western Suburbs', 'Pristine coastal enclave offering breathtaking unobstructed views of the Bandra-Worli Sea Link and Arabian Sea sunsets.', 'Bandra-Worli Sea Link Promenade', 62000.00, 4, 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80'),
(4, 'Khar West', 'khar-west', 'Western Suburbs', 'Exclusive, leafy neighborhood known for quiet residential avenues, elite clubs, and intimate proximity to Bandra.', '14th Road & Khar Gymkhana', 52000.00, 5, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'),
(5, 'Santacruz West', 'santacruz-west', 'Western Suburbs', 'Charming affluent enclave featuring tree-lined streets, boutique apartment towers, and vibrant market precincts.', 'Tagore Road & Willingdon Catholic Gymkhana', 44000.00, 5, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'),
(6, 'Juhu', 'juhu', 'Western Suburbs', 'Mumbai’s storied beachfront enclave synonymous with expansive estates, luxury residences, gourmet dining, and seaside tranquility.', 'Juhu Beach & JW Marriott', 65000.00, 8, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'),
(7, 'Andheri West', 'andheri-west', 'Western Suburbs', 'High-energy cultural and entertainment hub with exceptional metro connectivity, premier schools, and lively social infrastructure.', 'Lokhandwala Complex & Infinity Mall', 32000.00, 9, 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'),
(8, 'Andheri East', 'andheri-east', 'Western Suburbs', 'Commercial powerhouse hosting corporate headquarters, MIDC tech hubs, international hotels, and Chhatrapati Shivaji Maharaj International Airport.', 'Chakala Metro & SEEPZ', 24000.00, 7, 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'),
(9, 'Powai', 'powai', 'Central Suburbs', 'Cosmopolitan lakefront township blending European-style neo-classical architecture, IIT Bombay, tech parks, and lush greenery.', 'Powai Lake & Hiranandani Gardens', 28000.00, 9, 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80'),
(10, 'Lower Parel', 'lower-parel', 'South Central Mumbai', 'The epicenter of Mumbai high-finance and luxury lifestyle, reimagined from historic mill lands into premier skyscraper residences and luxury malls.', 'High Street Phoenix & One World Center', 48000.00, 11, 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80'),
(11, 'Worli', 'worli', 'South Central Mumbai', 'Mumbai’s billionaire row along the Arabian Sea, boasting architectural landmark skyscrapers, coastal road connectivity, and high-end clubs.', 'Worli Sea Face & Coastal Road', 62000.00, 14, 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f9?auto=format&fit=crop&w=800&q=80'),
(12, 'Prabhadevi', 'prabhadevi', 'South Central Mumbai', 'Serene coastal neighbourhood bridging South Mumbai and Worli, home to the revered Siddhivinayak Temple and sea-facing highrises.', 'Siddhivinayak Temple & Kirti College Seafront', 54000.00, 6, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'),
(13, 'Dadar', 'dadar', 'Central Mumbai', 'The historic cultural heart of Mumbai with unparalleled railway and transit connectivity, heritage grounds, and cultural institutions.', 'Shivaji Park & Portuguese Church', 38000.00, 5, 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80'),
(14, 'Chembur', 'chembur', 'Eastern Suburbs', 'Green leafy Eastern suburb benefiting from the Eastern Freeway, Monorail, and golf club, with quick access to South Mumbai.', 'Bombay Presidency Golf Club', 25000.00, 6, 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80'),
(15, 'BKC', 'bkc', 'Central Mumbai', 'Mumbai’s prime international financial center hosting multinational headquarters, consular missions, Diamond Bourse, and Jio World Centre.', 'Jio World Convention Centre & Bharat Diamond Bourse', 42000.00, 8, 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'),
(16, 'Colaba', 'colaba', 'South Mumbai', 'Historic colonial crown of South Mumbai, featuring heritage Victorian architecture, iconic art galleries, and the Arabian Sea.', 'Gateway of India & Colaba Causeway', 68000.00, 5, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'),
(17, 'Marine Drive', 'marine-drive', 'South Mumbai', 'The legendary Queen’s Necklace curve, world-famous for heritage Art Deco residential mansions and sweeping seaside vistas.', 'Nariman Point & Wankhede Stadium', 78000.00, 4, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'),
(18, 'Malabar Hill', 'malabar-hill', 'South Mumbai', 'The most prestigious residential address in India, hosting sprawling governor mansions, quiet canopy roads, and panoramic bay views.', 'Hanging Gardens & Raj Bhavan', 95000.00, 3, 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80'),
(19, 'Mahalaxmi', 'mahalaxmi', 'South Mumbai', 'Prestigious historic district framing panoramic racecourse greens, Arabian sea horizons, and luxury residential skyrises.', 'Mahalaxmi Race Course & Willingdon Sports Club', 56000.00, 6, 'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=800&q=80'),
(20, 'Tardeo', 'tardeo', 'South Mumbai', 'Prime South Mumbai locality featuring ultra-luxury residential towers, high street shopping, and close proximity to Breach Candy.', 'Imperial Towers & AC Market', 64000.00, 5, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ----------------------------------------------------------------------------
-- 4. AMENITIES (High-end features)
-- ----------------------------------------------------------------------------
INSERT INTO amenities (id, name, slug, category, icon) VALUES
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
(14, 'EV Charging Station', 'ev-charging-station', 'Security & Convenience', 'BatteryCharging')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ----------------------------------------------------------------------------
-- 5. PROPERTIES (Realistic Mumbai Demonstration Portfolio)
-- ----------------------------------------------------------------------------
INSERT INTO properties (
    id, title, slug, developer_id, location_id, transaction_type, property_type,
    configuration, bedrooms, bathrooms, carpet_area, built_up_area, price,
    floor_number, total_floors, possession_status, possession_date, rera_number,
    parking_spaces, furnishing, availability_status, is_featured, is_published,
    address, overview, highlights, specifications, connectivity, nearby_landmarks,
    investment_considerations, brochure_url, is_demo
) VALUES
(
    1,
    'Bandra Sea Front Residences',
    'bandra-sea-front-residences',
    2, 1, 'Buy', 'Apartment',
    '4 BHK', 4, 5, 2850.00, 3560.00, 185000000.00,
    18, 32, 'Ready to Move', 'Ready for Immediate Fit-out', 'P51800001892',
    3, 'Semi-Furnished', 'Available', 1, 1,
    'Plot 42, Carter Road Promenade, Bandra West, Mumbai 400050',
    'An exemplary coastal sanctuary on Carter Road commanding panoramic 180-degree unobstructed Arabian Sea horizons. Designed for high-net-worth families seeking absolute privacy, soaring 11.5 ft ceiling clearances, and refined bespoke craftsmanship.',
    'Direct waterfront promenade access\nPrivate passenger elevator foyer\nItalian marble floor finishes throughout\nDouble glazed soundproof acoustic facade',
    'VRV central climate control, modular Poggenpohl kitchen, imported sanitaryware by Kohler Kallista, multi-tier biometric security.',
    '5 mins to Bandra-Worli Sea Link, 18 mins to Chhatrapati Shivaji International Airport, 12 mins to BKC via coastal flyover.',
    'Otters Club (300m), Pali Hill Cafes (800m), Lilavati Hospital (1.5km), American School of Bombay (6km).',
    'Carter Road residences retain exceptional capital appreciation and strong rental yields among diaspora and CXO executives.',
    '/brochures/bandra-sea-front.pdf', 1
),
(
    2,
    'Mumbai Spice Heights',
    'mumbai-spice-heights',
    3, 10, 'Buy', 'Apartment',
    '3 BHK', 3, 3, 1620.00, 2025.00, 89000000.00,
    26, 45, 'Ready to Move', 'Ready to Move', 'P51900003412',
    2, 'Fully Furnished', 'Available', 1, 1,
    'Senapati Bapat Marg, Lower Parel, Mumbai 400013',
    'Soaring high above the vibrant business and dining district of Lower Parel, Mumbai Spice Heights provides refined residences curated with designer interiors, expansive sunlit living rooms, and city skyline vistas.',
    'Panoramic Eastern Harbour and skyline views\nOlympic-length heated swimming pool\nSky lounge and rooftop observatory deck\nWalking distance to corporate headquarters',
    'Engineered wooden flooring in master suite, automated smart home lighting by Lutron, double-height grand entrance lobby.',
    'Direct access to Lower Parel and Currey Road stations, 2 mins to High Street Phoenix, 10 mins to Worli Sea Face.',
    'The St. Regis Mumbai (400m), Palladium Mall (300m), Kamala Mills (700m), One International Centre (500m).',
    'Ideal high-yield asset for institutional professionals and corporate leaders prioritizing zero-commute urban lifestyle.',
    '/brochures/mumbai-spice-heights.pdf', 1
),
(
    3,
    'Urban Tadka Residences',
    'urban-tadka-residences',
    7, 9, 'Buy', 'Apartment',
    '2 BHK', 2, 2, 980.00, 1225.00, 29500000.00,
    14, 28, 'Ready to Move', 'Immediate Possession', 'P51800009841',
    1, 'Semi-Furnished', 'Available', 1, 1,
    'Central Avenue, Hiranandani Gardens, Powai, Mumbai 400076',
    'A serene lake-view residence set amidst the classical neo-Gothic tree-shaded boulevards of Powai. Built with generous cross-ventilation, contemporary modular kitchen, and access to prestigious international schooling.',
    'Overlooks tranquil Powai Lake and forested hillocks\nIntegrated community living with pedestrian boulevards\nComprehensive indoor badminton and squash courts\nEarthquake-resistant RCC framed superstructure',
    'Vitrified tile flooring, granite kitchen platform with piped gas, premium CP fittings by Grohe, video door phone.',
    '8 mins to JVLR, 15 mins to Eastern Express Highway, 20 mins to International Airport.',
    'Hiranandani Hospital (400m), Bombay Scottish School (800m), Haiko Mall (500m), Supreme Business Park (600m).',
    'Consistent 3.5% rental yield driven by multinational tech employees and academic faculties in Powai valley.',
    '/brochures/urban-tadka-residences.pdf', 1
),
(
    4,
    'Coastal View Towers',
    'coastal-view-towers',
    6, 11, 'Buy', 'Apartment',
    '4 BHK', 4, 5, 3100.00, 3900.00, 245000000.00,
    34, 55, 'Under Construction', 'December 2026', 'P51900012890',
    3, 'Unfurnished', 'Limited Availability', 1, 1,
    'Worli Sea Face, Worli, Mumbai 400030',
    'An iconic beachfront residential landmark framing uninterrupted perspectives of the Mumbai Coastal Road and Arabian ocean. Features sweeping wrap-around sundecks, dedicated staff quarters, and high-speed destination elevators.',
    'Bespoke architectural facade by award-winning global firm\nInfinity pool edge cascading towards the Arabian sea\nPrivate resident wine cellar and cigar lounge\nIntegrated Coastal Road interchange at doorstep',
    'Bare-shell designer handover allowing bespoke luxury interiors, column-free layout flexibility, sound-dampening acoustic glass.',
    '2 mins to Mumbai Coastal Road entry, 4 mins to Bandra-Worli Sea Link, 12 mins to Nariman Point.',
    'NSCI Club (1.2km), Four Seasons Hotel (1.8km), Podar Hospital (1.5km), Willingdon Sports Club (2.5km).',
    'Worli Sea Face continues to represent the pinnacle of Mumbai capital preservation and intergenerational luxury asset ownership.',
    '/brochures/coastal-view-towers.pdf', 1
),
(
    5,
    'Marine Grande',
    'marine-grande',
    4, 17, 'Buy', 'Penthouse',
    '5 BHK+', 5, 6, 4600.00, 5800.00, 390000000.00,
    21, 22, 'Ready to Move', 'Ready for Interior Execution', 'P51900021903',
    4, 'Semi-Furnished', 'Limited Availability', 1, 1,
    'Netaji Subhash Chandra Bose Road, Marine Drive, Mumbai 400020',
    'A masterwork penthouse perched directly upon Mumbai’s legendary Queen’s Necklace. Boasts an exclusive 1,400 sqft open sky-terrace overlooking the expanse of Back Bay, private plunge pool, and dedicated butler pantry.',
    'World-renowned Queen’s Necklace evening panorama\nPrivate rooftop swimming pool and cocktail deck\nDual key master suites with walk-in dressing parlours\nHeritage-compliant Art Deco aesthetic exterior',
    'Sub-Zero and Wolf kitchen appliances pre-fitted, Daikin VRV air-conditioning, Schuco triple-glazed windows.',
    '3 mins to Churchgate Terminal, 5 mins to Nariman Point commercial district, direct access to Marine Drive promenade.',
    'Cricket Club of India (CCI) (400m), Trident Hotel (1km), Wankhede Stadium (500m), Bombay Gymkhana (1.8km).',
    'Trophy heritage real estate along Marine Drive with nearly non-existent new supply in contemporary decades.',
    '/brochures/marine-grande.pdf', 1
),
(
    6,
    'Worli Crest',
    'worli-crest',
    5, 11, 'Buy', 'Apartment',
    '3 BHK', 3, 4, 1850.00, 2350.00, 112000000.00,
    22, 48, 'Under Construction', 'June 2027', 'P51900030114',
    2, 'Unfurnished', 'Available', 1, 1,
    'Dr. Annie Besant Road, Worli, Mumbai 400018',
    'A striking contemporary residential tower rising along Worli’s premier corridor. Curated with expansive glass facades, tranquil private zen gardens, temperature-controlled indoor lap pool, and electric vehicle supercharging bays.',
    'Spectacular city and sea perspectives\nSprawling 40,000 sqft podium lifestyle clubhouse\nHolistic wellness spa, sauna, and pilates studio\nSmart home automation ready wiring',
    'Imported large-format marble, soundproof German UPVC fenestrations, concealed copper wiring, high-speed Otis elevators.',
    'Walking distance to upcoming Worli Metro station, 5 mins to Mahalaxmi Racecourse, 8 mins to BKC via Sea Link.',
    'Atria Mall (400m), Nehru Centre & Planetarium (600m), Jaslok Hospital (3.2km), Phoenix Palladium (1.4km).',
    'Highly attractive payment milestones linked to construction stages, backed by top-tier infrastructure development.',
    '/brochures/worli-crest.pdf', 1
),
(
    7,
    'BKC One Corporate Suites',
    'bkc-one-corporate-suites',
    1, 15, 'Buy', 'Office',
    'Studio', 0, 2, 2200.00, 2750.00, 75000000.00,
    9, 18, 'Ready to Move', 'Immediate Handover', 'P51800041200',
    2, 'Unfurnished', 'Available', 1, 1,
    'G Block, Bandra Kurla Complex, Mumbai 400051',
    'A LEED Platinum certified Grade-A commercial office plate situated in the epicentre of Mumbai’s premier financial hub. Designed with floor-to-ceiling double insulated facade, column-free office layouts, and triple redundancy power backup.',
    'LEED Platinum green building certification\nColumn-free flexible floor layout allowing open workstations\nConcierge desk, business lounge, and shared boardroom facilities\nDestination controlled elevator banks with turnstiles',
    'Bare-shell warm finish, centralized HVAC ducting, 100% DG power backup, integrated BMS safety and fire suppression.',
    'Directly connected to BKC Bullet Train terminal, 2 mins to Western Express Highway, 15 mins to International Airport.',
    'Jio World Centre (300m), US Consulate General (700m), Sofitel Mumbai (400m), MCA Club (500m).',
    'Premier commercial asset with strong 8.2% gross cap rate potential from multinational banking and law firms.',
    '/brochures/bkc-one.pdf', 1
),
(
    8,
    'Juhu Royale Beachfront Haven',
    'juhu-royale-beachfront-haven',
    8, 6, 'Buy', 'Villa',
    '5 BHK+', 5, 6, 5200.00, 6800.00, 420000000.00,
    1, 3, 'Ready to Move', 'Ready for Occupancy', 'P51800052310',
    4, 'Fully Furnished', 'Limited Availability', 1, 1,
    'Gandhigram Road, Juhu Beach Enclave, Mumbai 400049',
    'An ultra-exclusive independent beachfront villa featuring a private heated infinity pool, manicured private lawns, rooftop sun deck, and dedicated subterranean basement for bespoke home cinema and personal gymnasium.',
    'Rare independent beachfront bungalow parcel in Juhu\nPrivate heated swimming pool and lush tropical garden\nSubterranean acoustics-treated screening room and cellar\nDedicated chauffeur and domestic staff quarters',
    'Handcrafted teakwood furnishings, solid brass architectural hardware, Crestron home automation, perimeter infrared surveillance.',
    'Direct pedestrian pathway to Juhu Beach sands, 12 mins to Western Express Highway, 20 mins to Domestic Airport terminal.',
    'Prithvi Theatre (600m), Soho House Mumbai (1.1km), JW Marriott Juhu (900m), Jamnabai Narsee School (1.4km).',
    'Unsurpassed trophy asset in an enclave where independent freehold beachfront residences are generational heirlooms.',
    '/brochures/juhu-royale.pdf', 1
),
(
    9,
    'Powai Lake Green Residences',
    'powai-lake-green-residences',
    1, 9, 'Rent', 'Apartment',
    '2 BHK', 2, 2, 850.00, 1050.00, 95000.00,
    11, 24, 'Ready to Move', 'Immediate Lease Available', 'P51800063422',
    1, 'Fully Furnished', 'Available', 0, 1,
    'Lake Boulevard, Powai, Mumbai 400076',
    'A thoughtfully furnished 2 BHK rental apartment overlooking serene forest ridges and Powai Lake. Equipped with high-speed fiber internet, designer modular kitchen, ergonomic work-from-home study nooks, and gym membership included.',
    'Breathtaking unobstructed greenery views\nFully furnished with West Elm and BoConcept designer furniture\nIncluded access to Olympic pool, gym, and jogging loop\nPet-friendly community with secure access cards',
    'Hardwood laminate flooring, Bosch washer-dryer, double door refrigerator, smart 4K OLED televisions in living and master.',
    '10 mins to Kanjurmarg Station, 12 mins to JVLR, 25 mins to BKC via Eastern Freeway link.',
    'Galleria Shopping Mall (700m), Renaissance Convention Centre (1.5km), IIT Bombay Main Gate (1km).',
    'High corporate demand from senior management in Powai corporate parks, ensuring seamless tenancy continuity.',
    '/brochures/powai-lake-green.pdf', 1
),
(
    10,
    'South Mumbai Regal Mansions',
    'south-mumbai-regal-mansions',
    3, 18, 'Buy', 'Apartment',
    '4 BHK', 4, 4, 3400.00, 4250.00, 290000000.00,
    12, 16, 'Ready to Move', 'Ready for Possession', 'P51900074533',
    3, 'Semi-Furnished', 'Available', 1, 1,
    'Ridge Road, Malabar Hill, Mumbai 400006',
    'A distinguished residence located on prestigious Malabar Hill overlooking the lush canopy of Hanging Gardens and the Arabian coastline. Offers grand proportions, private elevator lobby, and expansive living verandas.',
    'Unrivalled Malabar Hill address with extreme privacy\nPanoramic views encompassing both sea and green canopy\nLow-density tower with only one residence per floor\nHistoric peace and highest security neighborhood in India',
    'Statuary white Italian marble, bespoke solid Burma teak woodwork, double insulated sound-reduction glass balconies.',
    'Direct access to Walkeshwar Road, 7 mins to Marine Drive, 15 mins to Nariman Point business district.',
    'Hanging Gardens (200m), Governor House (800m), Priyadarshini Park (1.5km), Breach Candy Hospital (1.8km).',
    'Malabar Hill remains the most resilient store of intergenerational wealth across Indian luxury real estate.',
    '/brochures/south-mumbai-regal.pdf', 1
),
(
    11,
    'Colaba Harbour View Residences',
    'colaba-harbour-view-residences',
    4, 16, 'Rent', 'Apartment',
    '3 BHK', 3, 3, 1750.00, 2200.00, 250000.00,
    8, 14, 'Ready to Move', 'Available from 1st of Next Month', 'P51900085644',
    2, 'Fully Furnished', 'Available', 0, 1,
    'Arthur Bunder Road, Colaba, Mumbai 400005',
    'A classic sea-view residential apartment in heritage Colaba, minutes from the Gateway of India. Featuring high ceilings, restored Burma teak window arches, sea breeze cross-ventilation, and modern curated interiors.',
    'Harbour view framing yachts and the Arabian sea\nHeritage charm combined with 21st century modern comforts\nWalking distance to Mumbai art district and premier restaurants\nFull power backup and 24/7 security concierge',
    'Reclaimed Burma teak floorboards, fully fitted European kitchen with dishwasher, Daikin inverter air-conditioners.',
    '5 mins to Nariman Point, 2 mins to Colaba Causeway, 10 mins to Eastern Freeway entrance.',
    'The Taj Mahal Palace (300m), Gateway of India (400m), Jehangir Art Gallery (1km), Indigo Deli (500m).',
    'Sought-after rental asset for diplomats, consular officials, and expatriate corporate executives in South Mumbai.',
    '/brochures/colaba-harbour-view.pdf', 1
),
(
    12,
    'Khar West Leafy Boulevard Flat',
    'khar-west-leafy-boulevard-flat',
    6, 4, 'Buy', 'Apartment',
    '2 BHK', 2, 2, 1050.00, 1312.00, 47500000.00,
    7, 12, 'Ready to Move', 'Immediate Handover', 'P51800096755',
    1, 'Semi-Furnished', 'Available', 0, 1,
    '15th Road, Khar West, Mumbai 400052',
    'A boutique quiet residential flat on one of Khar West’s most peaceful tree-lined lanes. Generous room sizes, dual balconies, modular kitchen with quartz counters, and private covered car parking.',
    'Prime location between Linking Road and SV Road\nBoutique residential community with only 18 families\nLush green street canopy and quiet residential atmosphere\nRooftop terrace garden and private gym facility',
    'Large format vitrified tile, Jaguar Artize bathroom fittings, soundproof sliding windows, piped gas connection.',
    '3 mins to Khar Railway Station, 6 mins to Bandra Linking Road, 14 mins to Western Express Highway.',
    'Khar Gymkhana (400m), Olive Bar & Kitchen (900m), Podar International School (1.2km), Hinduja Healthcare (1.5km).',
    'Khar West offers high livability and sustained appreciation owing to tight zoning and strong neighborhood demand.',
    '/brochures/khar-leafy-boulevard.pdf', 1
)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- ----------------------------------------------------------------------------
-- 6. PROPERTY IMAGES (Architectural & Residential Photography)
-- ----------------------------------------------------------------------------
INSERT INTO property_images (property_id, image_url, caption, category, is_primary, display_order) VALUES
-- Bandra Sea Front (1)
(1, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', 'Architectural Exterior View Facing Arabian Sea', 'exterior', 1, 1),
(1, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80', 'Grand Double-Height Living Room with Ocean Perspectives', 'interior', 0, 2),
(1, 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80', 'Master Bedroom Suite with Sunset Balcony', 'interior', 0, 3),
(1, 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80', 'Panoramic Sea-Facing Deck at Dusk', 'exterior', 0, 4),

-- Mumbai Spice Heights (2)
(2, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80', 'Highrise Tower Elevation in Lower Parel', 'exterior', 1, 1),
(2, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', 'Contemporary Open-Concept Living and Dining Hall', 'interior', 0, 2),
(2, 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80', 'Modern German Modular Kitchen with Quartz Island', 'interior', 0, 3),

-- Urban Tadka Residences (3)
(3, 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80', 'Residential Wing Overlooking Powai Green Canopy', 'exterior', 1, 1),
(3, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80', 'Sunlit Living Area with Natural Oak Accents', 'interior', 0, 2),
(3, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80', 'Landscaped Courtyard and Walking Pathways', 'amenity', 0, 3),

-- Coastal View Towers (4)
(4, 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f9?auto=format&fit=crop&w=1200&q=80', 'Worli Sea Face Landmark Tower Elevation', 'exterior', 1, 1),
(4, 'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1200&q=80', 'Expansive 4 BHK Sea Front Living Room', 'interior', 0, 2),
(4, 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80', 'Infinity Horizon Edge Pool Facing Coastal Road', 'amenity', 0, 3),

-- Marine Grande (5)
(5, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80', 'Marine Drive Penthouse Horizon Perspective', 'exterior', 1, 1),
(5, 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80', 'Palatial Penthouse Living Salon with Italian Marble', 'interior', 0, 2),
(5, 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80', 'Private Rooftop Sky Deck with Infinity Plunge Pool', 'amenity', 0, 3),

-- Worli Crest (6)
(6, 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80', 'Worli Crest Architectural Tower Facade', 'exterior', 1, 1),
(6, 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80', 'Modern 3 BHK Living Room with Panoramic Floor Windows', 'interior', 0, 2),

-- BKC One (7)
(7, 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80', 'BKC Commercial Headquarters Facade', 'exterior', 1, 1),
(7, 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80', 'Grade-A Open Plan Corporate Office Floor', 'interior', 0, 2),

-- Juhu Royale (8)
(8, 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80', 'Juhu Beachfront Villa Private Entrance & Garden', 'exterior', 1, 1),
(8, 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80', 'Double Height Luxury Villa Lounge', 'interior', 0, 2),

-- Powai Lake Green (9)
(9, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80', 'Cozy Designer Living Room Overlooking Green Vistas', 'interior', 1, 1),

-- South Mumbai Regal (10)
(10, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', 'Malabar Hill Classical Highrise Residence', 'exterior', 1, 1),

-- Colaba Harbour View (11)
(11, 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80', 'Colaba Sea-Facing Heritage Apartment Interior', 'interior', 1, 1),

-- Khar Leafy Flat (12)
(12, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80', 'Warm Minimalist Living Room in Khar West', 'interior', 1, 1);

-- ----------------------------------------------------------------------------
-- 7. PROPERTY AMENITIES MAPPING
-- ----------------------------------------------------------------------------
INSERT IGNORE INTO property_amenities (property_id, amenity_id) VALUES
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

-- ----------------------------------------------------------------------------
-- 8. CUSTOMER FAVOURITES
-- ----------------------------------------------------------------------------
INSERT IGNORE INTO favourites (user_id, property_id) VALUES
(3, 1),
(3, 4),
(4, 3),
(4, 2);

-- ----------------------------------------------------------------------------
-- 9. PROPERTY COMPARISONS
-- ----------------------------------------------------------------------------
INSERT IGNORE INTO property_comparisons (user_id, property_id) VALUES
(3, 1),
(3, 4);

-- ----------------------------------------------------------------------------
-- 10. ENQUIRIES
-- ----------------------------------------------------------------------------
INSERT INTO enquiries (id, user_id, property_id, name, email, phone, preferred_contact_method, message, status, assigned_consultant_id, created_at) VALUES
(1, 3, 1, 'Rohan Singhania', 'customer@example.com', '+91 98190 22334', 'phone', 'Interested in a high-floor 4 BHK at Bandra Sea Front Residences. Requesting RERA schedule and private consultation on Sunday.', 'qualified', 2, NOW() - INTERVAL 3 DAY),
(2, 4, 3, 'Priya Sharma', 'priya.sharma@example.com', '+91 98330 44556', 'whatsapp', 'Looking for immediate possession 2 BHK in Powai for self-use. Please share floor plans and bank loan pre-approvals.', 'contacted', 2, NOW() - INTERVAL 2 DAY),
(3, NULL, 4, 'Vikram Oberoi', 'vikram.oberoi@investcorp.in', '+91 98200 11998', 'email', 'Seeking details on upper penthouse units at Coastal View Towers Worli. What is the current construction completion status?', 'new', 2, NOW() - INTERVAL 1 DAY),
(4, NULL, 7, 'Deepak Kothari', 'kothari.offices@rediffmail.com', '+91 98210 77665', 'phone', 'Require 2,500 sqft commercial office plate in BKC for family wealth office. Please arrange site visit.', 'new', 2, NOW() - INTERVAL 4 HOUR)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ----------------------------------------------------------------------------
-- 11. SITE VISITS
-- ----------------------------------------------------------------------------
INSERT INTO site_visits (id, user_id, property_id, name, email, phone, preferred_date, preferred_time, visitor_count, notes, status, consultant_id, consultant_notes, created_at) VALUES
(1, 3, 1, 'Rohan Singhania', 'customer@example.com', '+91 98190 22334', CURDATE() + INTERVAL 2 DAY, '11:30 AM', 2, 'Accompanied by family architect to inspect structural beam layout and natural lighting.', 'Approved', 2, 'Client confirmed. Site sales manager notified to keep display residence ready.', NOW() - INTERVAL 2 DAY),
(2, 4, 2, 'Priya Sharma', 'priya.sharma@example.com', '+91 98330 44556', CURDATE() + INTERVAL 3 DAY, '03:00 PM', 1, 'Inspecting 3 BHK sample flat and clubhouse facilities.', 'Requested', 2, NULL, NOW() - INTERVAL 1 DAY),
(3, NULL, 4, 'Vikram Oberoi', 'vikram.oberoi@investcorp.in', '+91 98200 11998', CURDATE() - INTERVAL 4 DAY, '04:00 PM', 3, 'Pre-booking site walkthrough of tower vantage.', 'Completed', 2, 'Client very interested in high-floor 4 BHK. Proceeded to financial term-sheet stage.', NOW() - INTERVAL 5 DAY)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ----------------------------------------------------------------------------
-- 12. CALLBACK REQUESTS
-- ----------------------------------------------------------------------------
INSERT INTO callbacks (id, user_id, property_id, name, phone, preferred_time, message, status, consultant_id, notes, created_at) VALUES
(1, 3, 1, 'Rohan Singhania', '+91 98190 22334', 'Tomorrow 10:00 AM - 12:00 PM', 'Call to discuss stamp duty and registration timeline.', 'Assigned', 2, 'Scheduled call reminder set in calendar.', NOW() - INTERVAL 1 DAY),
(2, NULL, 5, 'Rajesh Jhunjhunwala', '+91 98205 33221', 'Evening after 6:00 PM', 'Urgent inquiry regarding Marine Grande top penthouse availability.', 'Contacted', 5, 'Spoke with client representative. Shared investor teaser pack.', NOW() - INTERVAL 2 DAY)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ----------------------------------------------------------------------------
-- 13. CRM LEADS
-- ----------------------------------------------------------------------------
INSERT INTO leads (id, customer_id, name, email, phone, property_id, source, status, deal_value, assigned_consultant_id, last_follow_up, next_follow_up, created_at) VALUES
(1, 3, 'Rohan Singhania', 'customer@example.com', '+91 98190 22334', 1, 'site_visit', 'Site Visit Scheduled', 185000000.00, 2, NOW() - INTERVAL 1 DAY, NOW() + INTERVAL 2 DAY, NOW() - INTERVAL 5 DAY),
(2, 4, 'Priya Sharma', 'priya.sharma@example.com', '+91 98330 44556', 3, 'enquiry', 'Qualified', 29500000.00, 2, NOW() - INTERVAL 1 DAY, NOW() + INTERVAL 1 DAY, NOW() - INTERVAL 3 DAY),
(3, NULL, 'Vikram Oberoi', 'vikram.oberoi@investcorp.in', '+91 98200 11998', 4, 'site_visit', 'Negotiation', 245000000.00, 2, NOW() - INTERVAL 2 DAY, NOW() + INTERVAL 1 DAY, NOW() - INTERVAL 6 DAY),
(4, NULL, 'Deepak Kothari', 'kothari.offices@rediffmail.com', '+91 98210 77665', 7, 'enquiry', 'New', 75000000.00, 2, NULL, NOW() + INTERVAL 4 HOUR, NOW() - INTERVAL 4 HOUR),
(5, NULL, 'Anand Mahindra Family Office', 'wealth@anandfamilyoffice.com', '+91 98208 00011', 8, 'direct', 'Converted', 420000000.00, 5, NOW() - INTERVAL 10 DAY, NULL, NOW() - INTERVAL 30 DAY)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ----------------------------------------------------------------------------
-- 14. LEAD NOTES
-- ----------------------------------------------------------------------------
INSERT INTO lead_notes (id, lead_id, author_id, note, created_at) VALUES
(1, 1, 2, 'Spoke with Rohan Singhania. Budget is firm between ₹18-20 Cr. Prefers 18th floor or higher for unhindered sea horizon.', NOW() - INTERVAL 2 DAY),
(2, 1, 2, 'Confirmed site visit for family architect. Arranged master layout drawing set with developer.', NOW() - INTERVAL 1 DAY),
(3, 3, 2, 'Site visit completed successfully. Client wants customized payment plan linked to slab casting.', NOW() - INTERVAL 2 DAY)
ON DUPLICATE KEY UPDATE note=VALUES(note);

-- ----------------------------------------------------------------------------
-- 15. FOLLOW-UPS
-- ----------------------------------------------------------------------------
INSERT INTO follow_ups (id, lead_id, consultant_id, scheduled_at, follow_up_type, notes, status, created_at) VALUES
(1, 1, 2, NOW() + INTERVAL 2 DAY, 'site_visit', 'Conduct escorted Carter Road property walkthrough with family architect.', 'scheduled', NOW() - INTERVAL 1 DAY),
(2, 2, 2, NOW() + INTERVAL 1 DAY, 'call', 'Share Hiranandani Powai comparative carpet area analysis sheet.', 'scheduled', NOW() - INTERVAL 1 DAY),
(3, 3, 2, NOW() + INTERVAL 1 DAY, 'meeting', 'Meet client counsel at Worli office to review draft term sheet.', 'scheduled', NOW() - INTERVAL 1 DAY)
ON DUPLICATE KEY UPDATE notes=VALUES(notes);

-- ----------------------------------------------------------------------------
-- 16. PROJECT STATUS (Timeline tracking)
-- Stages: Upcoming -> Launching Soon -> Launched -> Under Construction -> Possession -> Ready to Move
-- ----------------------------------------------------------------------------
INSERT INTO project_status (id, property_id, stage, completion_percentage, target_date, notes, updated_by_user_id, created_at) VALUES
(1, 4, 'Under Construction', 72, 'December 2026', 'Tower superstructure RCC casting complete up to 48th slab. External glazing work initiated.', 1, NOW() - INTERVAL 15 DAY),
(2, 6, 'Under Construction', 45, 'June 2027', 'Podium clubhouse level completed; typical residential floor slabs progressing on 12-day cycle.', 1, NOW() - INTERVAL 20 DAY),
(3, 1, 'Ready to Move', 100, 'Immediate', 'Occupation Certificate (OC) received. Finishing touches and private foyer fit-outs underway.', 1, NOW() - INTERVAL 60 DAY)
ON DUPLICATE KEY UPDATE notes=VALUES(notes);

-- ----------------------------------------------------------------------------
-- 17. AUDIT LOGS
-- ----------------------------------------------------------------------------
INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address, created_at) VALUES
(1, 1, 'SYSTEM_INIT', 'DATABASE', 1, 'HOMES2OWN Mumbai database seed executed successfully with production schemas.', '127.0.0.1', NOW() - INTERVAL 1 DAY),
(2, 1, 'PUBLISH_PROPERTY', 'PROPERTY', 1, 'Published Bandra Sea Front Residences to live discovery catalog.', '127.0.0.1', NOW() - INTERVAL 1 DAY),
(3, 2, 'UPDATE_LEAD_STATUS', 'LEAD', 1, 'Status updated from New to Site Visit Scheduled.', '127.0.0.1', NOW() - INTERVAL 1 DAY);
