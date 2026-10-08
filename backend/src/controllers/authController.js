const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const { generateToken } = require('../config/jwt');
const { validateEmail } = require('../middleware/validate');

/**
 * Register a new customer
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
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
        message: 'Password must be at least 6 characters.',
      });
    }

    // Check if user already exists
    const [existing] = await query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing && existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Hash password (salt rounds 10)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Default registration is strictly role: 'customer' (admin/consultant cannot be self-registered)
    const [result] = await query(
      `INSERT INTO users (name, email, password_hash, phone, role) 
       VALUES (?, ?, ?, ?, 'customer')`,
      [name.trim(), email.toLowerCase().trim(), passwordHash, phone ? phone.trim() : null]
    );

    const userId = result.insertId;

    const user = {
      id: userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone || null,
      role: 'customer',
      avatar_url: null,
    };

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Welcome to HOMES2OWN.',
      token,
      user,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * User login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const [rows] = await query(
      `SELECT id, name, email, password_hash, phone, role, avatar_url, is_active,
              preferred_locations, preferred_configurations, min_budget, max_budget
       FROM users WHERE email = ?`,
      [email.toLowerCase().trim()]
    );

    if (!rows || rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.',
      });
    }

    const user = rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact HOMES2OWN administration.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.',
      });
    }

    // Safe user payload (never return password hash)
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar_url: user.avatar_url,
      preferred_locations: user.preferred_locations,
      preferred_configurations: user.preferred_configurations,
      min_budget: user.min_budget,
      max_budget: user.max_budget,
    };

    const token = generateToken(safeUser);

    res.json({
      success: true,
      message: 'Signed in successfully.',
      token,
      user: safeUser,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Logout acknowledgment
 */
const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Signed out successfully from HOMES2OWN.',
  });
};

/**
 * Get current authenticated user
 */
const getMe = async (req, res, next) => {
  try {
    const [rows] = await query(
      `SELECT id, name, email, phone, role, avatar_url, is_active,
              preferred_locations, preferred_configurations, min_budget, max_budget, created_at
       FROM users WHERE id = ?`,
      [req.user.id]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    res.json({
      success: true,
      user: rows[0],
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
};
