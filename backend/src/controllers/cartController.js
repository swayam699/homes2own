const db = require('../config/db');

/**
 * Helper to ensure a cart exists for a user and return it
 */
const getOrCreateCart = async (userId) => {
  let [carts] = await db.query('SELECT * FROM carts WHERE user_id = ?', [userId]);
  if (carts.length === 0) {
    const [result] = await db.query('INSERT INTO carts (user_id) VALUES (?)', [userId]);
    [carts] = await db.query('SELECT * FROM carts WHERE id = ?', [result.insertId]);
  }
  return carts[0];
};

/**
 * Get user cart with item details and calculated totals
 * GET /api/cart
 */
const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cart = await getOrCreateCart(userId);

    const [items] = await db.query(
      `SELECT ci.id, ci.cart_id, ci.menu_item_id, ci.quantity, ci.unit_price,
              m.name, m.description, m.price, m.image_url, m.is_veg, m.is_available,
              r.id as restaurant_id, r.name as restaurant_name, r.delivery_time_min, r.delivery_time_max
       FROM cart_items ci
       JOIN menu_items m ON ci.menu_item_id = m.id
       JOIN restaurants r ON m.restaurant_id = r.id
       WHERE ci.cart_id = ?
       ORDER BY ci.id ASC`,
      [cart.id]
    );

    let restaurant = null;
    let subtotal = 0;

    if (items.length > 0) {
      restaurant = {
        id: items[0].restaurant_id,
        name: items[0].restaurant_name,
        deliveryTime: `${items[0].delivery_time_min}-${items[0].delivery_time_max} mins`,
      };

      subtotal = items.reduce((acc, item) => acc + item.quantity * item.unit_price, 0);
    }

    const deliveryFee = subtotal > 0 ? (subtotal >= 400 ? 0 : 40.0) : 0;
    const taxAmount = Number((subtotal * 0.05).toFixed(2)); // 5% GST
    const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);

    res.json({
      success: true,
      data: {
        cartId: cart.id,
        restaurant,
        items,
        totalCount,
        subtotal: Number(subtotal.toFixed(2)),
        deliveryFee,
        taxAmount,
        estimatedTotal: Number((subtotal + deliveryFee + taxAmount).toFixed(2)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add item to cart
 * POST /api/cart/items
 * Body: { menuItemId, quantity = 1, forceReset = false }
 */
const addToCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { menuItemId, quantity = 1, forceReset = false } = req.body;

    if (!menuItemId) {
      return res.status(400).json({
        success: false,
        message: 'Menu item ID is required.',
      });
    }

    // Fetch the menu item
    const [menuRows] = await db.query(
      `SELECT m.*, r.name as restaurant_name 
       FROM menu_items m 
       JOIN restaurants r ON m.restaurant_id = r.id 
       WHERE m.id = ?`,
      [menuItemId]
    );

    if (menuRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found.',
      });
    }

    const menuItem = menuRows[0];

    if (!menuItem.is_available) {
      return res.status(400).json({
        success: false,
        message: `"${menuItem.name}" is currently sold out.`,
      });
    }

    const cart = await getOrCreateCart(userId);

    // Check if cart already has items from a DIFFERENT restaurant
    if (cart.restaurant_id && cart.restaurant_id !== menuItem.restaurant_id) {
      if (!forceReset) {
        const [currRest] = await db.query('SELECT name FROM restaurants WHERE id = ?', [cart.restaurant_id]);
        const currentRestName = currRest.length > 0 ? currRest[0].name : 'another restaurant';

        return res.status(409).json({
          success: false,
          code: 'DIFFERENT_RESTAURANT',
          message: `Your cart contains items from "${currentRestName}". Discard current cart and start a new order with "${menuItem.restaurant_name}"?`,
          currentRestaurantName: currentRestName,
          newRestaurantName: menuItem.restaurant_name,
        });
      } else {
        // Clear old cart items and switch restaurant
        await db.query('DELETE FROM cart_items WHERE cart_id = ?', [cart.id]);
        await db.query('UPDATE carts SET restaurant_id = ? WHERE id = ?', [menuItem.restaurant_id, cart.id]);
      }
    } else if (!cart.restaurant_id) {
      await db.query('UPDATE carts SET restaurant_id = ? WHERE id = ?', [menuItem.restaurant_id, cart.id]);
    }

    // Check if item already exists in cart
    const [existingItem] = await db.query(
      'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND menu_item_id = ?',
      [cart.id, menuItemId]
    );

    const addQty = Math.max(1, parseInt(quantity, 10) || 1);

    if (existingItem.length > 0) {
      const newQty = existingItem[0].quantity + addQty;
      await db.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQty, existingItem[0].id]);
    } else {
      await db.query(
        'INSERT INTO cart_items (cart_id, menu_item_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
        [cart.id, menuItemId, addQty, menuItem.price]
      );
    }

    // Return updated cart
    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
};

/**
 * Update quantity of a cart item
 * PUT /api/cart/items/:id
 * Body: { quantity }
 */
const updateCartItemQuantity = async (req, res, next) => {
  try {
    const { id } = req.params; // cart_item_id
    const { quantity } = req.body;
    const userId = req.user.id;

    const cart = await getOrCreateCart(userId);

    const [existing] = await db.query('SELECT * FROM cart_items WHERE id = ? AND cart_id = ?', [id, cart.id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found.',
      });
    }

    const newQty = parseInt(quantity, 10);

    if (newQty <= 0) {
      // Remove item
      await db.query('DELETE FROM cart_items WHERE id = ?', [id]);
    } else {
      await db.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQty, id]);
    }

    // If no items remain, reset cart's restaurant_id
    const [remaining] = await db.query('SELECT COUNT(*) as count FROM cart_items WHERE cart_id = ?', [cart.id]);
    if (remaining[0].count === 0) {
      await db.query('UPDATE carts SET restaurant_id = NULL WHERE id = ?', [cart.id]);
    }

    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
};

/**
 * Remove specific item from cart
 * DELETE /api/cart/items/:id
 */
const removeCartItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const cart = await getOrCreateCart(userId);

    await db.query('DELETE FROM cart_items WHERE id = ? AND cart_id = ?', [id, cart.id]);

    const [remaining] = await db.query('SELECT COUNT(*) as count FROM cart_items WHERE cart_id = ?', [cart.id]);
    if (remaining[0].count === 0) {
      await db.query('UPDATE carts SET restaurant_id = NULL WHERE id = ?', [cart.id]);
    }

    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
};

/**
 * Clear all items from cart
 * DELETE /api/cart
 */
const clearCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cart = await getOrCreateCart(userId);

    await db.query('DELETE FROM cart_items WHERE cart_id = ?', [cart.id]);
    await db.query('UPDATE carts SET restaurant_id = NULL WHERE id = ?', [cart.id]);

    res.json({
      success: true,
      message: 'Cart cleared successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
};
