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
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'food_ordering_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

/**
 * Initialize SQLite database with normalized tables and seed data
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
      console.warn('[Database] Could not create target directory, falling back to /tmp:', e.message);
      targetPath = path.resolve('/tmp', 'food_ordering.sqlite');
    }

    const db = new sqlite3.Database(targetPath, (err) => {
      if (err) return reject(err);
      
      // Register custom functions for MySQL compatibility
      try {
        db.run('PRAGMA foreign_keys = ON;');
      } catch (e) {
        console.warn('Could not set PRAGMA foreign_keys', e);
      }

      // Check if users table exists; if not, bootstrap schema and seed
      db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
        if (err) return reject(err);
        if (!row) {
          console.log('[Database] Bootstrapping SQLite schema and demo data...');
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
 * Create SQLite schema and seed realistic demo records
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
          address TEXT,
          city TEXT DEFAULT 'Mumbai',
          is_active INTEGER NOT NULL DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 2. Restaurants
      db.run(`
        CREATE TABLE IF NOT EXISTS restaurants (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          slug TEXT NOT NULL UNIQUE,
          description TEXT,
          address TEXT NOT NULL,
          city TEXT NOT NULL DEFAULT 'Mumbai',
          phone TEXT,
          rating REAL NOT NULL DEFAULT 4.5,
          total_ratings INTEGER NOT NULL DEFAULT 120,
          delivery_time_min INTEGER NOT NULL DEFAULT 25,
          delivery_time_max INTEGER NOT NULL DEFAULT 35,
          price_for_two REAL NOT NULL DEFAULT 400.00,
          cuisine_types TEXT NOT NULL,
          image_url TEXT,
          banner_url TEXT,
          is_active INTEGER NOT NULL DEFAULT 1,
          is_featured INTEGER NOT NULL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 3. Menu Categories
      db.run(`
        CREATE TABLE IF NOT EXISTS menu_categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          restaurant_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          display_order INTEGER NOT NULL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
        );
      `);

      // 4. Menu Items
      db.run(`
        CREATE TABLE IF NOT EXISTS menu_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          restaurant_id INTEGER NOT NULL,
          category_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          price REAL NOT NULL,
          image_url TEXT,
          is_veg INTEGER NOT NULL DEFAULT 1,
          is_available INTEGER NOT NULL DEFAULT 1,
          is_popular INTEGER NOT NULL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
          FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE
        );
      `);

      // 5. Carts
      db.run(`
        CREATE TABLE IF NOT EXISTS carts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL UNIQUE,
          restaurant_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE SET NULL
        );
      `);

      // 6. Cart Items
      db.run(`
        CREATE TABLE IF NOT EXISTS cart_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          cart_id INTEGER NOT NULL,
          menu_item_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 1,
          unit_price REAL NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
          FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
          UNIQUE(cart_id, menu_item_id)
        );
      `);

      // 7. Coupons
      db.run(`
        CREATE TABLE IF NOT EXISTS coupons (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          code TEXT NOT NULL UNIQUE,
          description TEXT,
          discount_type TEXT NOT NULL DEFAULT 'percentage',
          discount_value REAL NOT NULL,
          min_order_amount REAL NOT NULL DEFAULT 0.00,
          max_discount REAL NOT NULL DEFAULT 500.00,
          is_active INTEGER NOT NULL DEFAULT 1,
          expires_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 8. Orders
      db.run(`
        CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_number TEXT NOT NULL UNIQUE,
          user_id INTEGER NOT NULL,
          restaurant_id INTEGER NOT NULL,
          subtotal REAL NOT NULL,
          delivery_fee REAL NOT NULL DEFAULT 40.00,
          tax_amount REAL NOT NULL DEFAULT 0.00,
          discount_amount REAL NOT NULL DEFAULT 0.00,
          total_amount REAL NOT NULL,
          coupon_code TEXT,
          status TEXT NOT NULL DEFAULT 'placed',
          delivery_address TEXT NOT NULL,
          customer_phone TEXT NOT NULL,
          notes TEXT,
          estimated_delivery_time TEXT DEFAULT '30-40 mins',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE RESTRICT
        );
      `);

      // 9. Order Items
      db.run(`
        CREATE TABLE IF NOT EXISTS order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          menu_item_id INTEGER,
          item_name TEXT NOT NULL,
          quantity INTEGER NOT NULL,
          unit_price REAL NOT NULL,
          total_price REAL NOT NULL,
          is_veg INTEGER NOT NULL DEFAULT 1,
          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
          FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE SET NULL
        );
      `);

      // 10. Payments
      db.run(`
        CREATE TABLE IF NOT EXISTS payments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          payment_method TEXT NOT NULL,
          payment_status TEXT NOT NULL DEFAULT 'pending',
          transaction_id TEXT UNIQUE,
          amount REAL NOT NULL,
          payment_details TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `);

      // 11. Order Tracking
      db.run(`
        CREATE TABLE IF NOT EXISTS order_tracking (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          status TEXT NOT NULL,
          status_label TEXT NOT NULL,
          description TEXT,
          updated_by_user_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
          FOREIGN KEY (updated_by_user_id) REFERENCES users(id) ON DELETE SET NULL
        );
      `);

      // Insert Demo Seeds
      const pwd = '$2a$10$bwxZtNLOge/fssZNsMOjKeozjEcamgJ.i4W5feiwdlGot5jXKUsUq'; // Password123!
      db.run(`INSERT OR IGNORE INTO users (id, name, email, password_hash, phone, role, address, city) VALUES
        (1, 'System Administrator', 'admin@example.com', '${pwd}', '+91 99999 88888', 'admin', 'HQ Floor 12, Cyber One Tech Park, Mumbai', 'Mumbai'),
        (2, 'Aarav Sharma', 'customer@example.com', '${pwd}', '+91 98765 43210', 'customer', 'Flat 402, Sea Breeze Heights, Hill Road, Bandra West', 'Mumbai'),
        (3, 'Chef Vikram Mehra', 'restaurant@example.com', '${pwd}', '+91 98200 11223', 'restaurant_admin', 'Shop 4, Linking Road, Bandra West', 'Mumbai'),
        (4, 'Priya Patel', 'priya@example.com', '${pwd}', '+91 91234 56789', 'customer', 'Apartment 12B, Windsor Grand, Powai', 'Mumbai');
      `);

      db.run(`INSERT OR IGNORE INTO restaurants (id, name, slug, description, address, city, phone, rating, total_ratings, delivery_time_min, delivery_time_max, price_for_two, cuisine_types, image_url, banner_url, is_active, is_featured) VALUES
        (1, 'Mumbai Spice', 'mumbai-spice', 'Authentic royal Mughlai curries, fragrant Hyderabadi biryanis, and succulent charcoal tikkas made with heritage recipes.', 'Plot 22, Linking Road, Bandra West', 'Mumbai', '+91 22 2640 1122', 4.7, 420, 25, 35, 600.00, 'Indian, Biryani, Mughlai', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80', 1, 1),
        (2, 'Urban Tadka', 'urban-tadka', 'Homestyle North Indian comfort food, rich creamy gravies, smoky clay-oven breads, and wholesome thalis.', 'Shop 8, Hiranandani Gardens, Powai', 'Mumbai', '+91 22 2570 3344', 4.5, 310, 30, 40, 500.00, 'Indian, Punjabi, North Indian', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80', 1, 1),
        (3, 'Burger House', 'burger-house', 'Gourmet handcrafted smash burgers with artisanal brioche buns, melted cheddar, and secret signature sauces.', '14th Road, Khar West', 'Mumbai', '+91 22 2600 5566', 4.6, 580, 20, 30, 450.00, 'Burgers, American, Fast Food', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80', 1, 1),
        (4, 'Pizza District', 'pizza-district', 'Artisanal Neapolitan thin-crust woodfired pizzas, handmade pasta, and fresh Italian burrata appetisers.', 'B-Wing, High Street Phoenix, Lower Parel', 'Mumbai', '+91 22 2490 7788', 4.8, 690, 25, 35, 750.00, 'Pizza, Italian, Pasta', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=1200&q=80', 1, 1),
        (5, 'Green Bowl', 'green-bowl', 'Nourishing cold-pressed bowls, avocado toasts, high-protein quinoa salads, and fresh tropical fruit smoothies.', 'Ground Floor, Maker Maxity, BKC', 'Mumbai', '+91 22 2650 9900', 4.4, 280, 20, 30, 550.00, 'Healthy, Salads, Bowls, Beverages', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80', 1, 1);
      `);

      db.run(`INSERT OR IGNORE INTO menu_categories (id, restaurant_id, name, display_order) VALUES
        (1, 1, 'Dum Biryani Specials', 1),
        (2, 1, 'Tandoori & Starters', 2),
        (3, 1, 'Royal Curries', 3),
        (4, 1, 'Breads & Accompaniments', 4),
        (5, 1, 'Beverages & Desserts', 5),
        (6, 2, 'Popular Starters', 1),
        (7, 2, 'Main Course Gravies', 2),
        (8, 2, 'Dal & Rice', 3),
        (9, 2, 'Lassi & Drinks', 4),
        (10, 3, 'Signature Gourmet Burgers', 1),
        (11, 3, 'Crispy Sides & Fries', 2),
        (12, 3, 'Thick Milkshakes', 3),
        (13, 4, 'Woodfired Classic Pizzas', 1),
        (14, 4, 'Artisan Special Pizzas', 2),
        (15, 4, 'Pasta & Garlic Breads', 3),
        (16, 4, 'Gelato & Beverages', 4),
        (17, 5, 'Superfood Salad Bowls', 1),
        (18, 5, 'Warm Grain Bowls', 2),
        (19, 5, 'Cold Pressed Juices & Smoothies', 3);
      `);

      db.run(`INSERT OR IGNORE INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_veg, is_available, is_popular) VALUES
        (1, 1, 1, 'Awadhi Dum Biryani (Chicken)', 'Fragrant aged basmati rice cooked on slow dum with tender chicken, whole spices, saffron, and fried onions.', 380.00, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=500&q=80', 0, 1, 1),
        (2, 1, 1, 'Hyderabadi Paneer Biryani', 'Layered saffron rice infused with marinated cottage cheese cubes, mint, and caramelized brown shallots.', 320.00, 'https://images.unsplash.com/photo-1642821373181-696a54913e9a?auto=format&fit=crop&w=500&q=80', 1, 1, 1),
        (3, 1, 2, 'Paneer Tikka Angara', 'Charred cottage cheese cubes marinated in Kashmiri red chili paste, hung yogurt, and mustard oil.', 290.00, 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=500&q=80', 1, 1, 1),
        (4, 1, 2, 'Murgh Malai Kebab', 'Creamy boneless chicken morsels infused with green cardamom, cheddar cheese, and fresh coriander root.', 360.00, 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=500&q=80', 0, 1, 0),
        (5, 1, 3, 'Butter Chicken Aslam Style', 'Smoked shredded tandoori chicken simmered in rich satin smooth tomato and butter gravy with fenugreek.', 410.00, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=500&q=80', 0, 1, 1),
        (6, 1, 3, 'Dal Makhani Bukhara', 'Overnight slow-simmered black lentils cooked with vine tomatoes, churned white butter, and aromatic spices.', 280.00, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=500&q=80', 1, 1, 1),
        (7, 1, 4, 'Garlic Butter Naan', 'Clay-oven leavened bread brushed generously with crushed garlic and warm dairy butter.', 75.00, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=500&q=80', 1, 1, 1),
        (8, 1, 5, 'Shahi Gulab Jamun (2 Pcs)', 'Melt-in-mouth milk dumplings soaked in saffron and rose infused green cardamom syrup.', 120.00, 'https://images.unsplash.com/photo-1605197143984-7a3b4c1064eb?auto=format&fit=crop&w=500&q=80', 1, 1, 0),
        (9, 2, 6, 'Dahi Ke Kebab', 'Silky hung yogurt patties spiced with ginger, green chillies, and crushed coriander seeds with crispy crust.', 260.00, 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=500&q=80', 1, 1, 1),
        (10, 2, 6, 'Amritsari Fish Fry', 'Crispy carom-seed spiced surmai fillet chunks battered in gram flour and served with radish salad.', 390.00, 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&w=500&q=80', 0, 1, 1),
        (11, 2, 7, 'Kadhai Paneer Dhaba Style', 'Cottage cheese batons tossed with bell peppers, crushed coriander, dried red chillies, and onion gravy.', 310.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=500&q=80', 1, 1, 0),
        (12, 2, 8, 'Jeera Basmati Rice', 'Fragrant long-grain basmati tempered with ghee-roasted cumin seeds and fresh cilantro.', 160.00, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=500&q=80', 1, 1, 0),
        (13, 2, 9, 'Patiala Sweet Lassi', 'Traditional creamy thick yogurt beverage topped with rich clotted malai and crushed pistachios.', 110.00, 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=500&q=80', 1, 1, 1),
        (14, 3, 10, 'Truffle Smash Cheeseburger', 'Double grilled prime patties, melted aged cheddar, caramelized shallots, and house truffle aioli on toasted brioche.', 340.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80', 0, 1, 1),
        (15, 3, 10, 'Crispy Buffalo Chicken Burger', 'Buttermilk battered crispy fried chicken dipped in spicy cayenne butter with cool ranch and shredded iceberg.', 290.00, 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=500&q=80', 0, 1, 1),
        (16, 3, 10, 'Smoked Portobello & Cheddar Burger', 'Herb-roasted portobello mushroom cap, smoked scamorza cheese, arugula, and roasted garlic emulsion.', 280.00, 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=80', 1, 1, 0),
        (17, 3, 11, 'Peri Peri Seasoned Skinny Fries', 'Double-fried hand-cut golden potatoes tossed in house blend fiery peri-peri dust with cheese dip.', 150.00, 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=500&q=80', 1, 1, 1),
        (18, 3, 12, 'Belgian Dark Chocolate Shake', 'Velvety shake blended with 70% dark Belgian cocoa ganache, chocolate fudge, and whole milk.', 190.00, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=500&q=80', 1, 1, 1),
        (19, 4, 13, 'Margherita Verace D.O.P.', 'San Marzano tomato base, fresh buffalo mozzarella, fragrant Genovese basil leaves, and extra virgin olive oil.', 440.00, 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=500&q=80', 1, 1, 1),
        (20, 4, 13, 'Pepperoni & Smoked Bacon', 'Artisan spicy cured pepperoni, house-smoked pancetta, crushed hot peppers, and whole milk mozzarella.', 580.00, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=500&q=80', 0, 1, 1),
        (21, 4, 14, 'Quattro Formaggi & Truffle Honey', 'Gorgonzola, fontina, provolone, and parmesan finished with white truffle flower honey.', 520.00, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80', 1, 1, 1),
        (22, 4, 15, 'Creamy Fettuccine Alfredo', 'Bronze-cut handmade fettuccine in emulsion of cultured butter, 24-month parmigiano reggiano, and black pepper.', 390.00, 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=500&q=80', 1, 1, 0),
        (23, 4, 15, 'Artisan Pull-Apart Garlic Bread', 'Sourdough loaf baked with roasted garlic herb butter, bubbling mozzarella, and rosemary sprigs.', 210.00, 'https://images.unsplash.com/photo-1619895092538-128341789043?auto=format&fit=crop&w=500&q=80', 1, 1, 1),
        (24, 5, 17, 'Avocado Goddess Bowl', 'Organic baby spinach, Haas avocado, marinated chickpeas, cherry tomatoes, cucumbers, and tahini green dressing.', 330.00, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=80', 1, 1, 1),
        (25, 5, 17, 'Warm Mediterranean Quinoa Salad', 'Fluffy tricolor quinoa, kalamata olives, crisp bell peppers, feta crumbles, and lemon oregano vinaigrette.', 310.00, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=500&q=80', 1, 1, 0),
        (26, 5, 18, 'Grilled Teriyaki Tofu Bowl', 'Brown rice, grilled organic tofu, steamed broccoli florets, edamame beans, and toasted sesame teriyaki glaze.', 340.00, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80', 1, 1, 1),
        (27, 5, 19, 'Cold-Pressed Green Detox Juice', 'Pure cold pressed celery, green apple, cucumber, kale, ginger, and Meyer lemon. No added sugar.', 180.00, 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=500&q=80', 1, 1, 1);
      `);

      db.run(`INSERT OR IGNORE INTO coupons (id, code, description, discount_type, discount_value, min_order_amount, max_discount, is_active) VALUES
        (1, 'WELCOME50', 'Get 50% discount on your first order up to ₹150', 'percentage', 50.00, 200.00, 150.00, 1),
        (2, 'FEAST20', 'Flat 20% discount on any order above ₹400', 'percentage', 20.00, 400.00, 200.00, 1),
        (3, 'FREESHIP', 'Free delivery on all gourmet orders above ₹250', 'fixed', 40.00, 250.00, 40.00, 1);
      `);

      db.run(`INSERT OR IGNORE INTO orders (id, order_number, user_id, restaurant_id, subtotal, delivery_fee, tax_amount, discount_amount, total_amount, coupon_code, status, delivery_address, customer_phone, notes, estimated_delivery_time, created_at) VALUES
        (1, 'ORD-2026-1001', 2, 1, 660.00, 40.00, 33.00, 150.00, 583.00, 'WELCOME50', 'delivered', 'Flat 402, Sea Breeze Heights, Hill Road, Bandra West, Mumbai', '+91 98765 43210', 'Leave at door if unattended', 'Delivered in 28 mins', datetime('now', '-2 days')),
        (2, 'ORD-2026-1002', 4, 3, 530.00, 40.00, 26.50, 0.00, 596.50, NULL, 'delivered', 'Apartment 12B, Windsor Grand, Powai, Mumbai', '+91 91234 56789', 'Extra napkins please', 'Delivered in 24 mins', datetime('now', '-1 day')),
        (3, 'ORD-2026-1003', 2, 4, 730.00, 0.00, 36.50, 40.00, 726.50, 'FREESHIP', 'preparing', 'Flat 402, Sea Breeze Heights, Hill Road, Bandra West, Mumbai', '+91 98765 43210', 'Extra chili flakes packet', '20-25 mins', datetime('now'));
      `);

      db.run(`INSERT OR IGNORE INTO order_items (id, order_id, menu_item_id, item_name, quantity, unit_price, total_price, is_veg) VALUES
        (1, 1, 1, 'Awadhi Dum Biryani (Chicken)', 1, 380.00, 380.00, 0),
        (2, 1, 6, 'Dal Makhani Bukhara', 1, 280.00, 280.00, 1),
        (3, 2, 14, 'Truffle Smash Cheeseburger', 1, 340.00, 340.00, 0),
        (4, 2, 18, 'Belgian Dark Chocolate Shake', 1, 190.00, 190.00, 1),
        (5, 3, 19, 'Margherita Verace D.O.P.', 1, 440.00, 440.00, 1),
        (6, 3, 3, 'Paneer Tikka Angara', 1, 290.00, 290.00, 1);
      `);

      db.run(`INSERT OR IGNORE INTO payments (id, order_id, user_id, payment_method, payment_status, transaction_id, amount, payment_details, created_at) VALUES
        (1, 1, 2, 'upi', 'completed', 'UPI-TXN-984210491', 583.00, '{"vpa":"customer@okhdfcbank","provider":"GPay"}', datetime('now', '-2 days')),
        (2, 2, 4, 'card', 'completed', 'CARD-TXN-773120195', 596.50, '{"card_last4":"4242","network":"Visa"}', datetime('now', '-1 day')),
        (3, 3, 2, 'online', 'completed', 'NETB-TXN-551093821', 726.50, '{"gateway":"Simulated Netbanking","status":"Success"}', datetime('now'));
      `);

      db.run(`INSERT OR IGNORE INTO order_tracking (id, order_id, status, status_label, description, updated_by_user_id, created_at) VALUES
        (1, 1, 'placed', 'Order Placed', 'Order placed successfully by customer.', 2, datetime('now', '-2 days')),
        (2, 1, 'confirmed', 'Order Confirmed', 'Mumbai Spice confirmed your order.', 1, datetime('now', '-2 days')),
        (3, 1, 'preparing', 'Kitchen Preparing', 'Master chef is preparing your meal.', 1, datetime('now', '-2 days')),
        (4, 1, 'out_for_delivery', 'Out for Delivery', 'Rider Rahul is on the way with your food.', 1, datetime('now', '-2 days')),
        (5, 1, 'delivered', 'Order Delivered', 'Order handed over. Enjoy your meal!', 1, datetime('now', '-2 days')),
        (6, 3, 'placed', 'Order Placed', 'Order received and logged in system.', 2, datetime('now')),
        (7, 3, 'confirmed', 'Order Confirmed', 'Pizza District accepted your order.', 1, datetime('now')),
        (8, 3, 'preparing', 'Kitchen Preparing', 'Pizzas are baking in the 450°C woodfire oven.', 1, datetime('now'));
      `, (err) => {
        if (err) return reject(err);
        console.log('[Database] SQLite tables initialized with demo records.');
        resolve();
      });
    });
  });
};

/**
 * Establish database connection (MySQL primary, SQLite fallback)
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
        console.log('[Database] Connected successfully to MySQL Server!');
        return 'mysql';
      }
    } catch (err) {
      console.warn(`[Database] MySQL connection failed (${err.message}). Activating built-in SQLite engine...`);
    }
  }

  // Fallback to SQLite
  const sqliteFile = path.resolve(__dirname, '../../../database/food_ordering.sqlite');
  sqliteDb = await initSqlite(sqliteFile);
  currentClient = 'sqlite';
  console.log(`[Database] Active database: SQLite (${sqliteFile})`);
  return 'sqlite';
};

/**
 * Unified query method compatible with mysql2 [rows, fields] signature
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
