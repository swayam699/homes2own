import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useNotification();

  const [cart, setCart] = useState({
    cartId: null,
    restaurant: null,
    items: [],
    totalCount: 0,
    subtotal: 0,
    deliveryFee: 0,
    taxAmount: 0,
    estimatedTotal: 0,
  });

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Different restaurant conflict modal state
  const [conflictModal, setConflictModal] = useState({
    isOpen: false,
    currentRestaurantName: '',
    newRestaurantName: '',
    pendingMenuItemId: null,
    pendingQuantity: 1,
  });

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({
        cartId: null,
        restaurant: null,
        items: [],
        totalCount: 0,
        subtotal: 0,
        deliveryFee: 0,
        taxAmount: 0,
        estimatedTotal: 0,
      });
      return;
    }

    try {
      const res = await api.get('/api/cart');
      if (res.success && res.data) {
        setCart(res.data);
      }
    } catch (err) {
      console.warn('Failed to fetch cart:', err.message);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (menuItemId, quantity = 1, forceReset = false) => {
    if (!isAuthenticated) {
      showToast('Please sign in to add items to your cart.', 'error');
      return { requireAuth: true };
    }

    setLoading(true);
    try {
      const res = await api.post('/api/cart/items', {
        menuItemId,
        quantity,
        forceReset,
      });

      if (res.success && res.data) {
        setCart(res.data);
        showToast('Added to your basket!', 'success');
        return { success: true };
      }
    } catch (err) {
      if (err.data?.code === 'DIFFERENT_RESTAURANT') {
        // Trigger restaurant switch modal
        setConflictModal({
          isOpen: true,
          currentRestaurantName: err.data.currentRestaurantName,
          newRestaurantName: err.data.newRestaurantName,
          pendingMenuItemId: menuItemId,
          pendingQuantity: quantity,
        });
        return { conflict: true };
      }

      showToast(err.data?.message || err.message || 'Could not add item to cart.', 'error');
      return { error: true };
    } finally {
      setLoading(false);
    }
  };

  const resolveConflict = async (proceedWithSwitch) => {
    if (proceedWithSwitch && conflictModal.pendingMenuItemId) {
      await addToCart(conflictModal.pendingMenuItemId, conflictModal.pendingQuantity, true);
    }
    setConflictModal({
      isOpen: false,
      currentRestaurantName: '',
      newRestaurantName: '',
      pendingMenuItemId: null,
      pendingQuantity: 1,
    });
  };

  const updateQuantity = async (cartItemId, newQty) => {
    try {
      const res = await api.put(`/api/cart/items/${cartItemId}`, { quantity: newQty });
      if (res.success && res.data) {
        setCart(res.data);
      }
    } catch (err) {
      showToast(err.data?.message || 'Could not update quantity', 'error');
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      const res = await api.delete(`/api/cart/items/${cartItemId}`);
      if (res.success && res.data) {
        setCart(res.data);
        showToast('Item removed from basket.', 'info');
      }
    } catch (err) {
      showToast(err.data?.message || 'Could not remove item', 'error');
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/api/cart');
      setCart({
        cartId: null,
        restaurant: null,
        items: [],
        totalCount: 0,
        subtotal: 0,
        deliveryFee: 0,
        taxAmount: 0,
        estimatedTotal: 0,
      });
      setAppliedCoupon(null);
      showToast('Cart cleared.', 'info');
    } catch (err) {
      showToast(err.data?.message || 'Could not clear cart', 'error');
    }
  };

  const applyCouponCode = async (code) => {
    if (!code || !code.trim()) {
      showToast('Please enter a coupon code.', 'error');
      return;
    }

    try {
      const res = await api.post('/api/coupons/apply', {
        code: code.trim(),
        subtotal: cart.subtotal,
      });

      if (res.success && res.data) {
        setAppliedCoupon(res.data);
        showToast(res.message, 'success');
        return res.data;
      }
    } catch (err) {
      showToast(err.data?.message || 'Invalid coupon code', 'error');
      throw err;
    }
  };

  const removeCouponCode = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed.', 'info');
  };

  // Grand total including coupon discount
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const grandTotal = Math.max(0, Number((cart.estimatedTotal - discountAmount).toFixed(2)));

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        totalCount: cart.totalCount,
        appliedCoupon,
        discountAmount,
        grandTotal,
        isCartOpen,
        setIsCartOpen,
        conflictModal,
        resolveConflict,
        fetchCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        applyCouponCode,
        removeCouponCode,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
