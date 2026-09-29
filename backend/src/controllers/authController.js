const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { generateToken } = require('../config/jwt');
const { validateEmail } = require('../middleware/validate');

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, address, city } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.',
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Check existing email
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Default role is customer
    const role = 'customer';

    const [result] = await db.query(
      `INSERT INTO users (name, email, password_hash, phone, role, address, city)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name.trim(), email.toLowerCase().trim(), passwordHash, phone || null, role, address || null, city || 'Mumbai']
    );

    const userId = result.insertId;

    // Create user cart record
    await db.query('INSERT OR IGNORE INTO carts (user_id) VALUES (?)', [userId]).catch(async () => {
      // For MySQL syntax if INSERT OR IGNORE doesn't match:
      try {
        await db.query('INSERT IGNORE INTO carts (user_id) VALUES (?)', [userId]);
      } catch (e) {
        // Ignored
      }
    });

    const userPayload = {
      id: userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role,
      phone: phone || null,
      address: address || null,
      city: city || 'Mumbai',
    };

    const token = generateToken(userPayload);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: userPayload,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login existing user
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const user = users[0];

    // Check if account is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      city: user.city,
    };

    const token = generateToken(userPayload);

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: userPayload,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 * GET /api/users/profile
 */
const getProfile = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, phone, role, address, city, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    res.json({
      success: true,
      user: rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update current user profile
 * PUT /api/users/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, city } = req.body;

    await db.query(
      `UPDATE users 
       SET name = COALESCE(?, name),
           phone = COALESCE(?, phone),
           address = COALESCE(?, address),
           city = COALESCE(?, city)
       WHERE id = ?`,
      [name, phone, address, city, req.user.id]
    );

    const [rows] = await db.query(
      'SELECT id, name, email, phone, role, address, city, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: rows[0],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
};
